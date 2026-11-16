import bcrypt from 'bcrypt';
import redis from '../../config/redis.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { generateToken, hashToken, generateOtp } from '../../utils/crypto.js';
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../../utils/email.js';
import { createError } from '../../middleware/errorHandler.js';
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserEmailVerified,
  updateUserPassword,
  saveRefreshToken,
  claimRefreshToken,
  deleteAllUserRefreshTokens,
  upsertGoogleUser,
} from './auth.repository.js';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;
const EMAIL_VERIFY_EXPIRES = Number(process.env.EMAIL_VERIFY_EXPIRES) || 60; // minutes
const PASSWORD_RESET_EXPIRES = Number(process.env.PASSWORD_RESET_EXPIRES) || 15; // minutes

// ─── Redis key helpers ────────────────────────────────────────────────────────
const redisKey = {
  emailVerify: (hash) => `email_verify:${hash}`,
  passwordReset: (hash) => `pwd_reset:${hash}`,
  otp: (userId) => `otp:${userId}`,
  loginAttempts: (email) => `login_attempts:${email}`,
  tokenBlacklist: (jti) => `token_blacklist:${jti}`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const buildTokenPayload = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
});

const issueTokenPair = async (user, rememberMe = false) => {
  const payload = buildTokenPayload(user);

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Hash the refresh token for safe storage
  const tokenHash = hashToken(refreshToken);
  const expiryDays = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

  await saveRefreshToken({ userId: user.id, tokenHash, expiresAt });

  return { accessToken, refreshToken };
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerUser = async ({ name, email, phone, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw createError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await createUser({ name, email, phone, passwordHash });

  // Generate email verification token (raw → store hash in Redis)
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  await redis.setex(
    redisKey.emailVerify(tokenHash),
    EMAIL_VERIFY_EXPIRES * 60,
    user.id
  );

  // Send verification email (non-blocking — don't fail registration if email fails)
  sendEmailVerification(user.email, user.name, rawToken).catch((err) =>
    console.error('Email send failed:', err.message)
  );

  return { user };
};

// ─── Verify email ─────────────────────────────────────────────────────────────
export const verifyEmail = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  const redisKeyStr = redisKey.emailVerify(tokenHash);

  const userId = await redis.get(redisKeyStr);
  if (!userId) {
    throw createError('Verification link is invalid or has expired', 400);
  }

  const user = await findUserById(userId);
  if (!user) throw createError('User not found', 404);
  if (user.email_verified) throw createError('Email is already verified', 400);

  await updateUserEmailVerified(userId);
  await redis.del(redisKeyStr);

  return { message: 'Email verified successfully' };
};

// ─── Resend verification email ────────────────────────────────────────────────
export const resendVerificationEmail = async (email) => {
  const user = await findUserByEmail(email);
  // Always return 200 to prevent email enumeration
  if (!user || user.email_verified) return;

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  await redis.setex(
    redisKey.emailVerify(tokenHash),
    EMAIL_VERIFY_EXPIRES * 60,
    user.id
  );

  sendEmailVerification(user.email, user.name, rawToken).catch((err) =>
    console.error('Email resend failed:', err.message)
  );
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password, rememberMe = false }) => {
  // ── Brute-force guard ──
  const attemptsKey = redisKey.loginAttempts(email);
  const attempts = Number(await redis.get(attemptsKey)) || 0;
  if (attempts >= 5) {
    throw createError(
      'Too many failed login attempts. Please try again after 15 minutes.',
      429
    );
  }

  const user = await findUserByEmail(email);
  if (!user) {
    // Increment attempts even for non-existent emails (prevent user enumeration via timing)
    await redis.setex(attemptsKey, 15 * 60, attempts + 1);
    throw createError('Invalid email or password', 401);
  }

  if (!user.is_active) {
    throw createError('Your account has been deactivated. Please contact support.', 403);
  }

  // Check if Google-only account (no password set)
  if (user.password_hash.startsWith('google_oauth_')) {
    throw createError(
      'This account was registered with Google. Please sign in with Google.',
      400
    );
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    await redis.setex(attemptsKey, 15 * 60, attempts + 1);
    const remaining = 4 - attempts;
    throw createError(
      remaining > 0
        ? `Invalid email or password. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`
        : 'Invalid email or password',
      401
    );
  }

  // Clear failed attempts on success
  await redis.del(attemptsKey);

  const { accessToken, refreshToken } = await issueTokenPair(user, rememberMe);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    emailVerified: user.email_verified,
    avatarUrl: user.avatar_url,
  };

  return { user: safeUser, accessToken, refreshToken };
};

// ─── Refresh token ────────────────────────────────────────────────────────────
export const refreshAccessToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) throw createError('Refresh token missing', 401);

  // Verify JWT signature first (fast, no DB hit)
  try {
    verifyRefreshToken(rawRefreshToken);
  } catch {
    throw createError('Invalid or expired refresh token', 401);
  }

  // Atomically claim (DELETE) the token — only the first concurrent caller
  // gets a row back; any duplicate request gets null and is rejected cleanly.
  const tokenHash = hashToken(rawRefreshToken);
  const stored = await claimRefreshToken(tokenHash);

  if (!stored) throw createError('Refresh token not found or already used', 401);
  if (new Date(stored.expires_at) < new Date()) {
    // Already deleted by claimRefreshToken; just reject
    throw createError('Refresh token expired', 401);
  }

  if (stored.is_active === false) throw createError('Account deactivated', 403);

  const user = {
    id: stored.user_id,
    email: stored.email,
    role: stored.role,
  };

  const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(user);

  return { accessToken, refreshToken: newRefreshToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logoutUser = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await claimRefreshToken(tokenHash); // delete the token (return value ignored)
};

// ─── Logout all devices ───────────────────────────────────────────────────────
export const logoutAllDevices = async (userId) => {
  await deleteAllUserRefreshTokens(userId);
};

// ─── Forgot password ──────────────────────────────────────────────────────────
export const forgotPassword = async (email) => {
  const user = await findUserByEmail(email);
  // Always succeed to prevent email enumeration
  if (!user) return;

  if (user.password_hash.startsWith('google_oauth_')) return; // Google users can't reset password

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  await redis.setex(
    redisKey.passwordReset(tokenHash),
    PASSWORD_RESET_EXPIRES * 60,
    JSON.stringify({ userId: user.id, email: user.email })
  );

  sendPasswordResetEmail(user.email, user.name, rawToken).catch((err) =>
    console.error('Password reset email failed:', err.message)
  );
};

// ─── Reset password ───────────────────────────────────────────────────────────
export const resetPassword = async (rawToken, newPassword) => {
  const tokenHash = hashToken(rawToken);
  const redisKeyStr = redisKey.passwordReset(tokenHash);

  const stored = await redis.get(redisKeyStr);
  if (!stored) throw createError('Reset link is invalid or has expired', 400);

  const { userId } = JSON.parse(stored);
  const user = await findUserById(userId);
  if (!user) throw createError('User not found', 404);

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await updateUserPassword(userId, passwordHash);

  // Invalidate all sessions on password change
  await deleteAllUserRefreshTokens(userId);
  await redis.del(redisKeyStr);

  return { message: 'Password reset successfully' };
};

// ─── Change password (authenticated) ─────────────────────────────────────────
export const changePassword = async (userId, currentPassword, newPassword) => {
  const { rows } = await (await import('../../config/database.js')).query(
    `SELECT password_hash FROM users WHERE id = $1`,
    [userId]
  );
  const user = rows[0];
  if (!user) throw createError('User not found', 404);

  if (user.password_hash.startsWith('google_oauth_')) {
    throw createError('Google accounts cannot change passwords here. Use Google account settings.', 400);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) throw createError('Current password is incorrect', 401);

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await updateUserPassword(userId, passwordHash);

  // Invalidate all other refresh tokens (re-login required on other devices)
  await deleteAllUserRefreshTokens(userId);
};

// ─── Google OAuth callback handler ───────────────────────────────────────────
export const handleGoogleCallback = async (googleProfile, rememberMe = false) => {
  const { id: googleId, displayName: name, emails, photos } = googleProfile;
  const email = emails[0]?.value;
  const avatarUrl = photos[0]?.value;

  if (!email) throw createError('Google account has no email address', 400);

  const { user, isNew } = await upsertGoogleUser({ name, email, avatarUrl, googleId });

  if (!user.is_active) {
    throw createError('Your account has been deactivated. Please contact support.', 403);
  }

  // Send welcome email to new Google users
  if (isNew) {
    sendWelcomeEmail(user.email, user.name).catch(() => {});
  }

  const { accessToken, refreshToken } = await issueTokenPair(user, rememberMe);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    emailVerified: user.email_verified,
    avatarUrl: user.avatar_url,
    isNew,
  };

  return { user: safeUser, accessToken, refreshToken };
};

// ─── Get current user ─────────────────────────────────────────────────────────
export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw createError('User not found', 404);
  return user;
};

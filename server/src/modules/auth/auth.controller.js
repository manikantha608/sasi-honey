import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  logoutAllDevices,
  refreshAccessToken,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  handleGoogleCallback,
  getCurrentUser,
} from './auth.service.js';

// ─── Cookie helpers ───────────────────────────────────────────────────────────
const REFRESH_COOKIE = 'rft'; // refresh-token cookie name

const setRefreshCookie = (res, token, rememberMe = false) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/api/auth', // limit cookie scope to auth routes
    maxAge: rememberMe
      ? 30 * 24 * 60 * 60 * 1000  // 30 days
      : 7 * 24 * 60 * 60 * 1000,  // 7 days
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/** POST /api/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { user } = await registerUser(req.body);
  sendSuccess(
    res,
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.email_verified,
      },
    },
    'Registration successful. Please check your email to verify your account.',
    201
  );
});

/** POST /api/auth/verify-email */
export const verifyEmailToken = asyncHandler(async (req, res) => {
  const result = await verifyEmail(req.body.token);
  sendSuccess(res, null, result.message);
});

/** POST /api/auth/resend-verification */
export const resendVerification = asyncHandler(async (req, res) => {
  await resendVerificationEmail(req.body.email);
  // Always succeed — do not reveal if email exists
  sendSuccess(res, null, 'If this email is registered and unverified, a new verification link has been sent.');
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const { user, accessToken, refreshToken } = await loginUser({ email, password, rememberMe });

  setRefreshCookie(res, refreshToken, rememberMe);

  sendSuccess(res, { user, accessToken }, 'Login successful');
});

/** POST /api/auth/refresh */
export const refresh = asyncHandler(async (req, res) => {
  // Prefer cookie, fall back to body (mobile clients)
  const rawToken = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
  const { accessToken, refreshToken } = await refreshAccessToken(rawToken);

  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { accessToken }, 'Token refreshed');
});

/** POST /api/auth/logout */
export const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
  await logoutUser(rawToken);
  clearRefreshCookie(res);
  sendSuccess(res, null, 'Logged out successfully');
});

/** POST /api/auth/logout-all */
export const logoutAll = asyncHandler(async (req, res) => {
  await logoutAllDevices(req.user.id);
  clearRefreshCookie(res);
  sendSuccess(res, null, 'Logged out from all devices');
});

/** POST /api/auth/forgot-password */
export const forgotPasswordHandler = asyncHandler(async (req, res) => {
  await forgotPassword(req.body.email);
  // Always 200 to prevent email enumeration
  sendSuccess(
    res,
    null,
    'If an account with that email exists, a password reset link has been sent.'
  );
});

/** POST /api/auth/reset-password */
export const resetPasswordHandler = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await resetPassword(token, password);
  sendSuccess(res, null, 'Password has been reset successfully. Please log in with your new password.');
});

/** POST /api/auth/change-password  (authenticated) */
export const changePasswordHandler = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await changePassword(req.user.id, currentPassword, newPassword);
  sendSuccess(res, null, 'Password changed successfully.');
});

/** GET /api/auth/me  (authenticated) */
export const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  sendSuccess(res, { user });
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

/**
 * GET /api/auth/google
 * Redirects to Google consent screen (handled by Passport middleware in routes).
 */

/**
 * GET /api/auth/google/callback
 * Passport middleware runs first, attaches req.user (Google profile).
 * We then call our service to upsert the user and issue tokens.
 */
export const googleCallback = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await handleGoogleCallback(req.user);

  setRefreshCookie(res, refreshToken);

  // Redirect to frontend with tokens — frontend should store accessToken in memory
  const redirectUrl = new URL(`${process.env.CLIENT_URL}/auth/callback`);
  redirectUrl.searchParams.set('token', accessToken);
  redirectUrl.searchParams.set('isNew', user.isNew ? '1' : '0');

  res.redirect(redirectUrl.toString());
});

/**
 * GET /api/auth/google/callback/mobile
 * For mobile/SPA clients that cannot handle redirects — returns JSON instead.
 */
export const googleCallbackJson = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await handleGoogleCallback(req.user);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { user, accessToken }, 'Google login successful');
});

import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token (hex string).
 * @param {number} bytes  Number of random bytes (default 32 → 64 hex chars)
 */
export const generateToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

/**
 * Hash a token with SHA-256 for storage.
 * We store hashes, never raw tokens, so a leaked DB cannot be used directly.
 */
export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

/**
 * Generate a numeric OTP of `length` digits.
 */
export const generateOtp = (length = 6) => {
  const max = 10 ** length;
  const min = 10 ** (length - 1);
  // Use crypto.randomInt for uniform distribution
  return String(crypto.randomInt(min, max));
};

/**
 * Constant-time comparison to prevent timing attacks.
 */
export const safeCompare = (a, b) => {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

import { Router } from 'express';
import passport from '../../config/passport.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from './auth.schema.js';
import {
  register,
  verifyEmailToken,
  resendVerification,
  login,
  refresh,
  logout,
  logoutAll,
  forgotPasswordHandler,
  resetPasswordHandler,
  changePasswordHandler,
  getMe,
  googleCallback,
  googleCallbackJson,
} from './auth.controller.js';

const router = Router();

// ─── Health ───────────────────────────────────────────────────────────────────
router.get('/health', (req, res) => res.json({ module: 'auth', status: 'ok' }));

// ─── Email / Password Auth ────────────────────────────────────────────────────

/** Register a new customer account */
router.post('/register', authLimiter, validate(registerSchema), register);

/** Verify email address via token */
router.post('/verify-email', validate(verifyEmailSchema), verifyEmailToken);

/** Resend email verification link */
router.post(
  '/resend-verification',
  authLimiter,
  validate(resendVerificationSchema),
  resendVerification
);

/** Login with email + password */
router.post('/login', authLimiter, validate(loginSchema), login);

/** Refresh access token using HttpOnly refresh-token cookie (or body) */
router.post('/refresh', refresh);

/** Logout (delete refresh token) */
router.post('/logout', logout);

/** Logout from ALL devices (requires authentication) */
router.post('/logout-all', authenticate, logoutAll);

// ─── Password Management ──────────────────────────────────────────────────────

/** Request password reset email */
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);

/** Reset password via token from email */
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  resetPasswordHandler
);

/** Change password (authenticated users only) */
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  changePasswordHandler
);

// ─── Current User ─────────────────────────────────────────────────────────────

/** Get the currently authenticated user's profile */
router.get('/me', authenticate, getMe);

// ─── Google OAuth ─────────────────────────────────────────────────────────────

/**
 * Step 1 — Redirect to Google consent screen
 * GET /api/auth/google
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account', // always show account picker
  })
);

/**
 * Step 2 — Google redirects back here after user consents
 * GET /api/auth/google/callback
 * → Redirects frontend to /auth/callback?token=...
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  googleCallback
);

/**
 * Step 2 (alternative) — For mobile / SPA clients that need JSON
 * GET /api/auth/google/callback/mobile
 */
router.get(
  '/google/callback/mobile',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  googleCallbackJson
);

export default router;

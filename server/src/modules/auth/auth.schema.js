import { z } from 'zod';

// ─── Password rule ─────────────────────────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(150)
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .max(255)
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional(),
  password: passwordSchema,
});

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

// ─── Forgot password ──────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

// ─── Reset password ───────────────────────────────────────────────────────────
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Change password (authenticated) ─────────────────────────────────────────
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'New password must differ from current password',
    path: ['newPassword'],
  });

// ─── Verify email ─────────────────────────────────────────────────────────────
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// ─── Resend verification ──────────────────────────────────────────────────────
export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

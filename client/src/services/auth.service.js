import api from './api.js';

export const authService = {
  /** Register new account */
  register: (data) => api.post('/auth/register', data),

  /** Login with email + password */
  login: (data) => api.post('/auth/login', data),

  /** Logout current session */
  logout: () => api.post('/auth/logout'),

  /** Logout from ALL devices */
  logoutAll: () => api.post('/auth/logout-all'),

  /** Silently refresh access token (cookie-based) */
  refresh: () => api.post('/auth/refresh'),

  /** Get current user */
  me: (config) => api.get('/auth/me', config),

  /** Request password reset email */
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  /** Reset password with token from email */
  resetPassword: (token, password, confirmPassword) =>
    api.post('/auth/reset-password', { token, password, confirmPassword }),

  /** Change password (authenticated) */
  changePassword: (currentPassword, newPassword, confirmPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword }),

  /** Verify email address */
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),

  /** Resend verification email */
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),

  /** Initiate Google OAuth (browser redirect) */
  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
  },
};

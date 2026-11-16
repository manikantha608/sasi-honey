import jwt from 'jsonwebtoken';
import { createError } from './errorHandler.js';

/**
 * Verifies the Bearer access token in the Authorization header.
 * Attaches the decoded payload to req.user: { id, email, role }
 *
 * Returns 401 if token is missing or invalid.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('Authentication required. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    next(err); // JWT errors handled by global error handler
  }
};

/**
 * Optional authentication — attaches req.user if a valid token is present,
 * but does NOT block the request if no token is provided.
 * Useful for routes that show different data for logged-in vs guest users.
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    req.user = null; // ignore invalid tokens in optional auth
  }
  next();
};

/**
 * Restricts access to users with one of the allowed roles.
 * Must be used AFTER authenticate middleware.
 *
 * @param  {...string} roles  Allowed roles, e.g. 'admin'
 *
 * @example
 *   router.delete('/products/:id', authenticate, authorize('admin'), deleteProduct)
 */
export const authorize = (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(createError('Authentication required.', 401));
    if (!roles.includes(req.user.role)) {
      return next(createError('You do not have permission to perform this action.', 403));
    }
    next();
  };

/**
 * Shorthand: authenticate + authorize('admin')
 */
export const adminOnly = [
  authenticate,
  authorize('admin'),
];

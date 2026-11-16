/**
 * Global error handler middleware.
 * Must be registered LAST in the Express middleware chain.
 */
export const errorHandler = (err, req, res, next) => {
  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // PostgreSQL unique constraint
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Resource already exists' });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referenced resource does not exist' });
  }

  // Application-defined errors (thrown with statusCode)
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV === 'development') {
    console.error('❌  Error:', err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Convenience factory for operational errors.
 */
export const createError = (message, statusCode = 500) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

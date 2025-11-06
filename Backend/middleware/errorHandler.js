const { AppError } = require('../utils/errors');

/**
 * Centralized error handler middleware
 * Handles all errors thrown in the application
 */
function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error for debugging (in production, use proper logging service)
  console.error('Error:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    error.message = `Duplicate value for ${target}. This resource already exists.`;
    error.statusCode = 409;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  }

  // Prisma foreign key constraint error
  if (err.code === 'P2003') {
    error.message = 'Invalid reference. Related resource does not exist.';
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token. Please login again.';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired. Please login again.';
    error.statusCode = 401;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map(e => e.message);
    error.message = messages.length ? messages.join(', ') : 'Validation failed';
    error.statusCode = 422;
  }

  // Default to 500 server error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Build error response
  const response = {
    success: false,
    error: message,
    statusCode,
  };

  // Include validation errors if present
  if (err.errors) {
    response.errors = err.errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * Wrapper for async route handlers to catch errors
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler for routes that don't exist
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
}

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
};

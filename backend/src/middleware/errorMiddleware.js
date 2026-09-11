const logger = require('../utils/logger');

/**
 * 404 Not Found handler for undefined API routes
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`[Unhandled Error] ${req.method} ${req.url}:`, err);

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  // In production, mask unhandled 500 errors to prevent leaking SQL or server internals
  let message = err.message || 'Internal Server Error';
  if (isProduction && statusCode === 500) {
    message = 'An unexpected internal server error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(!isProduction && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

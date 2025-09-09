const ApiError = require('../../../domain/exceptions/ApiError');
const httpStatus = require('http-status');
const config = require('../../../config');
const logger = require('../../../infrastructure/logging/logger');

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log the error for debugging
  if (config.env === 'development') {
    console.error('Error Stack:', err.stack);
  }

  // Handle specific error types
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new ApiError(
      httpStatus.BAD_REQUEST,
      'Validation Error',
      messages
    );
  } else if (err.name === 'JsonWebTokenError') {
    error = new ApiError(
      httpStatus.UNAUTHORIZED,
      'Invalid token. Please log in again.'
    );
  } else if (err.name === 'TokenExpiredError') {
    error = new ApiError(
      httpStatus.UNAUTHORIZED,
      'Your token has expired. Please log in again.'
    );
  } else if (err.name === 'SequelizeDatabaseError') {
    error = new ApiError(
      httpStatus.BAD_REQUEST,
      'Database error occurred',
      config.env === 'development' ? { details: err.message } : {}
    );
  } else if (!(error instanceof ApiError)) {
    // Handle other types of errors
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message);
  }

  // Log the error
  logger.error(`${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    status: error.statusCode,
    message: error.message,
    stack: config.env === 'development' ? error.stack : {},
    errors: error.errors,
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      user: req.user ? { id: req.user.id, role: req.user.role } : undefined,
    },
  });

  // Send error response
  const response = {
    status: 'error',
    message: error.message,
    ...(config.env === 'development' && { stack: error.stack }),
    ...(error.errors && { errors: error.errors }),
  };

  // Remove stack trace in production
  if (config.env === 'production' && !error.isOperational) {
    response.message = 'Something went wrong';
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;

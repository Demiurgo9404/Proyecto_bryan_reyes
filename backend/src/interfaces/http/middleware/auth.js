const jwt = require('jsonwebtoken');
const { User } = require('../../../domain/models');
const ApiError = require('../../../domain/exceptions/ApiError');
const config = require('../../../config');
const httpStatus = require('http-status');

/**
 * Authentication middleware to verify JWT token
 */
const auth = (roles = []) => {
  // Convert roles to array if it's a string
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    try {
      // Get token from header
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        // Extract token from 'Bearer <token>'
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies?.token) {
        // Get token from cookies
        token = req.cookies.token;
      }

      // Check if token exists
      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'No token provided. Authentication required.'
        );
      }

      // Verify token
      const decoded = jwt.verify(token, config.auth.jwt.secret);

      // Check if user still exists
      const currentUser = await User.findByPk(decoded.sub);
      if (!currentUser) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'The user belonging to this token no longer exists.'
        );
      }

      // Check if user is active
      if (currentUser.status !== 'active') {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'Your account has been deactivated. Please contact support.'
        );
      }

      // Check user role if roles are specified
      if (roles.length > 0 && !roles.includes(currentUser.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'You do not have permission to perform this action.'
        );
      }

      // Attach user to request object
      req.user = currentUser;
      res.locals.user = currentUser;

      next();
    } catch (error) {
      // Handle JWT errors
      if (error.name === 'JsonWebTokenError') {
        return next(
          new ApiError(
            httpStatus.UNAUTHORIZED,
            'Invalid token. Please log in again.'
          )
        );
      }
      if (error.name === 'TokenExpiredError') {
        return next(
          new ApiError(
            httpStatus.UNAUTHORIZED,
            'Your token has expired. Please log in again.'
          )
        );
      }
      next(error);
    }
  };
};

module.exports = auth;

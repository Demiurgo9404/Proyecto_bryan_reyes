const { validationResult } = require('express-validator');
const ApiError = require('../../../domain/exceptions/ApiError');
const httpStatus = require('http-status');

/**
 * Middleware to validate request data using express-validator
 * @param {Array} validations - Array of validation chains
 * @returns {Function} Express middleware function
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors = {};
    errors.array().forEach((error) => {
      if (!formattedErrors[error.param]) {
        formattedErrors[error.param] = [];
      }
      formattedErrors[error.param].push(error.msg);
    });

    // Throw validation error
    next(
      new ApiError(
        httpStatus.UNPROCESSABLE_ENTITY,
        'Validation failed',
        formattedErrors
      )
    );
  };
};

/**
 * Middleware to validate request body against a Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });

    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        const path = detail.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(detail.message);
      });

      return next(
        new ApiError(
          httpStatus.UNPROCESSABLE_ENTITY,
          'Validation failed',
          errors
        )
      );
    }

    // Replace req.body with the validated value
    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  validateSchema,
};

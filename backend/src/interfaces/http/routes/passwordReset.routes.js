const express = require('express');
const { body } = require('express-validator');
const passwordResetController = require('../controllers/passwordReset.controller');
const validate = require('../../middleware/validate');

const router = express.Router();

// Validation rules
const requestResetValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token is required'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character')
];

// Routes
router.post(
  '/request-reset',
  validate(requestResetValidation),
  passwordResetController.requestReset
);

router.post(
  '/reset',
  validate(resetPasswordValidation),
  passwordResetController.resetPassword
);

router.get(
  '/verify-token',
  passwordResetController.verifyToken
);

module.exports = router;

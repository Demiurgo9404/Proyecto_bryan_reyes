const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User } = require('../../../domain/models');
const emailService = require('../../../infrastructure/services/email.service');
const ApiError = require('../../../domain/exceptions/ApiError');
const httpStatus = require('http-status');
const config = require('../../../config');
const logger = require('../../../infrastructure/logging/logger');

class PasswordResetController {
  /**
   * Request password reset
   */
  async requestReset(req, res, next) {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });
      
      // Always return success to prevent email enumeration
      if (!user) {
        logger.warn(`Password reset requested for non-existent email: ${email}`);
        return res.json({ 
          success: true, 
          message: 'If an account with that email exists, a password reset link has been sent.' 
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Set token and expiry (1 hour from now)
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      
      await user.update({
        passwordResetToken: resetTokenHash,
        passwordResetExpires: resetTokenExpiry
      });

      // Send email with reset link
      const resetUrl = `${config.app.frontendUrl}/reset-password?token=${resetToken}&id=${user.id}`;
      await emailService.sendPasswordResetEmail(user.email, resetToken, resetUrl);

      res.json({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    } catch (error) {
      logger.error('Error in password reset request:', error);
      next(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req, res, next) {
    try {
      const { token, userId, newPassword } = req.body;

      if (!token || !userId) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Token and user ID are required'
        );
      }

      // Hash the token to compare with stored hash
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user by ID and check token
      const user = await User.findOne({
        where: {
          id: userId,
          passwordResetToken: hashedToken,
          passwordResetExpires: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Invalid or expired password reset token'
        );
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password and clear reset token
      await user.update({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      });

      // TODO: Invalidate all user sessions/tokens

      res.json({ 
        success: true, 
        message: 'Password has been reset successfully. You can now log in with your new password.' 
      });
    } catch (error) {
      logger.error('Error resetting password:', error);
      next(error);
    }
  }

  /**
   * Verify reset token
   */
  async verifyToken(req, res, next) {
    try {
      const { token, userId } = req.query;

      if (!token || !userId) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Token and user ID are required'
        );
      }

      // Hash the token to compare with stored hash
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user by ID and check token
      const user = await User.findOne({
        where: {
          id: userId,
          passwordResetToken: hashedToken,
          passwordResetExpires: { [Op.gt]: new Date() }
        },
        attributes: ['id', 'email']
      });

      if (!user) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Invalid or expired password reset token'
        );
      }

      res.json({ 
        success: true, 
        message: 'Token is valid',
        data: {
          userId: user.id,
          email: user.email
        }
      });
    } catch (error) {
      logger.error('Error verifying reset token:', error);
      next(error);
    }
  }
}

module.exports = new PasswordResetController();

const nodemailer = require('nodemailer');
const config = require('../../config');
const logger = require('../logging/logger');

class EmailService {
  constructor() {
    if (config.email.enabled) {
      this.transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.secure, // true for 465, false for other ports
        auth: {
          user: config.email.smtp.auth.user,
          pass: config.email.smtp.auth.pass,
        },
      });
    }
  }

  async sendPasswordResetEmail(email, token) {
    if (!config.email.enabled) {
      logger.warn('Email service is disabled. Password reset email not sent.');
      return true; // For testing/development
    }

    const resetUrl = `${config.app.frontendUrl}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Restablecer tu contraseña - LoveRose',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Restablecer Contraseña</h2>
          <p>Hola,</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
          <p>Por favor, haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p style="margin: 25px 0;">
            <a href="${resetUrl}" 
               style="background-color: #e91e63; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Restablecer Contraseña
            </a>
          </p>
          <p>Si no solicitaste este restablecimiento, puedes ignorar este correo electrónico.</p>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Saludos,<br>El equipo de LoveRose</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            Si el botón no funciona, copia y pega esta URL en tu navegador:<br>
            ${resetUrl}
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

module.exports = new EmailService();

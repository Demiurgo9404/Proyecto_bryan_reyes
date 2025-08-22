const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// @desc    Autenticar usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar si el usuario existe
    console.log(`[AUTH] Login intento para: ${email}`);
    const user = await User.findOne({ 
      where: { email }
    });
    
    if (!user) {
      console.warn('[AUTH] Usuario no encontrado');
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('[AUTH] Contraseña incorrecta');
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar si el usuario está verificado
    if (!user.is_verified) {
      console.warn(`[AUTH] Usuario no verificado - Email: ${user.email}, is_verified: ${user.is_verified}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Por favor verifica tu correo electrónico para activar tu cuenta',
        requiresVerification: true
      });
    }

    // Verificar si la cuenta está activa
    if (user.is_active === false) {
      console.warn(`[AUTH] Usuario inactivo - Email: ${user.email}, is_active: ${user.is_active}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Tu cuenta ha sido desactivada. Contacta al soporte para más información.'
      });
    }

    // Actualizar último inicio de sesión
    user.last_login = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save({ silent: true });
    
    // Crear token JWT
    const token = user.getSignedJwtToken();

    // Configurar opciones para la cookie
    const cookieDays = Number(process.env.JWT_COOKIE_EXPIRE || 7);
    const options = {
      expires: new Date(
        Date.now() + cookieDays * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    // Enviar token en la cookie y en la respuesta
    res
      .status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
          is_active: user.is_active
        }
      });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error en el servidor' 
    });
  }
};

// @desc    Cerrar sesión / limpiar cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener la información del usuario' 
    });
  }
};

// @desc    Actualizar detalles del usuario
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    await user.update(fieldsToUpdate);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al actualizar detalles:', error);
    // Duplicado de email en Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'El correo electrónico ya está en uso' });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar la información' 
    });
  }
};

// @desc    Actualizar contraseña
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isValid = await user.matchPassword(req.body.currentPassword);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'La contraseña actual es incorrecta' 
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar la contraseña' 
    });
  }
};

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    // Validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    // Crear token
    const token = user.getSignedJwtToken();

    // Enviar respuesta
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    // Manejar errores de duplicados en Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'El correo electrónico ya está en uso' });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error en el servidor' 
    });
  }
};

// @desc    Confirmar correo electrónico
// @route   GET /api/auth/confirmemail
// @access  Public
exports.confirmEmail = async (req, res, next) => {
  try {
    // Obtener token
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token de verificación inválido' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      });
    }

    // Verificar si ya está verificado
    if (user.is_verified) {
      return res.status(400).json({ 
        success: false, 
        error: 'El correo electrónico ya ha sido verificado' 
      });
    }

    // Actualizar usuario
    user.is_verified = true;
    user.verification_token = null;
    user.verification_expire = null;
    await user.save();

    // Enviar respuesta
    res.status(200).json({
      success: true,
      message: 'Correo electrónico verificado correctamente'
    });
  } catch (error) {
    console.error('Error al confirmar correo:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Token de verificación inválido o expirado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al verificar el correo electrónico' 
    });
  }
};

// @desc    Olvidé mi contraseña
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  let user;
  try {
    user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró un usuario con ese correo electrónico'
      });
    }

    // Obtener token de restablecimiento
    const resetToken = user.getResetPasswordToken();
    await user.save({ fields: ['reset_password_token', 'reset_password_expire'] });

    // Crear URL de restablecimiento
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    // Aquí iría el código para enviar el correo electrónico
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Restablecer contraseña',
    //   message: `Por favor haz clic en el siguiente enlace para restablecer tu contraseña: \n\n ${resetUrl}`
    // });

    res.status(200).json({
      success: true,
      message: 'Se ha enviado un correo electrónico con las instrucciones para restablecer la contraseña',
      resetToken // Solo para desarrollo, eliminar en producción
    });
  } catch (error) {
    console.error('Error en olvidé mi contraseña:', error);
    // Limpiar solo si el usuario fue obtenido previamente
    if (user) {
      user.reset_password_token = null;
      user.reset_password_expire = null;
      await user.save({ fields: ['reset_password_token', 'reset_password_expire'] });
    }

    res.status(500).json({ 
      success: false, 
      error: 'No se pudo enviar el correo electrónico' 
    });
  }
};

// @desc    Restablecer contraseña
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Obtener token hasheado
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // Buscar usuario con token válido
    const user = await User.findOne({
      where: {
        reset_password_token: resetPasswordToken,
        reset_password_expire: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token inválido o expirado' 
      });
    }

    // Establecer nueva contraseña y limpiar tokens
    user.password = req.body.password;
    user.reset_password_token = null;
    user.reset_password_expire = null;
    await user.save({ fields: ['password', 'reset_password_token', 'reset_password_expire'] });

    // Enviar token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ 
      success: false, 
      error: 'No se pudo restablecer la contraseña' 
    });
  }
};

// Helper para enviar la respuesta con token
const sendTokenResponse = (user, statusCode, res) => {
  // Crear token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      }
    });
};

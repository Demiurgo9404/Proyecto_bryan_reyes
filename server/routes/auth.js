const express = require('express');
// Asegurarse de que estamos usando el Router de Express
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Registrar un nuevo usuario
// @access  Public
router.post(
  '/register',
  [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'Por favor incluye un email válido').isEmail(),
    check('password', 'Por favor ingresa una contraseña con 6 o más caracteres').isLength({ min: 6 })
  ],
  authController.register
);

// @route   POST /api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Por favor incluye un email válido').isEmail(),
    check('password', 'La contraseña es requerida').exists()
  ],
  authController.login
);

// @route   GET /api/auth
// @desc    Obtener usuario autenticado
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   POST /api/auth/forgot-password
// @desc    Solicitar restablecimiento de contraseña
// @access  Public
router.post(
  '/forgot-password',
  [check('email', 'Por favor incluye un email válido').isEmail()],
  authController.forgotPassword
);

// @route   PUT /api/auth/reset-password/:token
// @desc    Restablecer contraseña
// @access  Public
router.put(
  '/reset-password/:token',
  [
    check('password', 'Por favor ingresa una contraseña con 6 o más caracteres').isLength({ min: 6 }),
    check('confirmPassword', 'Por favor confirma tu contraseña').exists()
  ],
  authController.resetPassword
);

// @route   GET /api/auth/confirm-email/:token
// @desc    Confirmar correo electrónico
// @access  Public
router.get('/confirm-email/:token', authController.confirmEmail);

// Rutas de verificación de email deshabilitadas por falta de implementación en el controlador
// router.post('/verify-email', protect, verifyController(authController, 'requestEmailVerification'));
// router.get('/verify-email/:token', verifyController(authController, 'verifyEmail'));

// @route   PUT /api/auth/update-details
// @desc    Actualizar detalles del usuario
// @access  Private
router.put('/update-details', protect, authController.updateDetails);

// @route   PUT /api/auth/update-password
// @desc    Actualizar contraseña
// @access  Private
router.put(
  '/update-password',
  protect,
  [
    check('currentPassword', 'Por favor ingresa tu contraseña actual').exists(),
    check('newPassword', 'Por favor ingresa una nueva contraseña con 6 o más caracteres').isLength({ min: 6 })
  ],
  authController.updatePassword
);

// @route   POST /api/auth/logout
// @desc    Cerrar sesión / Limpiar cookie
// @access  Private
router.post('/logout', protect, authController.logout);

// Ruta logout-all deshabilitada por falta de implementación en el controlador
// router.post('/logout-all', protect, verifyController(authController, 'logoutAll'));

module.exports = router;

const express = require('express');
// Asegurarse de que estamos usando el Router de Express
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth'); // Cambiado de 'auth' a 'protect'

// Verificar que los controladores son funciones antes de usarlos
const verifyController = (controller, method) => {
  // Verificar que el controlador existe
  if (!controller) {
    console.error('Error: El controlador no está definido');
    process.exit(1);
  }
  
  // Verificar que el método existe en el controlador
  if (typeof controller[method] !== 'function') {
    console.error(`Error: ${method} no es una función en el controlador`);
    console.error('Métodos disponibles:', Object.keys(controller));
    process.exit(1);
  }
  
  // Devolver el manejador del controlador
  return (req, res, next) => {
    try {
      return controller[method](req, res, next);
    } catch (error) {
      console.error(`Error en el controlador ${method}:`, error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
};

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
  verifyController(authController, 'register')
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
  verifyController(authController, 'login')
);

// @route   GET /api/auth
// @desc    Obtener usuario autenticado
// @access  Private
router.get('/', protect, verifyController(authController, 'me'));

// @route   POST /api/auth/forgot-password
// @desc    Solicitar restablecimiento de contraseña
// @access  Public
router.post(
  '/forgot-password',
  [check('email', 'Por favor incluye un email válido').isEmail()],
  verifyController(authController, 'forgotPassword')
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
  verifyController(authController, 'resetPassword')
);

// @route   GET /api/auth/confirm-email/:token
// @desc    Confirmar correo electrónico
// @access  Public
router.get('/confirm-email/:token', verifyController(authController, 'confirmEmail'));

// @route   POST /api/auth/verify-email
// @desc    Solicitar verificación de correo electrónico
// @access  Private
router.post('/verify-email', protect, verifyController(authController, 'requestEmailVerification'));

// @route   GET /api/auth/verify-email/:token
// @desc    Verificar correo electrónico
// @access  Public
router.get('/verify-email/:token', verifyController(authController, 'verifyEmail'));

// @route   PUT /api/auth/update-details
// @desc    Actualizar detalles del usuario
// @access  Private
router.put('/update-details', protect, verifyController(authController, 'updateDetails'));

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
  verifyController(authController, 'updatePassword')
);

// @route   POST /api/auth/logout
// @desc    Cerrar sesión / Limpiar cookie
// @access  Private
router.post('/logout', protect, verifyController(authController, 'logout'));

// @route   POST /api/auth/logout-all
// @desc    Cerrar todas las sesiones
// @access  Private
router.post('/logout-all', protect, verifyController(authController, 'logoutAll'));

module.exports = router;

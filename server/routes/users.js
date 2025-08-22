const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

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

// @route   GET /api/users
// @desc    Obtener todos los usuarios
// @access  Private/Admin
router.get('/', [protect, authorize('admin')], verifyController(userController, 'getUsers'));

// @route   GET /api/users/clients
// @desc    Obtener usuarios con rol 'user' (Clientes)
// @access  Private/Admin
router.get('/clients', [protect, authorize('admin')], verifyController(userController, 'getClients'));

// @route   GET /api/users/roles-summary
// @desc    Resumen de roles y miembros por rol
// @access  Private/Admin
router.get('/roles-summary', [protect, authorize('admin')], verifyController(userController, 'getRolesSummary'));

// @route   GET /api/users/me
// @desc    Obtener perfil del usuario actual
// @access  Private
router.get('/me', protect, verifyController(userController, 'getCurrentUser'));

// @route   GET /api/users/:id
// @desc    Obtener usuario por ID
// @access  Private/Admin
router.get('/:id', [protect, authorize('admin')], verifyController(userController, 'getUserById'));

// @route   POST /api/users
// @desc    Crear un nuevo usuario (solo admin)
// @access  Private/Admin
router.post(
  '/',
  [
    protect,
    authorize('admin'),
    [
      check('email', 'Por favor incluye un email válido').isEmail(),
      check('password', 'Por favor ingresa una contraseña con 6 o más caracteres').isLength({ min: 6 }),
      check('role', 'Rol no válido').isIn(['user', 'model', 'admin'])
    ]
  ],
  verifyController(userController, 'createUser')
);

// @route   PUT /api/users/:id
// @desc    Actualizar usuario
// @access  Private/Admin
router.put(
  '/:id',
  [
    protect,
    authorize('admin'),
    [
      check('email').optional().isEmail(),
      check('role').optional().isIn(['user', 'model', 'admin']),
      check('isActive').optional().isBoolean()
    ]
  ],
  verifyController(userController, 'updateUser')
);

// @route   DELETE /api/users/:id
// @desc    Eliminar usuario (marcar como inactivo)
// @access  Private/Admin
router.delete('/:id', [protect, authorize('admin')], verifyController(userController, 'deleteUser'));

// @route   PUT /api/users/:id/activate
// @desc    Activar usuario
// @access  Private/Admin
router.put('/:id/activate', [protect, authorize('admin')], verifyController(userController, 'activateUser'));

// @route   PUT /api/users/:id/deactivate
// @desc    Desactivar usuario
// @access  Private/Admin
router.put('/:id/deactivate', [protect, authorize('admin')], verifyController(userController, 'deactivateUser'));

// @route   PUT /api/users/update-profile
// @desc    Actualizar perfil del usuario actual
// @access  Private
// Rutas no soportadas (perfil/avatares/seguidores/etc.) fueron removidas para evitar errores

// @route   PUT /api/users/update-password
// @desc    Actualizar contraseña del usuario actual
// @access  Private
router.put(
  '/update-password',
  [
    protect,
    [
      check('currentPassword', 'La contraseña actual es requerida').exists(),
      check('newPassword', 'Por favor ingresa una contraseña con 6 o más caracteres').isLength({ min: 6 })
    ]
  ],
  verifyController(userController, 'updateUserPassword')
);

// @route   POST /api/users/upload-avatar
// @desc    Subir avatar del usuario
// @access  Private
// Rutas avanzadas (búsqueda, perfiles públicos, etc.) podrán reactivarse cuando
// exista soporte en controladores y modelos Sequelize.

module.exports = router;

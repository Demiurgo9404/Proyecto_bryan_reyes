const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth'); // Cambiado a la importación nombrada
const admin = require('../middleware/admin');

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
router.get('/', [protect, admin], verifyController(userController, 'getUsers'));

// @route   GET /api/users/me
// @desc    Obtener perfil del usuario actual
// @access  Private
router.get('/me', protect, verifyController(userController, 'getCurrentUser'));

// @route   GET /api/users/:id
// @desc    Obtener usuario por ID
// @access  Private/Admin
router.get('/:id', [protect, admin], verifyController(userController, 'getUserById'));

// @route   POST /api/users
// @desc    Crear un nuevo usuario (solo admin)
// @access  Private/Admin
router.post(
  '/',
  [
    protect,
    admin,
    [
      check('name', 'El nombre es obligatorio').not().isEmpty(),
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
    admin,
    [
      check('name', 'El nombre es obligatorio').not().isEmpty(),
      check('email', 'Por favor incluye un email válido').isEmail(),
      check('role', 'Rol no válido').isIn(['user', 'model', 'admin']),
      check('isActive', 'Estado de activación no válido').isBoolean()
    ]
  ],
  userController.updateUser
);

// @route   DELETE /api/users/:id
// @desc    Eliminar usuario (marcar como inactivo)
// @access  Private/Admin
router.delete('/:id', [auth, admin], userController.deleteUser);

// @route   PUT /api/users/:id/activate
// @desc    Activar usuario
// @access  Private/Admin
router.put('/:id/activate', [auth, admin], userController.activateUser);

// @route   PUT /api/users/:id/deactivate
// @desc    Desactivar usuario
// @access  Private/Admin
router.put('/:id/deactivate', [auth, admin], userController.deactivateUser);

// @route   PUT /api/users/update-profile
// @desc    Actualizar perfil del usuario actual
// @access  Private
router.put(
  '/update-profile',
  [
    auth,
    [
      check('name', 'El nombre es obligatorio').not().isEmpty(),
      check('email', 'Por favor incluye un email válido').isEmail()
    ]
  ],
  userController.updateProfile
);

// @route   PUT /api/users/update-password
// @desc    Actualizar contraseña del usuario actual
// @access  Private
router.put(
  '/update-password',
  [
    auth,
    [
      check('currentPassword', 'La contraseña actual es requerida').exists(),
      check('newPassword', 'Por favor ingresa una contraseña con 6 o más caracteres').isLength({ min: 6 })
    ]
  ],
  userController.updateUserPassword
);

// @route   POST /api/users/upload-avatar
// @desc    Subir avatar del usuario
// @access  Private
router.post('/upload-avatar', auth, userController.uploadAvatar);

// @route   DELETE /api/users/delete-avatar
// @desc    Eliminar avatar del usuario
// @access  Private
router.delete('/delete-avatar', auth, userController.deleteAvatar);

// @route   GET /api/users/:id/profile
// @desc    Obtener perfil público de un usuario
// @access  Public
router.get('/:id/profile', userController.getUserProfile);

// @route   GET /api/users/:id/contents
// @desc    Obtener contenidos de un usuario
// @access  Public
router.get('/:id/contents', userController.getUserContents);

// @route   GET /api/users/:id/sessions
// @desc    Obtener sesiones de un usuario
// @access  Public
router.get('/:id/sessions', userController.getUserSessions);

// @route   GET /api/users/:id/reviews
// @desc    Obtener reseñas de un usuario
// @access  Public
router.get('/:id/reviews', userController.getUserReviews);

// @route   GET /api/users/:id/followers
// @desc    Obtener seguidores de un usuario
// @access  Public
router.get('/:id/followers', userController.getUserFollowers);

// @route   GET /api/users/:id/following
// @desc    Obtener usuarios que sigue un usuario
// @access  Public
router.get('/:id/following', userController.getUserFollowing);

// @route   POST /api/users/:id/follow
// @desc    Seguir a un usuario
// @access  Private
router.post('/:id/follow', auth, userController.followUser);

// @route   POST /api/users/:id/unfollow
// @desc    Dejar de seguir a un usuario
// @access  Private
router.post('/:id/unfollow', auth, userController.unfollowUser);

// @route   GET /api/users/search/:query
// @desc    Buscar usuarios
// @access  Public
router.get('/search/:query', userController.searchUsers);

// @route   GET /api/users/top/creators
// @desc    Obtener los mejores creadores
// @access  Public
router.get('/top/creators', userController.getTopCreators);

module.exports = router;

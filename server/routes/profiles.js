const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const profileController = require('../controllers/profileController');
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

// @route   GET /api/profiles
// @desc    Obtener todos los perfiles
// @access  Public
router.get('/', profileController.getProfiles);

// @route   GET /api/profiles/me
// @desc    Obtener perfil del usuario actual
// @access  Private
router.get('/me', protect, verifyController(profileController, 'getMyProfile'));

// @route   GET /api/profiles/user/:userId
// @desc    Obtener perfil por ID de usuario
// @access  Public
router.get('/user/:userId', profileController.getProfileByUser);

// @route   GET /api/profiles/:id
// @desc    Obtener perfil por ID
// @access  Public
router.get('/:id', profileController.getProfileById);

// @route   POST /api/profiles
// @desc    Crear o actualizar perfil
// @access  Private
router.post(
  '/',
  [
    protect,
    [
      check('bio', 'La biografía no puede superar los 500 caracteres').optional().isLength({ max: 500 }),
      check('website', 'Por favor ingresa una URL válida').optional().isURL(),
      check('gender', 'Género no válido').optional().isIn(['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']),
      check('birthDate', 'Por favor ingresa una fecha de nacimiento válida').optional().isISO8601()
    ]
  ],
  verifyController(profileController, 'createOrUpdateProfile')
);

// @route   PUT /api/profiles/me
// @desc    Actualizar perfil del usuario actual
// @access  Private
router.put(
  '/me',
  [
    auth,
    [
      check('bio', 'La biografía no puede superar los 500 caracteres').optional().isLength({ max: 500 }),
      check('website', 'Por favor ingresa una URL válida').optional().isURL(),
      check('gender', 'Género no válido').optional().isIn(['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']),
      check('birthDate', 'Por favor ingresa una fecha de nacimiento válida').optional().isISO8601()
    ]
  ],
  profileController.updateMyProfile
);

// @route   PUT /api/profiles/me/model
// @desc    Actualizar información de modelo
// @access  Private/Model
router.put(
  '/me/model',
  [
    auth,
    [
      check('isModel', 'El campo isModel debe ser un booleano').optional().isBoolean(),
      check('modelInfo.category', 'La categoría es requerida para modelos').optional().notEmpty(),
      check('modelInfo.pricePerMinute', 'El precio por minuto debe ser un número').optional().isNumeric(),
      check('modelInfo.availability.*.day', 'Día no válido').optional().isIn([
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
      ])
    ]
  ],
  profileController.updateModelInfo
);

// @route   POST /api/profiles/me/photo
// @desc    Subir foto de perfil
// @access  Private
router.post('/me/photo', auth, profileController.uploadProfilePhoto);

// @route   DELETE /api/profiles/me/photo
// @desc    Eliminar foto de perfil
// @access  Private
router.delete('/me/photo', auth, profileController.deleteProfilePhoto);

// @route   POST /api/profiles/me/cover
// @desc    Subir foto de portada
// @access  Private
router.post('/me/cover', auth, profileController.uploadCoverPhoto);

// @route   DELETE /api/profiles/me/cover
// @desc    Eliminar foto de portada
// @access  Private
router.delete('/me/cover', auth, profileController.deleteCoverPhoto);

// @route   GET /api/profiles/me/followers
// @desc    Obtener seguidores del perfil actual
// @access  Private
router.get('/me/followers', auth, profileController.getMyFollowers);

// @route   GET /api/profiles/me/following
// @desc    Obtener perfiles que sigue el usuario actual
// @access  Private
router.get('/me/following', auth, profileController.getMyFollowing);

// @route   POST /api/profiles/:id/follow
// @desc    Seguir a un perfil
// @access  Private
router.post('/:id/follow', auth, profileController.followProfile);

// @route   POST /api/profiles/:id/unfollow
// @desc    Dejar de seguir a un perfil
// @access  Private
router.post('/:id/unfollow', auth, profileController.unfollowProfile);

// @route   GET /api/profiles/search
// @desc    Buscar perfiles
// @access  Public
router.get('/search', profileController.searchProfiles);

// @route   GET /api/profiles/top/models
// @desc    Obtener los perfiles de modelos más populares
// @access  Public
router.get('/top/models', profileController.getTopModels);

// @route   GET /api/profiles/:id/contents
// @desc    Obtener contenidos de un perfil
// @access  Public
router.get('/:id/contents', profileController.getProfileContents);

// @route   GET /api/profiles/:id/sessions
// @desc    Obtener sesiones de un perfil
// @access  Public
router.get('/:id/sessions', profileController.getProfileSessions);

// @route   GET /api/profiles/:id/reviews
// @desc    Obtener reseñas de un perfil
// @access  Public
router.get('/:id/reviews', profileController.getProfileReviews);

// @route   GET /api/profiles/:id/followers
// @desc    Obtener seguidores de un perfil
// @access  Public
router.get('/:id/followers', profileController.getProfileFollowers);

// @route   GET /api/profiles/:id/following
// @desc    Obtener perfiles que sigue un perfil
// @access  Public
router.get('/:id/following', profileController.getProfileFollowing);

// @route   PUT /api/profiles/:id/verify
// @desc    Verificar perfil (admin)
// @access  Private/Admin
router.put('/:id/verify', [auth, admin], profileController.verifyProfile);

// @route   PUT /api/profiles/:id/feature
// @desc    Destacar perfil (admin)
// @access  Private/Admin
router.put('/:id/feature', [auth, admin], profileController.featureProfile);

// @route   DELETE /api/profiles/:id
// @desc    Eliminar perfil (admin)
// @access  Private/Admin
router.delete('/:id', [auth, admin], profileController.deleteProfile);

module.exports = router;

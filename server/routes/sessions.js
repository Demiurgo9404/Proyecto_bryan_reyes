const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const sessionController = require('../controllers/sessionController');
const { protect } = require('../middleware/auth'); // Updated to use named import
const model = require('../middleware/model');

// Verify that controllers are functions before using them
const verifyController = (controller, method) => {
  // Verify the controller exists
  if (!controller) {
    console.error('Error: The controller is not defined');
    process.exit(1);
  }
  
  // Verify the method exists in the controller
  if (typeof controller[method] !== 'function') {
    console.error(`Error: ${method} is not a function in the controller`);
    console.error('Available methods:', Object.keys(controller));
    process.exit(1);
  }
  
  // Return the controller handler
  return (req, res, next) => {
    try {
      return controller[method](req, res, next);
    } catch (error) {
      console.error(`Error in controller ${method}:`, error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
};

// @route   GET /api/sessions
// @desc    Obtener todas las sesiones
// @access  Public
router.get('/', sessionController.getSessions);

// @route   GET /api/sessions/upcoming
// @desc    Obtener próximas sesiones
// @access  Public
router.get('/upcoming', sessionController.getUpcomingSessions);

// @route   GET /api/sessions/live
// @desc    Obtener sesiones en vivo
// @access  Public
router.get('/live', sessionController.getLiveSessions);

// @route   GET /api/sessions/featured
// @desc    Obtener sesiones destacadas
// @access  Public
router.get('/featured', sessionController.getFeaturedSessions);

// @route   GET /api/sessions/category/:category
// @desc    Obtener sesiones por categoría
// @access  Public
router.get('/category/:category', sessionController.getSessionsByCategory);

// @route   GET /api/sessions/search
// @desc    Buscar sesiones
// @access  Public
router.get('/search', sessionController.searchSessions);

// @route   GET /api/sessions/:id
// @desc    Obtener sesión por ID
// @access  Public
router.get('/:id', verifyController(sessionController, 'getSessionById'));

// @route   POST /api/sessions
// @desc    Crear una nueva sesión
// @access  Private/Model
router.post(
  '/',
  [
    protect,
    model,
    [
      check('title', 'El título es obligatorio').not().isEmpty(),
      check('description', 'La descripción no puede superar los 1000 caracteres').optional().isLength({ max: 1000 }),
      check('scheduledStartTime', 'La fecha y hora de inicio son obligatorias').isISO8601(),
      check('scheduledEndTime', 'La fecha y hora de finalización son obligatorias').isISO8601(),
      check('price', 'El precio debe ser un número').optional().isNumeric(),
      check('maxParticipants', 'El número máximo de participantes debe ser un número').optional().isInt(),
      check('isPrivate', 'El campo isPrivate debe ser un booleano').optional().isBoolean(),
      check('allowedUsers', 'Los usuarios permitidos deben ser un array de IDs').optional().isArray(),
      check('category', 'La categoría es obligatoria').not().isEmpty(),
      check('tags', 'Las etiquetas deben ser un array').optional().isArray()
    ]
  ],
  verifyController(sessionController, 'createSession')
);

// @route   PUT /api/sessions/:id
// @desc    Actualizar una sesión
// @access  Private/Model
router.put(
  '/:id',
  [
    protect,
    [
      check('title', 'El título es obligatorio').optional().notEmpty(),
      check('description', 'La descripción no puede superar los 1000 caracteres').optional().isLength({ max: 1000 }),
      check('scheduledStartTime', 'La fecha y hora de inicio deben ser válidas').optional().isISO8601(),
      check('scheduledEndTime', 'La fecha y hora de finalización deben ser válidas').optional().isISO8601(),
      check('price', 'El precio debe ser un número').optional().isNumeric(),
      check('maxParticipants', 'El número máximo de participantes debe ser un número').optional().isInt(),
      check('isPrivate', 'El campo isPrivate debe ser un booleano').optional().isBoolean(),
      check('allowedUsers', 'Los usuarios permitidos deben ser un array de IDs').optional().isArray(),
      check('category', 'La categoría no puede estar vacía').optional().notEmpty(),
      check('tags', 'Las etiquetas deben ser un array').optional().isArray(),
      check('status', 'Estado no válido').optional().isIn(['scheduled', 'active', 'completed', 'cancelled'])
    ]
  ],
  verifyController(sessionController, 'updateSession')
);

// @route   DELETE /api/sessions/:id
// @desc    Eliminar una sesión
// @access  Private/Model
router.delete('/:id', [protect, model], verifyController(sessionController, 'deleteSession'));

// @route   POST /api/sessions/:id/start
// @desc    Iniciar una sesión
// @access  Private/Model
router.post('/:id/start', [protect, model], verifyController(sessionController, 'startSession'));

// @route   POST /api/sessions/:id/end
// @desc    Finalizar una sesión
// @access  Private/Model
router.post('/:id/end', [protect, model], verifyController(sessionController, 'endSession'));

// @route   POST /api/sessions/:id/join
// @desc    Unirse a una sesión
// @access  Private
router.post('/:id/join', protect, verifyController(sessionController, 'joinSession'));

// @route   POST /api/sessions/:id/leave
// @desc    Abandonar una sesión
// @access  Private
router.post('/:id/leave', protect, verifyController(sessionController, 'leaveSession'));

// @route   GET /api/sessions/:id/participants
// @desc    Obtener participantes de una sesión
// @access  Public
router.get('/:id/participants', verifyController(sessionController, 'getSessionParticipants'));

// @route   GET /api/sessions/user/:userId
// @desc    Obtener sesiones de un usuario
// @access  Public
router.get('/user/:userId', verifyController(sessionController, 'getUserSessions'));

// @route   GET /api/sessions/:id/chat
// @desc    Get chat history for a session
// @access  Private
router.get('/:id/chat', protect, verifyController(sessionController, 'getChatHistory'));

// @route   POST /api/sessions/:id/chat
// @desc    Enviar mensaje al chat de una sesión
// @access  Private
router.post(
  '/:id/chat',
  [
    protect,
    [
      check('message', 'El mensaje no puede estar vacío').not().isEmpty(),
      check('message', 'El mensaje no puede superar los 500 caracteres').isLength({ max: 500 })
    ]
  ],
  verifyController(sessionController, 'sendChatMessage')
);

// @route   POST /api/sessions/:id/notify
// @desc    Enviar notificación a los participantes de una sesión
// @access  Private/Model
router.post(
  '/:id/notify',
  [
    protect,
    model,
    [
      check('title', 'El título es obligatorio').not().isEmpty(),
      check('message', 'El mensaje es obligatorio').not().isEmpty(),
      check('message', 'El mensaje no puede superar los 500 caracteres').isLength({ max: 500 })
    ]
  ],
  verifyController(sessionController, 'notifyParticipants')
);

// @route   GET /api/sessions/:id/recording
// @desc    Obtener grabación de una sesión
// @access  Private
router.get('/:id/recording', protect, verifyController(sessionController, 'getSessionRecording'));

// @route   POST /api/sessions/:id/record
// @desc    Iniciar/Detener grabación de una sesión
// @access  Private/Model
router.post('/:id/record', [protect, model], verifyController(sessionController, 'toggleRecording'));

// @route   PUT /api/sessions/:id/feature
// @desc    Destacar una sesión
// @access  Private/Admin
router.put('/:id/feature', [auth, admin], sessionController.featureSession);

// @route   POST /api/sessions/:id/report
// @desc    Reportar una sesión
// @access  Private
router.post(
  '/:id/report',
  [
    auth,
    [
      check('reason', 'La razón del reporte es obligatoria').not().isEmpty(),
      check('reason', 'La razón no puede superar los 500 caracteres').isLength({ max: 500 }),
      check('details', 'Los detalles no pueden superar los 1000 caracteres').optional().isLength({ max: 1000 })
    ]
  ],
  sessionController.reportSession
);

// @route   GET /api/sessions/:id/analytics
// @desc    Obtener análisis de una sesión
// @access  Private/Model
router.get('/:id/analytics', [auth, model], sessionController.getSessionAnalytics);

module.exports = router;

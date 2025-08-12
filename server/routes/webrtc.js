const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const webrtcController = require('../controllers/webrtcController');
const { protect } = require('../middleware/auth');

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

// @route   POST /api/webrtc/sessions
// @desc    Crear una nueva sesión de videollamada
// @access  Private
router.post(
  '/sessions',
  [
    protect,
    [
      check('title', 'El título es obligatorio').not().isEmpty(),
      check('description', 'La descripción es obligatoria').optional(),
      check('isPrivate', 'isPrivate debe ser un booleano').optional().isBoolean(),
      check('maxParticipants', 'maxParticipants debe ser un número').optional().isInt({ min: 2 }),
      check('duration', 'La duración debe ser un número en milisegundos').optional().isInt({ min: 60000 }) // Mínimo 1 minuto
    ]
  ],
  verifyController(webrtcController, 'createSession')
);

// @route   POST /api/webrtc/sessions/:id/join
// @desc    Unirse a una sesión de videollamada
// @access  Private
router.post(
  '/sessions/:id/join',
  protect,
  verifyController(webrtcController, 'joinSession')
);

// @route   GET /api/webrtc/sessions/:id
// @desc    Obtener información de una sesión
// @access  Private
router.get(
  '/sessions/:id',
  protect,
  verifyController(webrtcController, 'getSession')
);

// @route   GET /api/webrtc/sessions
// @desc    Obtener lista de sesiones activas
// @access  Private
router.get(
  '/sessions',
  protect,
  verifyController(webrtcController, 'getActiveSessions')
);

// @route   POST /api/webrtc/sessions/:id/end
// @desc    Finalizar una sesión
// @access  Private (Solo el anfitrión puede finalizar la sesión)
router.post(
  '/sessions/:id/end',
  protect,
  verifyController(webrtcController, 'endSession')
);

// @route   GET /api/webrtc/ice-servers
// @desc    Obtener servidores ICE para WebRTC
// @access  Private
router.get(
  '/ice-servers',
  protect,
  verifyController(webrtcController, 'getIceServers')
);

module.exports = router;

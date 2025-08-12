const { v4: uuidv4 } = require('uuid');
const { getRooms } = require('../utils/socket');
const Session = require('../models/Session');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Crear una nueva sesión de videollamada
// @route   POST /api/webrtc/sessions
// @access  Private
exports.createSession = async (req, res, next) => {
  try {
    const { title, description, isPrivate, maxParticipants, duration } = req.body;
    const userId = req.user.id;

    // Crear nueva sesión
    const session = await Session.create({
      host: userId,
      title,
      description,
      isPrivate: isPrivate || false,
      maxParticipants: maxParticipants || 2, // Por defecto 2 (llamada 1 a 1)
      duration: duration || 15 * 60 * 1000, // 15 minutos por defecto
      status: 'scheduled',
      startTime: new Date(),
      endTime: new Date(Date.now() + (duration || 15 * 60 * 1000)),
      participants: [userId],
      roomId: `room_${uuidv4()}`
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unirse a una sesión de videollamada
// @route   POST /api/webrtc/sessions/:id/join
// @access  Private
exports.joinSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    const userId = req.user.id;

    if (!session) {
      return next(new ErrorResponse('Sesión no encontrada', 404));
    }

    // Verificar si la sesión ya ha terminado
    if (session.status === 'ended') {
      return next(new ErrorResponse('Esta sesión ya ha terminado', 400));
    }

    // Verificar si la sesión es privada y el usuario está invitado
    if (session.isPrivate && !session.invitedUsers.includes(userId)) {
      return next(new ErrorResponse('No tienes permiso para unirte a esta sesión', 403));
    }

    // Verificar si hay espacio disponible
    if (session.participants.length >= session.maxParticipants) {
      return next(new ErrorResponse('La sesión está llena', 400));
    }

    // Verificar si el usuario ya está en la sesión
    if (session.participants.includes(userId)) {
      return res.status(200).json({
        success: true,
        data: session
      });
    }

    // Agregar usuario a la sesión
    session.participants.push(userId);
    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener información de una sesión
// @route   GET /api/webrtc/sessions/:id
// @access  Private
exports.getSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('host', 'username profile')
      .populate('participants', 'username profile');

    if (!session) {
      return next(new ErrorResponse('Sesión no encontrada', 404));
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener lista de sesiones activas
// @route   GET /api/webrtc/sessions
// @access  Private
exports.getActiveSessions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      status: { $in: ['scheduled', 'active'] },
      isPrivate: false
    };

    const sessions = await Session.find(query)
      .populate('host', 'username profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Session.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Finalizar una sesión
// @route   POST /api/webrtc/sessions/:id/end
// @access  Private (Solo el anfitrión puede finalizar la sesión)
exports.endSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return next(new ErrorResponse('Sesión no encontrada', 404));
    }

    // Verificar que el usuario es el anfitrión
    if (session.host.toString() !== req.user.id) {
      return next(new ErrorResponse('No tienes permiso para finalizar esta sesión', 403));
    }

    // Actualizar estado de la sesión
    session.status = 'ended';
    session.endTime = new Date();
    await session.save();

    // Notificar a los participantes vía WebSocket (manejado en socket.js)

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener información de señalización para WebRTC
// @route   GET /api/webrtc/ice-servers
// @access  Private
exports.getIceServers = (req, res, next) => {
  // En producción, deberías usar servidores STUN/TURN reales
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Agregar más servidores STUN/TURN según sea necesario
  ];

  res.status(200).json({
    success: true,
    data: iceServers
  });
};

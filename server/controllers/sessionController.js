const Session = require('../models/Session');
const User = require('../models/User.model');
const Profile = require('../models/Profile');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// @desc    Crear una nueva sesión de video
// @route   POST /api/sessions
// @access  Private/Model
exports.createSession = async (req, res, next) => {
  try {
    // Verificar que el usuario es un modelo
    if (req.user.role !== 'model') {
      return res.status(403).json({
        success: false,
        error: 'Solo los modelos pueden crear sesiones de video'
      });
    }

    const {
      title,
      description,
      scheduledStartTime,
      scheduledEndTime,
      price,
      maxParticipants,
      isPrivate,
      allowedUsers = [],
      settings = {}
    } = req.body;

    // Validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Crear ID único para la sesión
    const sessionId = uuidv4();
    
    // Crear token de acceso para el modelo
    const accessToken = crypto.randomBytes(20).toString('hex');

    // Crear la sesión
    const session = await Session.create({
      sessionId,
      host: req.user.id,
      title,
      description,
      scheduledStartTime,
      scheduledEndTime,
      price: price || 0,
      maxParticipants: maxParticipants || 1,
      isPrivate: isPrivate || false,
      allowedUsers,
      settings: {
        video: settings.video || true,
        audio: settings.audio || true,
        chat: settings.chat !== undefined ? settings.chat : true,
        recording: settings.recording || false,
        ...settings
      },
      accessToken,
      status: 'scheduled'
    });

    // Agregar al modelo como participante
    session.participants.push({
      user: req.user.id,
      role: 'host',
      joinedAt: new Date()
    });

    await session.save();

    // Poblar la información del host para la respuesta
    await session.populate('host', 'name email');

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error al crear sesión:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al crear la sesión de video' 
    });
  }
};

// @desc    Obtener todas las sesiones
// @route   GET /api/sessions
// @access  Public
exports.getSessions = async (req, res, next) => {
  try {
    // Copiar req.query
    const reqQuery = { ...req.query };
    
    // Campos a excluir
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Eliminar campos de la consulta
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Solo mostrar sesiones activas o programadas para usuarios no autenticados
    if (!req.user) {
      reqQuery.status = { $in: ['active', 'scheduled'] };
      reqQuery.isPrivate = false;
    } else if (req.user.role !== 'admin') {
      // Para usuarios autenticados que no son admin, mostrar sesiones públicas o a las que tienen acceso
      reqQuery.$or = [
        { isPrivate: false },
        { allowedUsers: req.user.id },
        { host: req.user.id }
      ];
    }
    
    // Crear cadena de consulta
    let queryStr = JSON.stringify(reqQuery);
    
    // Crear operadores ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Encontrar recursos
    let query = Session.find(JSON.parse(queryStr))
      .populate('host', 'name email')
      .populate('participants.user', 'name email');

    // Seleccionar campos
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Ordenar
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-scheduledStartTime');
    }

    // Paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Session.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Ejecutar consulta
    const sessions = await query;

    // Resultado de la paginación
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: sessions.length,
      pagination,
      data: sessions
    });
  } catch (error) {
    console.error('Error al obtener sesiones:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener las sesiones' 
    });
  }
};

// @desc    Obtener una sesión por ID
// @route   GET /api/sessions/:id
// @access  Private
exports.getSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('host', 'name email')
      .populate('participants.user', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }

    // Verificar permisos para sesiones privadas
    if (session.isPrivate && 
        session.host._id.toString() !== req.user.id && 
        !session.allowedUsers.includes(req.user.id) &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para ver esta sesión privada'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener la sesión' 
    });
  }
};

// @desc    Actualizar una sesión
// @route   PUT /api/sessions/:id
// @access  Private/Model
exports.updateSession = async (req, res, next) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }

    // Verificar que el usuario es el anfitrión o un administrador
    if (session.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para actualizar esta sesión'
      });
    }

    // No permitir actualizar ciertos campos si la sesión ya ha comenzado
    if (session.status === 'active' || session.status === 'completed') {
      const restrictedUpdates = [
        'title', 'description', 'scheduledStartTime', 
        'scheduledEndTime', 'maxParticipants', 'isPrivate', 'allowedUsers'
      ];
      
      for (const field of restrictedUpdates) {
        if (req.body[field] !== undefined) {
          return res.status(400).json({
            success: false,
            error: `No se puede actualizar el campo '${field}' cuando la sesión ya ha comenzado o ha finalizado`
          });
        }
      }
    }

    // Actualizar campos permitidos
    const {
      title,
      description,
      scheduledStartTime,
      scheduledEndTime,
      price,
      maxParticipants,
      isPrivate,
      allowedUsers,
      settings,
      status
    } = req.body;

    if (title) session.title = title;
    if (description !== undefined) session.description = description;
    if (scheduledStartTime) session.scheduledStartTime = scheduledStartTime;
    if (scheduledEndTime) session.scheduledEndTime = scheduledEndTime;
    if (price !== undefined) session.price = price;
    if (maxParticipants !== undefined) session.maxParticipants = maxParticipants;
    if (isPrivate !== undefined) session.isPrivate = isPrivate;
    if (allowedUsers) session.allowedUsers = allowedUsers;
    if (settings) session.settings = { ...session.settings, ...settings };
    if (status) session.status = status;

    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar la sesión' 
    });
  }
};

// @desc    Eliminar una sesión
// @route   DELETE /api/sessions/:id
// @access  Private/Model
exports.deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }

    // Verificar que el usuario es el anfitrión o un administrador
    if (session.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar esta sesión'
      });
    }

    // No permitir eliminar sesiones activas o completadas
    if (session.status === 'active' || session.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar una sesión que ya ha comenzado o ha finalizado'
      });
    }

    await session.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar la sesión' 
    });
  }
};

// @desc    Unirse a una sesión
// @route   POST /api/sessions/:id/join
// @access  Private
exports.joinSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }

    // Verificar si la sesión está activa o programada
    if (session.status !== 'active' && session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        error: 'No puedes unirte a una sesión que no está activa o programada'
      });
    }

    // Verificar si la sesión es privada y el usuario tiene permiso
    if (session.isPrivate && 
        !session.allowedUsers.includes(req.user.id) && 
        session.host.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para unirte a esta sesión privada'
      });
    }

    // Verificar si el usuario ya está en la sesión
    const existingParticipant = session.participants.find(
      p => p.user.toString() === req.user.id
    );

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        error: 'Ya estás en esta sesión'
      });
    }

    // Verificar el límite de participantes
    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: 'La sesión ha alcanzado el límite de participantes'
      });
    }

    // Verificar si se requiere pago
    if (session.price > 0) {
      // Aquí iría la lógica de pago
      // Por ahora, asumimos que el pago ya se realizó
      // En una implementación real, verificaríamos un token de pago o una transacción existente
    }

    // Agregar al usuario como participante
    session.participants.push({
      user: req.user.id,
      role: 'participant',
      joinedAt: new Date()
    });

    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error al unirse a la sesión:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al unirse a la sesión' 
    });
  }
};

// @desc    Salir de una sesión
// @route   POST /api/sessions/:id/leave
// @access  Private
exports.leaveSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }

    // Verificar si el usuario está en la sesión
    const participantIndex = session.participants.findIndex(
      p => p.user.toString() === req.user.id
    );

    if (participantIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'No estás en esta sesión'
      });
    }

    // Si es el anfitrión, terminar la sesión para todos
    if (session.participants[participantIndex].role === 'host') {
      session.status = 'completed';
      session.endedAt = new Date();
      session.endReason = 'El anfitrión ha abandonado la sesión';
    } else {
      // Solo eliminar al participante
      session.participants.splice(participantIndex, 1);
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error al salir de la sesión:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al salir de la sesión' 
    });
  }
};

// @desc    Iniciar una sesión programada
// @route   POST /api/sessions/:id/start
// @access  Private/Model
exports.startSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }

    // Verificar que el usuario es el anfitrión
    if (session.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Solo el anfitrión puede iniciar la sesión'
      });
    }

    // Verificar el estado actual
    if (session.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden iniciar sesiones programadas'
      });
    }

    // Actualizar estado
    session.status = 'active';
    session.startedAt = new Date();
    await session.save();

    // Aquí iría la lógica para notificar a los participantes

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error al iniciar la sesión:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al iniciar la sesión' 
    });
  }
};

// @desc    Terminar una sesión activa
// @route   POST /api/sessions/:id/end
// @access  Private/Model
exports.endSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }

    // Verificar que el usuario es el anfitrión o un administrador
    if (session.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo el anfitrión o un administrador pueden terminar la sesión'
      });
    }

    // Verificar el estado actual
    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden terminar sesiones activas'
      });
    }

    // Actualizar estado
    session.status = 'completed';
    session.endedAt = new Date();
    session.endReason = req.body.reason || 'Sesión finalizada por el anfitrión';
    
    // Calcular duración
    if (session.startedAt) {
      session.duration = Math.floor((session.endedAt - session.startedAt) / 1000); // en segundos
    }

    await session.save();

    // Aquí iría la lógica para notificar a los participantes
    // y procesar pagos, estadísticas, etc.

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error al terminar la sesión:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al terminar la sesión' 
    });
  }
};

// @desc    Obtener token de acceso para WebRTC
// @route   GET /api/sessions/:id/token
// @access  Private
exports.getWebRTCToken = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }

    // Verificar que el usuario es participante o anfitrión
    const isParticipant = session.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant && session.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para acceder a esta sesión'
      });
    }

    // En una implementación real, generaríamos un token JWT o similar
    // Aquí usamos un token simple para el ejemplo
    const token = {
      sessionId: session._id,
      userId: req.user.id,
      role: session.host.toString() === req.user.id ? 'host' : 'participant',
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 3600000) // Expira en 1 hora
    };

    res.status(200).json({
      success: true,
      data: token
    });
  } catch (error) {
    console.error('Error al generar token WebRTC:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Sesión no encontrada con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al generar el token de acceso' 
    });
  }
};

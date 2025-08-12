const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const { getUserIdFromToken } = require('../middleware/auth');

// Almacenamiento temporal para las conexiones de los usuarios
const users = new Map(); // userId -> socketId
const rooms = new Map(); // roomId -> Set de userIds

const configureSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware para autenticación de sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Token de autenticación no proporcionado'));
      }
      
      const userId = await getUserIdFromToken(token);
      if (!userId) {
        return next(new Error('Token inválido o expirado'));
      }
      
      socket.userId = userId;
      next();
    } catch (error) {
      console.error('Error en autenticación de socket:', error);
      next(new Error('Error de autenticación'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id} (Usuario ID: ${socket.userId})`);
    
    // Almacenar la conexión del usuario
    users.set(socket.userId, socket.id);
    
    // Unirse a una sala de videollamada
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      
      // Registrar al usuario en la sala
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.userId);
      
      console.log(`Usuario ${socket.userId} se unió a la sala ${roomId}`);
      
      // Notificar a los demás usuarios de la sala
      socket.to(roomId).emit('user-connected', { userId: socket.userId });
      
      // Enviar lista de usuarios en la sala al nuevo usuario
      const usersInRoom = Array.from(rooms.get(roomId)).filter(id => id !== socket.userId);
      socket.emit('users-in-room', { users: usersInRoom });
    });
    
    // Señalización WebRTC
    socket.on('signal', ({ signal, to, from, roomId }) => {
      console.log(`Señal de ${from} a ${to} en sala ${roomId}`);
      socket.to(roomId).emit('signal', { signal, from, to });
    });
    
    // Mensajes de chat
    socket.on('send-message', ({ roomId, message, userId }) => {
      socket.to(roomId).emit('receive-message', { message, userId });
    });
    
    // Control de tiempo de la llamada
    socket.on('call-started', ({ roomId, duration }) => {
      console.log(`Llamada iniciada en sala ${roomId} por ${socket.userId} (duración: ${duration} segundos)`);
      // Aquí podrías implementar lógica para limitar la duración de la llamada
    });
    
    // Manejo de desconexión
    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.id} (Usuario ID: ${socket.userId})`);
      
      // Eliminar usuario de todas las salas
      rooms.forEach((usersInRoom, roomId) => {
        if (usersInRoom.has(socket.userId)) {
          usersInRoom.delete(socket.userId);
          // Notificar a los demás usuarios de la sala
          socket.to(roomId).emit('user-disconnected', { userId: socket.userId });
          
          // Si la sala queda vacía, eliminarla
          if (usersInRoom.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
      
      // Eliminar usuario del mapa de conexiones
      users.delete(socket.userId);
    });
  });

  return io;
};

module.exports = {
  configureSocket,
  getUsers: () => users,
  getRooms: () => rooms
};

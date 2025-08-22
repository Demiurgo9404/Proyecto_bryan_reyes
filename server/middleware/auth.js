const jwt = require('jsonwebtoken');
const { User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');

// Middleware para proteger rutas
const protect = async (req, res, next) => {
  let token;

  // Verificar si el token está en los headers o en las cookies
  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Asegurarse de que el token exista
  if (!token) {
    return next(new ErrorResponse('No estás autorizado para acceder a esta ruta', 401));
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el token no esté expirado
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      return next(new ErrorResponse('Tu sesión ha expirado. Por favor, inicia sesión nuevamente', 401));
    }

    // Obtener usuario del token (Sequelize)
    const user = await User.findByPk(decoded.id);

    // Verificar si el usuario existe
    if (!user) {
      return next(new ErrorResponse('Usuario no encontrado', 404));
    }
    
    // Asignar el usuario a la solicitud
    req.user = user;

    // Verificar si la cuenta está activa (usando is_active en lugar de isActive)
    if (req.user.is_active === false) {
      return next(new ErrorResponse('Esta cuenta ha sido desactivada', 403));
    }

    next();
  } catch (err) {
    console.error('Error de autenticación:', err);
    if (err.name === 'TokenExpiredError') {
      return next(new ErrorResponse('Tu sesión ha expirado. Por favor, inicia sesión nuevamente', 401));
    } else if (err.name === 'JsonWebTokenError') {
      return next(new ErrorResponse('Token inválido. Por favor, inicia sesión nuevamente', 401));
    }
    return next(new ErrorResponse('No estás autorizado para acceder a esta ruta', 401));
  }
};

// Middleware para autorizar por roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`El rol ${req.user.role} no está autorizado para acceder a esta ruta`, 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};

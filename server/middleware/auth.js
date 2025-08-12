const jwt = require('jsonwebtoken');
const User = require('../models/User');
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
    
    // Obtener usuario del token
    req.user = await User.findById(decoded.id);
    
    // Verificar si el usuario existe
    if (!req.user) {
      return next(new ErrorResponse('Usuario no encontrado', 404));
    }
    
    // Verificar si la cuenta está activa
    if (!req.user.isActive) {
      return next(new ErrorResponse('Esta cuenta ha sido desactivada', 403));
    }
    
    next();
  } catch (err) {
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

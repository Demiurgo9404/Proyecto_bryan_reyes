const ErrorResponse = require('../utils/errorResponse');

// Middleware para manejar rutas no encontradas
const notFound = (req, res, next) => {
  const error = new Error(`No se encontró - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware para manejo de errores global
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log para desarrollo
  console.error(err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Error de duplicados (código 11000 de MongoDB)
  if (err.code === 11000) {
    const message = 'Valor duplicado';
    error = new ErrorResponse(message, 400);
  }

  // Error de CastError (ID de MongoDB no válido)
  if (err.name === 'CastError') {
    const message = `Recurso no encontrado con el ID ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Error de JsonWebToken
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token no válido';
    error = new ErrorResponse(message, 401);
  }

  // Error de expiración del token
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Error del servidor',
  });
};

module.exports = { notFound, errorHandler };

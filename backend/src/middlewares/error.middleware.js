const { StatusCodes } = require('http-status-codes');
const { ValidationError } = require('joi');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const { Sequelize } = require('sequelize');

const errorHandler = (err, req, res, next) => {
  // Log del error para depuración
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
    path: req.path,
    method: req.method,
    body: process.env.NODE_ENV === 'development' ? req.body : {},
    params: process.env.NODE_ENV === 'development' ? req.params : {},
    query: process.env.NODE_ENV === 'development' ? req.query : {}
  });

  // Manejo de errores de validación Joi
  if (err instanceof ValidationError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      message: 'Error de validación',
      errors: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }))
    });
  }

  // Manejo de errores de autenticación JWT
  if (err instanceof JsonWebTokenError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: 'error',
      message: 'Token de autenticación inválido',
      code: 'INVALID_TOKEN'
    });
  }

  if (err instanceof TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: 'error',
      message: 'Token expirado',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Manejo de errores de Sequelize
  if (err instanceof Sequelize.ValidationError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      message: 'Error de validación de datos',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Error de llave duplicada en Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(StatusCodes.CONFLICT).json({
      status: 'error',
      message: 'El recurso ya existe',
      field: err.errors[0].path,
      value: err.errors[0].value
    });
  }

  // Error de base de datos
  if (err instanceof Sequelize.DatabaseError) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Error en la base de datos',
      code: 'DATABASE_ERROR'
    });
  }

  // Error 404 personalizado
  if (err.statusCode === StatusCodes.NOT_FOUND) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: 'error',
      message: err.message || 'Recurso no encontrado',
      code: err.code || 'NOT_FOUND'
    });
  }

  // Error de autenticación
  if (err.statusCode === StatusCodes.UNAUTHORIZED) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: 'error',
      message: err.message || 'No autorizado',
      code: err.code || 'UNAUTHORIZED'
    });
  }

  // Error de permisos
  if (err.statusCode === StatusCodes.FORBIDDEN) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: 'error',
      message: err.message || 'No tiene permisos para realizar esta acción',
      code: err.code || 'FORBIDDEN'
    });
  }

  // Error de validación personalizado
  if (err.statusCode === StatusCodes.BAD_REQUEST) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: 'error',
      message: err.message || 'Solicitud inválida',
      code: err.code || 'BAD_REQUEST',
      errors: err.errors || []
    });
  }

  // Error interno del servidor (por defecto)
  console.error('Error interno del servidor:', err);
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.message,
      stack: err.stack 
    })
  });
};

// Middleware para rutas no encontradas
const notFoundHandler = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};

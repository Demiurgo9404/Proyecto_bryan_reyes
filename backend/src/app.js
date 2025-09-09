const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const httpStatus = require('http-status');
const path = require('path');
const { Sequelize } = require('sequelize');

// Configuraciones
const config = require('./infrastructure/config');
const logger = require('./infrastructure/logging/logger');
const { swaggerDocs } = require('./infrastructure/api/swagger');
const ApiError = require('./domain/exceptions/ApiError');
const errorHandler = require('./infrastructure/middleware/errorHandler');

// Inicializar la aplicación Express
const app = express();

// 1) MIDDLEWARES GLOBALES

// Configurar CORS
app.use(cors(config.security.cors));

// Configurar seguridad con Helmet
app.use(helmet(config.security.helmet));

// Límite de peticiones
const limiter = rateLimit({
  ...config.security.rateLimit,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde',
    });
  },
});
app.use(limiter);

// Body parser, lectura de datos del body a req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization contra NoSQL query injection
app.use(mongoSanitize());

// Data sanitization contra XSS
app.use(xss());

// Prevenir parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Compresión de respuestas
app.use(compression());

// Logging de peticiones HTTP
if (config.isDevelopment) {
  app.use((req, res, next) => {
    logger.http(`${req.method} ${req.originalUrl}`, {
      query: req.query,
      body: req.body,
      headers: req.headers,
    });
    next();
  });
}

// 2) RUTAS ESTÁTICAS
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 3) RUTAS DE LA API
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Bienvenido a la API de LoveRose',
    documentation: `${req.protocol}://${req.get('host')}${config.api.docsPath}`,
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// Rutas de autenticación
app.use(`${config.api.prefix}/auth`, require('./interfaces/http/routes/auth.routes'));

// Rutas de usuarios
app.use(`${config.api.prefix}/users`, require('./interfaces/http/routes/user.routes'));

// Rutas de modelos
app.use(`${config.api.prefix}/models`, require('./interfaces/http/routes/model.routes'));

// Ruta de documentación de la API
swaggerDocs(app, config.server.port);

// 4) MANEJO DE RUTAS NO ENCONTRADAS
app.all('*', (req, res, next) => {
  next(
    new ApiError(
      `No se pudo encontrar ${req.originalUrl} en este servidor`,
      httpStatus.NOT_FOUND
    )
  );
});

// 5) MANEJADOR DE ERRORES GLOBAL
app.use(errorHandler);

// 6) EXPORTAR LA APLICACIÓN
module.exports = app;

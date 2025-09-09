const winston = require('winston');
const { combine, timestamp, printf, colorize, json } = winston.format;
const path = require('path');
const fs = require('fs');
const DailyRotateFile = require('winston-daily-rotate-file');

// Crear directorio de logs si no existe
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Formato personalizado para los logs
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  let logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
  
  // Si hay metadatos, convertirlos a string de manera legible
  if (Object.keys(meta).length > 0) {
    // Evitar mostrar contraseñas o información sensible
    const sanitizedMeta = JSON.parse(JSON.stringify(meta, (key, value) => {
      if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
        return '***';
      }
      return value;
    }, 2));
    
    logMessage += `\n${JSON.stringify(sanitizedMeta, null, 2)}`;
  }
  
  return logMessage;
});

// Configuración de niveles de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colores para la consola
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Filtro para incluir solo logs de error
const errorFilter = winston.format((info) => {
  return info.level === 'error' ? info : false;
});

// Filtro para excluir logs de error
const infoFilter = winston.format((info) => {
  return info.level !== 'error' ? info : false;
});

// Configuración de transportes
const transports = [
  // Consola
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    ),
  }),
  
  // Archivo de logs general
  new DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: combine(
      timestamp(),
      json()
    ),
  }),
  
  // Archivo de errores
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: combine(
      timestamp(),
      json()
    ),
  }),
];

// Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'love-rose-api' },
  transports,
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log') 
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log') 
    })
  ]
});

// Si no estamos en producción, también mostramos los logs en la consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Función para crear un logger con contexto
logger.createChild = (context) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format: combine(
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
      winston.format((info) => {
        info.context = context;
        return info;
      })(),
      winston.format.json()
    ),
    defaultMeta: { 
      service: 'love-rose-api',
      context
    },
    transports: transports.slice(1), // No duplicar logs en consola
  });
};

// Middleware para Express
logger.expressMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 500) {
      logger.error('HTTP Request Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Client Error', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });

  next();
};

module.exports = logger;

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, align } = format;

// Formato personalizado para los logs
const logFormat = printf(({ level, message, timestamp, stack }) => {
  const formattedMessage = stack || message;
  return `${timestamp} [${level}]: ${formattedMessage}`;
});

// Configuración del logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    align(),
    logFormat
  ),
  transports: [
    // Mostrar logs en consola
    new transports.Console(),
    
    // Guardar logs de error en archivo
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: combine(
        timestamp(),
        format.json()
      )
    }),
    
    // Guardar todos los logs en archivo
    new transports.File({ 
      filename: 'logs/combined.log',
      format: combine(
        timestamp(),
        format.json()
      )
    })
  ],
  // No salir del proceso en caso de excepción
  exitOnError: false
});

// Capturar excepciones no manejadas
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

module.exports = logger;

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const env = process.env.NODE_ENV || 'development';

// Configuración de la base de datos
const database = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Roximar2025',
    database: process.env.DB_NAME || 'loverose_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  },
  test: {
    username: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'Roximar2025',
    database: process.env.TEST_DB_NAME || 'loverose_test',
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
};

// Configuración del servidor
const server = {
  port: process.env.PORT || 3001,
  host: process.env.HOST || '0.0.0.0',
  env,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isTest: env === 'test',
};

// Configuración de autenticación JWT
const auth = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  passwordSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS, 10) || 10,
};

// Configuración de CORS
const cors = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Configuración de logs
const logging = {
  level: process.env.LOG_LEVEL || 'info',
  file: {
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    errorLogFile: 'error-%DATE%.log',
    combinedLogFile: 'combined-%DATE%.log',
  },
};

// Configuración de la API
const api = {
  prefix: '/api',
  version: 'v1',
  docsPath: '/api-docs',
};

// Configuración de correo electrónico
const email = {
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password',
  },
  from: process.env.EMAIL_FROM || 'no-reply@loverose.com',
};

// Configuración de almacenamiento
const storage = {
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
  ],
};

// Configuración de Redis (para caché y sesiones)
const redis = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  ttl: parseInt(process.env.REDIS_TTL, 10) || 86400, // 24 horas
};

// Configuración de WebSockets
const websocket = {
  path: '/ws',
  serveClient: false,
  pingInterval: 25000,
  pingTimeout: 60000,
  cookie: false,
};

// Configuración de rate limiting
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.RATE_LIMIT_MAX || 100, // límite de peticiones por ventana
};

// Configuración de seguridad
const security = {
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.loverose.com'],
      },
    },
  },
  cors,
  rateLimit,
};

module.exports = {
  env,
  server,
  database: database[env] || database.development,
  auth,
  logging,
  api,
  email,
  storage,
  redis,
  websocket,
  security,
  // Exportar configuraciones individuales para acceso directo
  get dbConfig() {
    return this.database;
  },
  get serverConfig() {
    return this.server;
  },
  get authConfig() {
    return this.auth;
  },
  get apiConfig() {
    return this.api;
  },
};

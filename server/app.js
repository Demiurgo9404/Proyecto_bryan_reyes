const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
const fileUpload = require('express-fileupload');
const { configureSocket } = require('./utils/socket');

// Importar middlewares personalizados
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Importar rutas
const apiRoutes = require('./routes');
// const webrtcRoutes = require('./routes/webrtc'); // deshabilitado: depende de modelos Mongoose inexistentes

// Inicializar la aplicación Express
const app = express();

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO
const io = configureSocket(server);

// Hacer que io esté disponible en las rutas
app.set('io', io);

// Middleware para parsear JSON y datos de formularios
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Configuración CORS
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // React dev server
  'http://127.0.0.1:5173', // Vite con localhost numérico
  'http://127.0.0.1:3000'  // React con localhost numérico
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `El origen ${origin} no tiene permiso de acceso.`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Permite el envío de credenciales (cookies, encabezados de autenticación)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Total-Count'],
  optionsSuccessStatus: 200
};

// Aplicar CORS con las opciones configuradas
app.use(cors(corsOptions));

// Middleware para cookies
app.use(cookieParser(process.env.JWT_COOKIE_SECRET || 'secreto_para_firmar_cookies'));

// Configuración de cookies seguras en producción
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Confiar en el primer proxy
  app.use((req, res, next) => {
    req.secure ? next() : res.redirect('https://' + req.headers.host + req.url);
  });
}

// Seguridad con Helmet
app.use(helmet());

// Prevención de XSS (Cross-Site Scripting)
app.use(xss());


// Prevenir parámetros de consulta contaminados
app.use(hpp());

// Limitar peticiones (100 peticiones por 10 minutos)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.'
});
app.use(limiter);

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Configuración de carga de archivos
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  abortOnLimit: true,
  responseOnLimit: 'El tamaño del archivo excede el límite permitido de 50MB'
}));

// Servir archivos estáticos (carpeta uploads en la raíz del proyecto)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rutas de la API
app.use('/api', apiRoutes);
// app.use('/api/webrtc', webrtcRoutes); // deshabilitado temporalmente

// Ruta de prueba
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenido a la API de Tinder Clone',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Manejador de rutas no encontradas
app.use(notFound);

// Manejador de errores global
app.use(errorHandler);

// Exportar tanto la app como el servidor para poder usarlos en server.js
module.exports = { app, server };

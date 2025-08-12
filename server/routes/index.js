const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const userRoutes = require('./users');
const profileRoutes = require('./profiles');
const sessionRoutes = require('./sessions');
const contentRoutes = require('./contents');
const transactionRoutes = require('./transactions');
const paymentRoutes = require('./payments');

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/sessions', sessionRoutes);
router.use('/contents', contentRoutes);
router.use('/transactions', transactionRoutes);
router.use('/payments', paymentRoutes);

// Ruta de prueba
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenido a la API de Tinder Clone',
    version: '1.0.0',
    documentation: '/api-docs' // Futura documentación con Swagger/OpenAPI
  });
});

// Manejador de rutas no encontradas
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en el servidor`
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const userRoutes = require('./users');
// const profileRoutes = require('./profiles'); // deshabilitado: depende de modelo inexistente
// const sessionRoutes = require('./sessions'); // deshabilitado
// const contentRoutes = require('./contents'); // deshabilitado
// const transactionRoutes = require('./transactions'); // deshabilitado
// const paymentRoutes = require('./payments'); // deshabilitado

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
// router.use('/profiles', profileRoutes); // deshabilitado hasta implementar modelo Profile en Sequelize
// router.use('/sessions', sessionRoutes); // deshabilitado
// router.use('/contents', contentRoutes); // deshabilitado
// router.use('/transactions', transactionRoutes); // deshabilitado
// router.use('/payments', paymentRoutes); // deshabilitado

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

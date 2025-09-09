const express = require('express');
const authRoutes = require('./auth.routes');
const passwordResetRoutes = require('./passwordReset.routes');
// Import other route files as needed

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/auth', authRoutes);
router.use('/password-reset', passwordResetRoutes);

// Add other route groups here
// router.use('/users', userRoutes);
// router.use('/models', modelRoutes);

// 404 handler for API routes
router.use('/api/*', (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
  });
});

module.exports = router;

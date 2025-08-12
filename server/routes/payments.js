const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Verify that controllers are functions before using them
const verifyController = (controller, method) => {
  // Verify the controller exists
  if (!controller) {
    console.error('Error: The controller is not defined');
    process.exit(1);
  }
  
  // Verify the method exists in the controller
  if (typeof controller[method] !== 'function') {
    console.error(`Error: ${method} is not a function in the controller`);
    console.error('Available methods:', Object.keys(controller));
    process.exit(1);
  }
  
  // Return the controller handler
  return (req, res, next) => {
    try {
      return controller[method](req, res, next);
    } catch (error) {
      console.error(`Error in controller ${method}:`, error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
};

// Ruta para el webhook de Stripe (sin autenticación)
router.post('/webhook', express.raw({ type: 'application/json' }), verifyController(paymentController, 'stripeWebhook'));

// @route   POST /api/payments/create-payment-intent
// @desc    Crear un intento de pago con Stripe
// @access  Private
router.post(
  '/create-payment-intent',
  protect,
  [
    check('amount', 'El monto es requerido y debe ser un número mayor a 0')
      .isFloat({ min: 0.01 }),
    check('description', 'La descripción es requerida').not().isEmpty(),
  ],
  verifyController(paymentController, 'createPaymentIntent')
);

// @route   GET /api/payments/transactions
// @desc    Obtener el historial de transacciones del usuario
// @access  Private
router.get('/transactions', protect, verifyController(paymentController, 'getUserTransactions'));

// @route   GET /api/payments/transactions/:id
// @desc    Obtener una transacción específica
// @access  Private
router.get('/transactions/:id', protect, verifyController(paymentController, 'getTransaction'));

module.exports = router;

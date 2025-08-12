const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/auth'); // Updated to use named import
const admin = require('../middleware/admin');

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

// Rutas públicas
router.get('/payment-methods', transactionController.getAvailablePaymentMethods);
router.post('/webhook/stripe', transactionController.stripeWebhook);
router.post('/webhook/paypal', transactionController.paypalWebhook);

// Rutas protegidas
router.get('/', protect, verifyController(transactionController, 'getUserTransactions'));
router.get('/:id', protect, verifyController(transactionController, 'getTransactionById'));
router.post(
  '/',
  [
    protect,
    [
      check('type', 'Tipo de transacción no válido').isIn(['wallet', 'content', 'session', 'tip', 'subscription']),
      check('amount', 'El monto es requerido y debe ser un número').isNumeric(),
      check('currency', 'Moneda no válida').isIn(['USD', 'EUR', 'MXN']),
      check('paymentMethod', 'Método de pago no válido').isIn(['wallet', 'stripe', 'paypal']),
      check('referenceId', 'ID de referencia es requerido').notEmpty(),
      check('description', 'La descripción es requerida').optional().isLength({ max: 500 })
    ]
  ],
  verifyController(transactionController, 'createTransaction')
);

// Rutas de pago
router.post(
  '/pay-with-wallet',
  [
    protect,
    [
      check('amount', 'El monto es requerido').isNumeric(),
      check('referenceId', 'ID de referencia es requerido').notEmpty(),
      check('referenceType', 'Tipo de referencia no válido').isIn(['content', 'session', 'tip', 'subscription'])
    ]
  ],
  verifyController(transactionController, 'payWithWallet')
);

router.post(
  '/create-payment-intent',
  [
    protect,
    [
      check('amount', 'El monto es requerido').isNumeric(),
      check('currency', 'Moneda no válida').isIn(['USD', 'EUR', 'MXN']),
      check('referenceId', 'ID de referencia es requerido').notEmpty(),
      check('referenceType', 'Tipo de referencia no válido').isIn(['content', 'session', 'tip', 'subscription'])
    ]
  ],
  verifyController(transactionController, 'createPaymentIntent')
);

router.post(
  '/create-paypal-order',
  [
    protect,
    [
      check('amount', 'El monto es requerido').isNumeric(),
      check('currency', 'Moneda no válida').isIn(['USD', 'EUR', 'MXN']),
      check('referenceId', 'ID de referencia es requerido').notEmpty(),
      check('referenceType', 'Tipo de referencia no válido').isIn(['content', 'session', 'tip', 'subscription'])
    ]
  ],
  verifyController(transactionController, 'createPayPalOrder')
);

// Rutas de reembolso
router.post(
  '/:id/refund',
  [
    protect,
    [
      check('reason', 'La razón del reembolso es requerida').notEmpty(),
      check('reason', 'La razón no puede superar los 500 caracteres').isLength({ max: 500 })
    ]
  ],
  verifyController(transactionController, 'requestRefund')
);

// Rutas de administrador
router.get('/admin/all', [protect, admin], verifyController(transactionController, 'getAllTransactions'));
router.get('/admin/stats', [protect, admin], verifyController(transactionController, 'getTransactionStats'));
router.put('/admin/:id/status', [protect, admin], verifyController(transactionController, 'updateTransactionStatus'));
router.post('/admin/:id/process-refund', [protect, admin], verifyController(transactionController, 'processRefund'));

// Rutas de saldo
router.get('/wallet/balance', protect, verifyController(transactionController, 'getWalletBalance'));
router.post('/wallet/add-funds', protect, verifyController(transactionController, 'addFundsToWallet'));
router.post('/wallet/withdraw', protect, verifyController(transactionController, 'withdrawFunds'));

module.exports = router;

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User.model');
const Transaction = require('../models/Transaction');

// @desc    Create a payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'usd', description, metadata = {} } = req.body;
    const userId = req.user.id;

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorResponse('Usuario no encontrado', 404));
    }

    // Crear un cliente en Stripe si no existe
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });
      
      // Guardar el ID del cliente de Stripe en el usuario
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Crear un PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency,
      customer: user.stripeCustomerId,
      description,
      metadata: {
        ...metadata,
        userId: user._id.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Registrar la transacción en la base de datos
    const transaction = await Transaction.create({
      user: user._id,
      amount,
      currency,
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      description,
      metadata,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      await handlePaymentIntentFailed(failedPaymentIntent);
      break;
    // Puedes agregar más eventos según sea necesario
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Devolver una respuesta exitosa a Stripe
  res.json({ received: true });
};

// Helper: Manejar pago exitoso
async function handlePaymentIntentSucceeded(paymentIntent) {
  // Actualizar la transacción en la base de datos
  await Transaction.findOneAndUpdate(
    { paymentIntentId: paymentIntent.id },
    {
      status: 'completed',
      metadata: paymentIntent.metadata,
      paymentMethod: paymentIntent.payment_method_types?.[0],
      receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
    },
    { new: true, runValidators: true }
  );

  // Aquí puedes agregar lógica adicional, como actualizar el saldo del usuario
  // o desbloquear contenido, etc.
  const userId = paymentIntent.metadata.userId;
  if (userId) {
    // Ejemplo: Agregar créditos al usuario
    await User.findByIdAndUpdate(userId, {
      $inc: { credits: paymentIntent.amount / 100 } // Convertir de centavos a dólares
    });
  }
}

// Helper: Manejar pago fallido
async function handlePaymentIntentFailed(paymentIntent) {
  // Actualizar la transacción como fallida
  await Transaction.findOneAndUpdate(
    { paymentIntentId: paymentIntent.id },
    {
      status: 'failed',
      lastPaymentError: paymentIntent.last_payment_error?.message,
    },
    { new: true, runValidators: true }
  );
}

// @desc    Get user transactions
// @route   GET /api/payments/transactions
// @access  Private
exports.getUserTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction by ID
// @route   GET /api/payments/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('user', 'name email');

    if (!transaction) {
      return next(
        new ErrorResponse(
          `Transacción no encontrada con el ID ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

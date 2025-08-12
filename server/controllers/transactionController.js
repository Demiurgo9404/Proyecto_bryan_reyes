const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Content = require('../models/Content');
const Session = require('../models/Session');
const { validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Obtener todas las transacciones
// @route   GET /api/transactions
// @access  Private/Admin
exports.getTransactions = async (req, res, next) => {
  try {
    // Copiar req.query
    const reqQuery = { ...req.query };
    
    // Campos a excluir
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Eliminar campos de la consulta
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Si no es administrador, solo mostrar las transacciones del usuario
    if (req.user.role !== 'admin') {
      reqQuery.$or = [
        { 'fromUser': req.user.id },
        { 'toUser': req.user.id }
      ];
    }
    
    // Crear cadena de consulta
    let queryStr = JSON.stringify(reqQuery);
    
    // Crear operadores ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Encontrar recursos
    let query = Transaction.find(JSON.parse(queryStr))
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .populate('reference.id');

    // Seleccionar campos
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Ordenar
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Transaction.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Ejecutar consulta
    const transactions = await query;

    // Resultado de la paginación
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination,
      data: transactions
    });
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener las transacciones' 
    });
  }
};

// @desc    Obtener una transacción por ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .populate('reference.id');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: `Transacción no encontrada con el id ${req.params.id}`
      });
    }

    // Verificar que el usuario tiene permiso para ver esta transacción
    if (
      req.user.role !== 'admin' && 
      transaction.fromUser._id.toString() !== req.user.id && 
      transaction.toUser._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para ver esta transacción'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error al obtener transacción:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Transacción no encontrada con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener la transacción' 
    });
  }
};

// @desc    Crear una nueva transacción
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    // Validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      toUser,
      amount,
      currency,
      type,
      paymentMethod,
      reference,
      description,
      metadata
    } = req.body;

    // Verificar que el usuario no esté enviando dinero a sí mismo
    if (toUser === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes realizar una transacción a ti mismo'
      });
    }

    // Obtener información del destinatario
    const recipient = await User.findById(toUser);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Usuario destinatario no encontrado'
      });
    }

    // Verificar referencia si es necesario
    if (reference && reference.id) {
      let refDoc;
      
      switch (reference.model) {
        case 'Content':
          refDoc = await Content.findById(reference.id);
          break;
        case 'Session':
          refDoc = await Session.findById(reference.id);
          break;
        case 'User':
          refDoc = await User.findById(reference.id);
          break;
        default:
          break;
      }
      
      if (!refDoc) {
        return res.status(404).json({
          success: false,
          error: 'Referencia no encontrada'
        });
      }
    }

    // Crear transacción
    const transaction = new Transaction({
      fromUser: req.user.id,
      toUser,
      amount,
      currency: currency || 'USD',
      type,
      paymentMethod: paymentMethod || 'wallet',
      reference: reference || {},
      description,
      metadata: metadata || {},
      status: 'pending'
    });

    // Procesar el pago según el método de pago
    switch (paymentMethod) {
      case 'credit_card':
      case 'debit_card':
      case 'stripe':
        // Procesar pago con Stripe
        try {
          // Crear un cargo de Stripe
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe usa centavos
            currency: currency?.toLowerCase() || 'usd',
            description: description || `Pago a ${recipient.name}`,
            metadata: {
              userId: req.user.id,
              recipientId: toUser,
              reference: reference ? JSON.stringify(reference) : ''
            },
            payment_method: req.body.paymentMethodId,
            confirm: true,
            off_session: true,
            confirmation_method: 'manual'
          });

          // Actualizar transacción con la información del pago
          transaction.paymentDetails = {
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            clientSecret: paymentIntent.client_secret
          };

          // Si el pago fue exitoso, marcar como completado
          if (paymentIntent.status === 'succeeded') {
            transaction.status = 'completed';
            transaction.processedAt = new Date();
          }
        } catch (error) {
          console.error('Error al procesar el pago con Stripe:', error);
          
          transaction.status = 'failed';
          transaction.notes = [
            ...(transaction.notes || []),
            {
              note: `Error al procesar el pago: ${error.message}`,
              timestamp: new Date()
            }
          ];
          
          await transaction.save();
          
          return res.status(400).json({
            success: false,
            error: error.message || 'Error al procesar el pago con tarjeta'
          });
        }
        break;

      case 'paypal':
        // Lógica para procesar pagos con PayPal
        // Esto es un marcador de posición - necesitarás implementar la integración con PayPal
        transaction.paymentDetails = {
          provider: 'paypal',
          status: 'pending_verification'
        };
        break;

      case 'wallet':
        // Verificar que el usuario tenga saldo suficiente
        const user = await User.findById(req.user.id).select('+balance');
        
        if (user.balance < amount) {
          return res.status(400).json({
            success: false,
            error: 'Saldo insuficiente en tu billetera'
          });
        }
        
        // Descontar del saldo del remitente
        user.balance -= amount;
        await user.save();
        
        // Añadir al saldo del destinatario
        recipient.balance = (recipient.balance || 0) + amount;
        await recipient.save();
        
        // Marcar como completada
        transaction.status = 'completed';
        transaction.processedAt = new Date();
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Método de pago no válido'
        });
    }

    // Guardar la transacción
    await transaction.save();

    // Si la transacción fue exitosa, realizar acciones adicionales
    if (transaction.status === 'completed') {
      // Aquí podrías agregar lógica para desbloquear contenido, confirmar reservas, etc.
      // Por ejemplo, si es un pago por contenido o sesión
      if (reference && reference.id) {
        switch (reference.model) {
          case 'Content':
            // Marcar el contenido como comprado por el usuario
            await Content.findByIdAndUpdate(reference.id, {
              $addToSet: { purchasedBy: req.user.id }
            });
            break;
            
          case 'Session':
            // Agregar al usuario a la sesión
            await Session.findByIdAndUpdate(reference.id, {
              $addToSet: { 
                participants: { 
                  user: req.user.id,
                  role: 'participant',
                  joinedAt: new Date()
                } 
              }
            });
            break;
        }
      }
      
      // Enviar notificaciones
      await sendTransactionNotification(transaction);
    }

    // Obtener la transacción con datos poblados para la respuesta
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .populate('reference.id');

    res.status(201).json({
      success: true,
      data: populatedTransaction
    });
  } catch (error) {
    console.error('Error al crear transacción:', error);
    
    // Revertir cambios si es necesario (ej. en caso de error después de actualizar saldos)
    if (req.body.paymentMethod === 'wallet' && transaction) {
      // Revertir transacción de billetera
      try {
        await User.findByIdAndUpdate(req.user.id, { $inc: { balance: req.body.amount } });
        await User.findByIdAndUpdate(req.body.toUser, { $inc: { balance: -req.body.amount } });
      } catch (revertError) {
        console.error('Error al revertir transacción de billetera:', revertError);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al procesar la transacción',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reembolsar una transacción
// @route   POST /api/transactions/:id/refund
// @access  Private/Admin
exports.refundTransaction = async (req, res, next) => {
  try {
    // Validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;
    
    // Buscar la transacción
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: `Transacción no encontrada con el id ${req.params.id}`
      });
    }

    // Verificar que la transacción sea reembolsable
    if (transaction.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden reembolsar transacciones completadas'
      });
    }

    if (transaction.refundedAt) {
      return res.status(400).json({
        success: false,
        error: 'Esta transacción ya ha sido reembolsada'
      });
    }

    // Verificar que hayan pasado menos de 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (transaction.processedAt < thirtyDaysAgo) {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden reembolsar transacciones realizadas en los últimos 30 días'
      });
    }

    // Procesar el reembolso según el método de pago original
    let refundResult;
    
    switch (transaction.paymentMethod) {
      case 'credit_card':
      case 'debit_card':
      case 'stripe':
        // Procesar reembolso con Stripe
        try {
          const refund = await stripe.refunds.create({
            payment_intent: transaction.paymentDetails.paymentIntentId,
            reason: 'requested_by_customer',
            metadata: {
              reason: reason || 'Reembolso solicitado por el administrador',
              adminId: req.user.id
            }
          });
          
          refundResult = {
            provider: 'stripe',
            refundId: refund.id,
            status: refund.status,
            amount: refund.amount / 100 // Convertir de centavos a unidades
          };
        } catch (error) {
          console.error('Error al procesar el reembolso con Stripe:', error);
          
          return res.status(400).json({
            success: false,
            error: `Error al procesar el reembolso: ${error.message}`
          });
        }
        break;

      case 'paypal':
        // Lógica para reembolsos con PayPal
        // Esto es un marcador de posición - necesitarás implementar la integración con PayPal
        refundResult = {
          provider: 'paypal',
          status: 'pending',
          note: 'El reembolso está siendo procesado por PayPal'
        };
        break;

      case 'wallet':
        // Revertir la transacción en la billetera
        try {
          // Reembolsar al comprador
          await User.findByIdAndUpdate(transaction.fromUser, {
            $inc: { balance: transaction.amount }
          });
          
          // Descontar del vendedor
          await User.findByIdAndUpdate(transaction.toUser, {
            $inc: { balance: -transaction.amount }
          });
          
          refundResult = {
            provider: 'wallet',
            status: 'completed',
            processedAt: new Date()
          };
        } catch (error) {
          console.error('Error al procesar el reembolso en la billetera:', error);
          
          return res.status(500).json({
            success: false,
            error: 'Error al procesar el reembolso en la billetera'
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'No se puede reembolsar este tipo de transacción'
        });
    }

    // Crear transacción de reembolso
    const refundTransaction = new Transaction({
      fromUser: transaction.toUser, // El vendedor devuelve el dinero
      toUser: transaction.fromUser, // Al comprador
      amount: transaction.amount,
      currency: transaction.currency,
      type: 'refund',
      paymentMethod: transaction.paymentMethod,
      reference: {
        model: 'Transaction',
        id: transaction._id,
        description: `Reembolso de transacción #${transaction._id}`
      },
      description: `Reembolso: ${transaction.description || 'Sin descripción'}`,
      metadata: {
        originalTransaction: transaction._id,
        reason: reason || 'Reembolso solicitado',
        processedBy: req.user.id
      },
      status: refundResult.status === 'completed' ? 'completed' : 'pending',
      paymentDetails: refundResult,
      processedAt: refundResult.processedAt || null
    });

    await refundTransaction.save();

    // Actualizar la transacción original
    transaction.refundedAt = new Date();
    transaction.refundReason = reason || 'Reembolso solicitado';
    transaction.refundTransaction = refundTransaction._id;
    await transaction.save();

    // Enviar notificaciones
    await sendRefundNotification(transaction, refundTransaction, req.user.id);

    res.status(200).json({
      success: true,
      data: refundTransaction
    });
  } catch (error) {
    console.error('Error al procesar reembolso:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Transacción no encontrada'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al procesar el reembolso',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener el historial de transacciones de un usuario
// @route   GET /api/transactions/user/:userId
// @access  Private
exports.getUserTransactions = async (req, res, next) => {
  try {
    // Verificar permisos (solo el propio usuario o un administrador pueden ver el historial)
    if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para ver el historial de transacciones de este usuario'
      });
    }

    // Configurar la consulta
    const query = {
      $or: [
        { fromUser: req.params.userId },
        { toUser: req.params.userId }
      ]
    };

    // Filtros opcionales
    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    // Ordenar por fecha descendente por defecto
    const sort = req.query.sort || '-createdAt';

    // Paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Obtener transacciones
    const transactions = await Transaction.find(query)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .populate('reference.id')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Contar total de transacciones para la paginación
    const total = await Transaction.countDocuments(query);

    // Calcular total de páginas
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: transactions.length,
      page,
      pages,
      total,
      data: transactions
    });
  } catch (error) {
    console.error('Error al obtener el historial de transacciones:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener el historial de transacciones' 
    });
  }
};

// @desc    Obtener estadísticas de transacciones
// @route   GET /api/transactions/stats
// @access  Private/Admin
exports.getTransactionStats = async (req, res, next) => {
  try {
    // Verificar permisos de administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para ver estas estadísticas'
      });
    }

    // Obtener estadísticas generales
    const stats = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          type: { $ne: 'refund' } // Excluir reembolsos
        }
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgTransaction: { $avg: '$amount' },
          minTransaction: { $min: '$amount' },
          maxTransaction: { $max: '$amount' }
        }
      }
    ]);

    // Obtener estadísticas por tipo de transacción
    const statsByType = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          type: { $ne: 'refund' }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Obtener estadísticas por método de pago
    const statsByPaymentMethod = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          type: { $ne: 'refund' }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Obtener transacciones recientes
    const recentTransactions = await Transaction.find({ status: 'completed' })
      .sort('-createdAt')
      .limit(5)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email');

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || {},
        byType: statsByType,
        byPaymentMethod: statsByPaymentMethod,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de transacciones:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener estadísticas de transacciones' 
    });
  }
};

// Función auxiliar para enviar notificaciones de transacción
async function sendTransactionNotification(transaction) {
  try {
    // Aquí iría la lógica para enviar notificaciones por correo electrónico, push, etc.
    // Por ejemplo, usando un servicio como SendGrid, Firebase Cloud Messaging, etc.
    
    console.log(`Notificación: Transacción #${transaction._id} completada por $${transaction.amount} ${transaction.currency}`);
    
    // También podrías guardar la notificación en la base de datos
    // await Notification.create({
    //   user: transaction.fromUser,
    //   type: 'transaction_completed',
    //   title: 'Transacción completada',
    //   message: `Has realizado un pago de $${transaction.amount} ${transaction.currency}`,
    //   data: { transactionId: transaction._id }
    // });
    
    // await Notification.create({
    //   user: transaction.toUser,
    //   type: 'payment_received',
    //   title: 'Pago recibido',
    //   message: `Has recibido un pago de $${transaction.amount} ${transaction.currency}`,
    //   data: { transactionId: transaction._id }
    // });
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de transacción:', error);
    return false;
  }
}

// Función auxiliar para enviar notificaciones de reembolso
async function sendRefundNotification(originalTransaction, refundTransaction, processedBy) {
  try {
    // Aquí iría la lógica para enviar notificaciones de reembolso
    
    console.log(`Notificación: Reembolso #${refundTransaction._id} procesado por $${refundTransaction.amount} ${refundTransaction.currency}`);
    
    // Guardar notificaciones en la base de datos
    // await Notification.create([
    //   {
    //     user: originalTransaction.fromUser,
    //     type: 'refund_received',
    //     title: 'Reembolso recibido',
    //     message: `Has recibido un reembolso de $${refundTransaction.amount} ${refundTransaction.currency}`,
    //     data: { 
    //       transactionId: originalTransaction._id,
    //       refundId: refundTransaction._id
    //     }
    //   },
    //   {
    //     user: originalTransaction.toUser,
    //     type: 'refund_processed',
    //     title: 'Reembolso procesado',
    //     message: `Se ha procesado un reembolso de $${refundTransaction.amount} ${refundTransaction.currency} a ${originalTransaction.fromUser.name}`,
    //     data: { 
    //       transactionId: originalTransaction._id,
    //       refundId: refundTransaction._id
    //     }
    //   },
    //   {
    //     user: processedBy,
    //     type: 'refund_confirmation',
    //     title: 'Reembolso completado',
    //     message: `Has procesado un reembolso de $${refundTransaction.amount} ${refundTransaction.currency}`,
    //     data: { 
    //       transactionId: originalTransaction._id,
    //       refundId: refundTransaction._id
    //     }
    //   }
    // ]);
    
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de reembolso:', error);
    return false;
  }
}

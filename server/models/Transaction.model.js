module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: 'El monto debe ser mayor a 0'
        },
        isDecimal: {
          msg: 'El monto debe ser un número decimal válido'
        }
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'completed', 'failed', 'refunded']],
          msg: 'Estado de transacción no válido. Debe ser: pending, completed, failed o refunded'
        }
      }
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIP: {
          msg: 'Dirección IP no válida'
        }
      },
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  }, {
    tableName: 'transactions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      afterCreate: async (transaction) => {
        if (transaction.status === 'completed' && transaction.user_id) {
          // Aquí podrías añadir lógica para actualizar el saldo del usuario
          console.log(`Transacción completada para el usuario ${transaction.user_id} por un monto de ${transaction.amount}`);
        }
      }
    }
  });

  // Relaciones
  Transaction.associate = function(models) {
    Transaction.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    
    Transaction.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product',
    });
    
    Transaction.belongsTo(models.Offer, {
      foreignKey: 'offer_id',
      as: 'offer',
    });
  };

  return Transaction;
};

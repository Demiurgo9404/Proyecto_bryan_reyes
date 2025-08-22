module.exports = (sequelize, DataTypes) => {
  const Offer = sequelize.define('Offer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la oferta es requerido'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['percentage', 'fixed']],
          msg: 'Tipo de descuento no válido'
        }
      }
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: 'El valor del descuento debe ser mayor a 0'
        }
      },
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Fecha de inicio no válida'
        },
        isAfter: {
          args: [new Date().toISOString()],
          msg: 'La fecha de inicio debe ser futura'
        }
      },
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Fecha de fin no válida'
        },
        isAfterStartDate(value) {
          if (this.start_date && new Date(value) <= new Date(this.start_date)) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
          }
        },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    max_uses: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: 'El número máximo de usos debe ser al menos 1'
        },
        isInt: {
          msg: 'El número máximo de usos debe ser un número entero'
        }
      },
    },
    current_uses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'offers',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeSave: async (offer) => {
        if (offer.start_date && offer.end_date && new Date(offer.start_date) >= new Date(offer.end_date)) {
          throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
        }
        
        if (offer.end_date && new Date(offer.end_date) < new Date()) {
          offer.is_active = false;
        }

        // Validar que el número de usos actual no supere el máximo permitido
        if (offer.max_uses !== null && offer.current_uses >= offer.max_uses) {
          offer.is_active = false;
        }
      }
    }
  });

  // Relaciones
  Offer.associate = function(models) {
    Offer.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product',
      onDelete: 'CASCADE'
    });
    
    Offer.hasMany(models.Transaction, {
      foreignKey: 'offer_id',
      as: 'transactions',
    });
  };

  // Método para verificar si la oferta está activa
  Offer.prototype.isValid = function() {
    const now = new Date();
    return (
      this.is_active &&
      new Date(this.start_date) <= now &&
      new Date(this.end_date) >= now &&
      (this.max_uses === null || this.current_uses < this.max_uses)
    );
  };

  // Método para aplicar la oferta a un precio
  Offer.prototype.applyDiscount = function(price) {
    if (!this.isValid()) {
      throw new Error('La oferta no es válida o ha expirado');
    }

    if (this.discount_type === 'percentage') {
      return price * (1 - this.discount_value / 100);
    } else {
      return Math.max(0, price - this.discount_value);
    }
  };

  return Offer;
};

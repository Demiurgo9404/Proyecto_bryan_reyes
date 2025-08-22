module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
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
          msg: 'El nombre del producto es requerido'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    coins: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'El producto debe valer al menos 1 moneda'
        },
        isInt: {
          msg: 'El valor en monedas debe ser un número entero'
        }
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: 'El precio debe ser mayor a 0'
        }
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'out_of_stock'),
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'inactive', 'out_of_stock']],
          msg: 'Estado no válido'
        }
      }
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'La URL de la imagen no es válida'
        }
      },
    },
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  // Relaciones
  Product.associate = function(models) {
    Product.hasMany(models.Offer, {
      foreignKey: 'product_id',
      as: 'offers',
    });
    
    Product.hasMany(models.Transaction, {
      foreignKey: 'product_id',
      as: 'transactions',
    });
  };

  return Product;
};

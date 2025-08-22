'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear tabla de productos (paquetes de monedas)
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      coins: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Crear tabla de ofertas
    await queryInterface.createTable('offers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      discount_type: {
        type: Sequelize.ENUM('percentage', 'fixed'),
        allowNull: false,
      },
      discount_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      product_id: {
        type: Sequelize.UUID,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Crear tabla de transacciones
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      product_id: {
        type: Sequelize.UUID,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      offer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'offers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending',
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      payment_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Crear tabla de roles (si no existe)
    try {
      await queryInterface.createTable('roles', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Insertar roles por defecto
      await queryInterface.bulkInsert('roles', [
        { id: '00000000-0000-0000-0000-000000000001', name: 'admin', description: 'Administrador del sistema' },
        { id: '00000000-0000-0000-0000-000000000002', name: 'user', description: 'Usuario estándar' },
        { id: '00000000-0000-0000-0000-000000000003', name: 'model', description: 'Modelo' },
        { id: '00000000-0000-0000-0000-000000000004', name: 'agency', description: 'Agencia' },
      ]);
    } catch (error) {
      console.log('La tabla de roles ya existe, omitiendo creación');
    }

    // Crear tabla de permisos
    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Crear tabla de relación entre roles y permisos
    await queryInterface.createTable('role_permissions', {
      role_id: {
        type: Sequelize.UUID,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permission_id: {
        type: Sequelize.UUID,
        references: {
          model: 'permissions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Añadir clave foránea de role_id a la tabla users si no existe
    try {
      await queryInterface.addColumn('users', 'role_id', {
        type: Sequelize.UUID,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    } catch (error) {
      console.log('La columna role_id ya existe en la tabla users');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar las tablas en orden inverso para evitar errores de clave foránea
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('offers');
    await queryInterface.dropTable('products');
    
    // No eliminamos roles para evitar pérdida de datos
    // await queryInterface.dropTable('roles');
  }
};

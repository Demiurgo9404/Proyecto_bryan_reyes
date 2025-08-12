'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('user', 'model', 'admin'),
        defaultValue: 'user',
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      reset_password_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reset_password_expire: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      verification_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verification_expire: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      login_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      stripe_customer_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      credits: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('masculino', 'femenino', 'otro', 'prefiero no decirlo'),
        defaultValue: 'prefiero no decirlo',
      },
      birth_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      profile_picture: {
        type: Sequelize.STRING,
        defaultValue: 'default.jpg',
      },
      cover_photo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      billing_line1: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      billing_line2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      billing_city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      billing_state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      billing_postal_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      billing_country: {
        type: Sequelize.STRING,
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

    // Crear índices para mejorar el rendimiento de las búsquedas
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['username'], { unique: true });
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['is_verified']);
    await queryInterface.addIndex('users', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primero eliminamos la restricción del enum existente
    await queryInterface.sequelize.query(
      'ALTER TABLE IF EXISTS "users" DROP CONSTRAINT IF EXISTS "users_role_check"',
      { raw: true }
    );

    // Luego actualizamos la columna con el nuevo enum
    await queryInterface.sequelize.query(
      'ALTER TABLE IF EXISTS "users" ALTER COLUMN "role" TYPE VARCHAR(255)',
      { raw: true }
    );

    // Aseguramos que el valor por defecto sea 'user' y actualizamos el enum
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('user', 'model', 'admin', 'agency'),
      allowNull: false,
      defaultValue: 'user'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir a la versión anterior del enum
    await queryInterface.sequelize.query(
      'ALTER TABLE IF EXISTS "users" DROP CONSTRAINT IF EXISTS "users_role_check"',
      { raw: true }
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE IF EXISTS "users" ALTER COLUMN "role" TYPE VARCHAR(255)',
      { raw: true }
    );

    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('user', 'model', 'admin'),
      allowNull: false,
      defaultValue: 'user'
    });
  }
};

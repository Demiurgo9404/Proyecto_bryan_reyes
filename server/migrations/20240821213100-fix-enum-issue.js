'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Primero, crear un tipo ENUM temporal
    await queryInterface.sequelize.query(
      `CREATE TYPE enum_users_role_new AS ENUM ('user', 'model', 'admin', 'agency')`
    );

    // 2. Añadir una nueva columna con el tipo correcto
    await queryInterface.addColumn('users', 'role_new', {
      type: 'enum_users_role_new',
      using: 'role::text::enum_users_role_new',
      allowNull: false,
      defaultValue: 'user'
    });

    // 3. Eliminar la columna antigua
    await queryInterface.removeColumn('users', 'role');

    // 4. Renombrar la nueva columna
    await queryInterface.renameColumn('users', 'role_new', 'role');

    // 5. Eliminar el tipo ENUM antiguo
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_role');

    // 6. Renombrar el tipo nuevo
    await queryInterface.sequelize.query('ALTER TYPE enum_users_role_new RENAME TO enum_users_role');
  },

  down: async (queryInterface, Sequelize) => {
    // No hacemos rollback para evitar más problemas
    console.log('No se puede hacer rollback de esta migración');
  }
};

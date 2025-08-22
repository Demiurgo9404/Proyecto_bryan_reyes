'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add is_verified column if it doesn't exist
    await queryInterface.addColumn('users', 'is_verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    // Add is_active column if it doesn't exist
    await queryInterface.addColumn('users', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    // Update all existing users to be verified and active
    await queryInterface.sequelize.query(
      `UPDATE users SET is_verified = true, is_active = true`
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'is_verified');
    await queryInterface.removeColumn('users', 'is_active');
  }
};

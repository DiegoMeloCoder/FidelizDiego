'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if the column already exists to make the migration idempotent
    const tableDescription = await queryInterface.describeTable('Rewards');
    if (!tableDescription.stock) {
      await queryInterface.addColumn('Rewards', 'stock', {
        type: Sequelize.INTEGER,
        allowNull: true, // null significa stock infinito
        defaultValue: null, // Por defecto es infinito
        // 'after' option might not be supported by all dialects/versions, removing for safety
        // after: 'isActive'
      });
    } else {
      console.log('Column "stock" already exists in "Rewards". Skipping addColumn.');
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Rewards', 'stock');
  }
};

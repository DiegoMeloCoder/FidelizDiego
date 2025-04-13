'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Rewards', 'stock', {
      type: Sequelize.INTEGER,
      allowNull: true, // null significa stock infinito
      defaultValue: null, // Por defecto es infinito
      after: 'isActive' // Opcional: colocar la columna después de 'isActive'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Rewards', 'stock');
  }
};

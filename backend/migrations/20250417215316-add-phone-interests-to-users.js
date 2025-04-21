'use strict';

const { DataTypes } = require('sequelize'); // Import DataTypes

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add phoneNumber column
    await queryInterface.addColumn('Users', 'phoneNumber', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    // Add interests column
    await queryInterface.addColumn('Users', 'interests', {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove interests column
    await queryInterface.removeColumn('Users', 'interests');

    // Remove phoneNumber column
    await queryInterface.removeColumn('Users', 'phoneNumber');
  }
};

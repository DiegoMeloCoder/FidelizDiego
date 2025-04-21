'use strict';

const { DataTypes } = require('sequelize'); // Import DataTypes

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add tags column
    await queryInterface.addColumn('Rewards', 'tags', {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    });

    // Add likes column
    await queryInterface.addColumn('Rewards', 'likes', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { // Adding validation here too for consistency, though model validation is primary
        min: 0
      }
    });

    // Add dislikes column
    await queryInterface.addColumn('Rewards', 'dislikes', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
       validate: {
        min: 0
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove dislikes column
    await queryInterface.removeColumn('Rewards', 'dislikes');

    // Remove likes column
    await queryInterface.removeColumn('Rewards', 'likes');

    // Remove tags column
    await queryInterface.removeColumn('Rewards', 'tags');
  }
};

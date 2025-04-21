'use strict';

const { DataTypes } = require('sequelize'); // Import DataTypes

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Anomalies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      employeeId: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      adminId: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('New', 'Reviewed', 'Dismissed'),
        allowNull: false,
        defaultValue: 'New',
      },
      referenceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    // Add indexes separately for better control if needed
    await queryInterface.addIndex('Anomalies', ['status', 'timestamp']);
    await queryInterface.addIndex('Anomalies', ['companyId', 'status']);
    await queryInterface.addIndex('Anomalies', ['type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Anomalies');
    // If using ENUM types directly in PostgreSQL, you might need to drop the type:
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Anomalies_status";');
  }
};

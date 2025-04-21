'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Anomaly extends Model {
    static associate(models) {
      // Optional associations if needed later (e.g., link directly to User, Company)
      Anomaly.belongsTo(models.Company, { foreignKey: 'companyId', as: 'company' });
      Anomaly.belongsTo(models.User, { foreignKey: 'employeeId', as: 'employee' });
      Anomaly.belongsTo(models.User, { foreignKey: 'adminId', as: 'admin' });
      // Could add associations for assignmentId, redemptionId, rewardId if needed for deep dives
    }
  }
  Anomaly.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type: { // e.g., 'Large Point Assignment', 'Large Point Redemption', 'High Frequency/Value Redemption'
        type: DataTypes.STRING,
        allowNull: false,
      },
      timestamp: { // When the anomaly occurred or was detected
        type: DataTypes.DATE,
        allowNull: false,
      },
      companyId: { // Company associated with the anomaly (null if global?)
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for potential system-wide anomalies or if user info isn't fetched
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      employeeId: { // Employee involved (if applicable)
        type: DataTypes.STRING,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      adminId: { // Admin involved (if applicable, e.g., for assignments)
        type: DataTypes.STRING,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      details: { // Text description of the anomaly
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: { // 'New', 'Reviewed', 'Dismissed'
        type: DataTypes.ENUM('New', 'Reviewed', 'Dismissed'),
        allowNull: false,
        defaultValue: 'New',
      },
      referenceId: { // Optional: Store ID of related record (assignment, redemption)
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // createdAt and updatedAt added automatically
    },
    {
      sequelize,
      modelName: 'Anomaly',
      timestamps: true,
      indexes: [
        { fields: ['status', 'timestamp'] },
        { fields: ['companyId', 'status'] },
        { fields: ['type'] },
      ],
    }
  );
  return Anomaly;
};

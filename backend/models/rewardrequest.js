const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RewardRequest extends Model {
    static associate(models) {
      RewardRequest.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user', // Alias for the user who made the request
      });
      RewardRequest.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company', // Alias for the company the request belongs to
      });
    }
  }
  RewardRequest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING, // Matches User.id (Firebase UID)
        allowNull: true, // Allow null in case user is deleted later
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Keep the request even if user is deleted
      },
      companyId: {
        type: DataTypes.INTEGER, // Matches Company.id
        allowNull: false, // Request must belong to a company
        references: {
          model: 'Companies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // If company is deleted, remove its requests
      },
      requestedItem: {
        // Reemplaza requestText
        type: DataTypes.STRING,
        allowNull: true, // Permitir nulos temporalmente
      },
      additionalNotes: {
        // Nuevo campo opcional
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          'new',
          'reviewed',
          'planned',
          'implemented',
          'rejected'
        ),
        allowNull: false,
        defaultValue: 'new',
      },
      // createdAt y updatedAt son añadidos automáticamente
    },
    {
      sequelize,
      modelName: 'RewardRequest',
      timestamps: true,
    }
  );
  return RewardRequest;
};

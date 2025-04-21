'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Reward extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Reward.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        allowNull: true, // Allow association to be nullable for global rewards
      });
      Reward.hasMany(models.Redemption, {
        foreignKey: 'recompensaId',
        as: 'redemptions',
      });
    }
  }
  Reward.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for global rewards
        references: {
          model: 'Companies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Si se borra la empresa, se borran sus recompensas
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pointsRequired: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1, // Los puntos requeridos deben ser al menos 1
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: true, // null = infinito
        validate: {
          min: 0 // El stock no puede ser negativo
        }
      },
      imageUrl: { // Add the new field for image URL
        type: DataTypes.STRING,
        allowNull: true,
      },
      tags: { // Nuevo campo para tags/categorías
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      likes: { // Nuevo campo para contador de likes
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      dislikes: { // Nuevo campo para contador de dislikes
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      // createdAt y updatedAt son añadidos automáticamente
    },
    {
      sequelize,
      modelName: 'Reward',
      // tableName: 'Rewards'
      timestamps: true,
    }
  );
  return Reward;
};

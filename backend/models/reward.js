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
      Reward.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        allowNull: true,
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
          min: 0, // El stock no puede ser negativo
        },
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      likes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      dislikes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: 'Reward',
      timestamps: true,
      // Definición explícita de índices
      indexes: [
        { fields: ['companyId'] }, // Índice en 'companyId' (importante para filtrar globales vs. específicos)
        { fields: ['isActive'] }, // Índice en 'isActive'
        // Podrías considerar un índice en 'tags' si haces búsquedas frecuentes por tags,
        // aunque los índices en campos ARRAY son más complejos y dependen del SGBD.
        // Por ahora, lo dejamos así.
      ],
    }
  );
  return Reward;
};

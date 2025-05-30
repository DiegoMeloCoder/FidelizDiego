'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      Company.hasMany(models.User, {
        foreignKey: 'companyId',
        as: 'users',
      });
      Company.hasMany(models.Reward, {
        foreignKey: 'companyId',
        as: 'rewards',
      });
      Company.hasMany(models.Justification, {
        foreignKey: 'companyId',
        as: 'justifications',
      });
      Company.hasMany(models.PointAssignment, {
        foreignKey: 'companyId',
        as: 'pointAssignments',
      });
      Company.hasMany(models.Redemption, {
        foreignKey: 'companyId',
        as: 'redemptions',
      });
    }
  }
  Company.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Esto ya crea un índice único
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'pending_payment'),
        allowNull: false,
        defaultValue: 'active',
      },
      logoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      motto: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      primaryColor: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^#[0-9A-F]{6}$/i,
        },
      },
      secondaryColor: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^#[0-9A-F]{6}$/i,
        },
      },
      tertiaryColor: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^#[0-9A-F]{6}$/i,
        },
      },
    },
    {
      sequelize,
      modelName: 'Company',
      timestamps: true,
      // Definición explícita de índices
      indexes: [
        { fields: ['status'] }, // Índice en la columna 'status'
        // 'nombre' ya tiene un índice único
      ],
    }
  );
  return Company;
};

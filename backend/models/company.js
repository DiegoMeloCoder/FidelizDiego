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
      // define association here
      Company.hasMany(models.User, {
        foreignKey: 'companyId',
        as: 'users', // Alias para la asociación (Admins y Employees)
      });
      Company.hasMany(models.Reward, {
        foreignKey: 'companyId',
        as: 'rewards',
      });
      Company.hasMany(models.Justification, {
        foreignKey: 'companyId',
        as: 'justifications', // Justificaciones específicas de la empresa
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
        unique: true, // Asumimos que el nombre de la empresa debe ser único
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'pending_payment'),
        allowNull: false,
        defaultValue: 'active',
      },
      // Branding fields
      logoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true, // Optional: Validate if it's a URL format
        }
      },
      motto: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      primaryColor: {
        type: DataTypes.STRING, // Store as HEX string e.g., #RRGGBB
        allowNull: true,
        validate: {
          is: /^#[0-9A-F]{6}$/i, // Optional: Validate HEX format
        }
      },
      secondaryColor: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^#[0-9A-F]{6}$/i, // Optional: Validate HEX format
        }
      },
      tertiaryColor: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^#[0-9A-F]{6}$/i, // Optional: Validate HEX format
        }
      },
      // createdAt y updatedAt son añadidos automáticamente por Sequelize
    },
    {
      sequelize,
      modelName: 'Company',
      // tableName: 'Companies' // Sequelize pluraliza por defecto
      timestamps: true,
    }
  );
  return Company;
};

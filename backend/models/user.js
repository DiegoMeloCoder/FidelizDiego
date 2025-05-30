'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        allowNull: true, // Permitir nulo para Managers
      });
      // Asociaciones inversas (opcional pero útil definirlas aquí o en el otro modelo)
      // models.Company.hasMany(User, { foreignKey: 'companyId', as: 'users' });

      // Asociaciones con PuntosAsignados (si el admin/empleado que asigna/recibe se guarda por User ID)
      // User.hasMany(models.PointAssignment, { foreignKey: 'adminId', as: 'assignedByAdmin' });
      // User.hasMany(models.PointAssignment, { foreignKey: 'empleadoId', as: 'pointsReceived' });

      // Asociaciones con Canjes
      // User.hasMany(models.Redemption, { foreignKey: 'empleadoId', as: 'redemptionsMade' });
    }
  }
  User.init(
    {
      id: {
        // Usaremos el UID de Firebase Auth como ID principal
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('Manager', 'Admin', 'Employee'),
        allowNull: false,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Managers no pertenecen a una compañía específica
        references: {
          model: 'Companies', // Nombre de la tabla (pluralizado por defecto por Sequelize)
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // O 'CASCADE' si al borrar empresa se borran usuarios (cuidado)
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interests: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: true,
      // Definición explícita de índices para columnas consultadas frecuentemente
      indexes: [
        { fields: ['role'] }, // Índice en la columna 'role'
        { fields: ['companyId'] }, // Índice en la clave foránea 'companyId'
        { fields: ['isActive'] }, // Índice en la columna 'isActive'
        // 'email' ya tiene un índice único debido a la restricción 'unique: true'
      ],
    }
  );
  return User;
};

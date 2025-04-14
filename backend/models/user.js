'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => { // Modificado para exportar una función que recibe sequelize
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company', // Alias para la asociación
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
      id: { // Usaremos el UID de Firebase Auth como ID principal
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
        allowNull: true, // Nombre puede ser opcional inicialmente
      },
      role: {
        type: DataTypes.ENUM('Manager', 'Admin', 'Employee'),
        allowNull: false,
      },
      companyId: {
        type: DataTypes.INTEGER, // Asumiendo que Company.id será INTEGER
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
      // createdAt y updatedAt son añadidos automáticamente por Sequelize
    },
    {
      sequelize,
      modelName: 'User',
      // tableName: 'users' // Opcional: Sequelize pluraliza por defecto
      timestamps: true, // Habilitar createdAt y updatedAt
    }
  );
  return User;
};

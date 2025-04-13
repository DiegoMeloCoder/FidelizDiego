'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Redemption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Redemption.belongsTo(models.User, {
        foreignKey: 'empleadoId',
        as: 'employee', // El empleado que realizó el canje
        allowNull: false,
      });
      Redemption.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        allowNull: false,
      });
      Redemption.belongsTo(models.Reward, {
        foreignKey: 'recompensaId',
        as: 'reward', // La recompensa canjeada
        allowNull: false, // O SET NULL si se permite borrar recompensas pero mantener historial
      });
    }
  }
  Redemption.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      empleadoId: {
        type: DataTypes.STRING, // Coincide con User.id (Firebase UID)
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Si se borra el empleado, borrar sus canjes?
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      recompensaId: {
        type: DataTypes.INTEGER,
        allowNull: false, // O true si onDelete es SET NULL
        references: {
          model: 'Rewards',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // No permitir borrar recompensa si hay canjes asociados (o SET NULL)
      },
      puntosCosto: { // Guardar el costo en el momento del canje
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fechaCanje: { // Sequelize maneja createdAt, pero podemos tener uno específico
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      // empleadoEmail, recompensaNombre se pueden obtener por asociación.
      // Decidir si desnormalizar o no. Por ahora, se obtendrán por joins/includes.
      // createdAt y updatedAt son añadidos automáticamente
    },
    {
      sequelize,
      modelName: 'Redemption',
      // tableName: 'Redemptions'
      timestamps: true,
      // Índices útiles para buscar historial
      indexes: [
        { fields: ['empleadoId', 'fechaCanje'] },
        { fields: ['companyId', 'fechaCanje'] },
        { fields: ['recompensaId'] },
      ],
    }
  );
  return Redemption;
};

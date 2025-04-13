'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Justification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Justification.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        allowNull: true, // Permitir nulo para justificaciones globales/predeterminadas
      });
      Justification.hasMany(models.PointAssignment, {
        foreignKey: 'justificacionId',
        as: 'pointAssignments',
      });
    }
  }
  Justification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      textoJustificacion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Nulo significa que es una justificación global/predeterminada
        references: {
          model: 'Companies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Si se borra la empresa, se borran sus justificaciones específicas
      },
      estaActiva: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      esPredeterminada: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Por defecto, no es predeterminada (es específica de empresa o creada ad-hoc)
      },
      // createdAt y updatedAt son añadidos automáticamente
    },
    {
      sequelize,
      modelName: 'Justification',
      // tableName: 'Justifications'
      timestamps: true,
      // Añadir índice para buscar justificaciones activas por empresa o globales
      indexes: [
        {
          fields: ['companyId', 'estaActiva', 'esPredeterminada'],
        },
      ],
    }
  );
  return Justification;
};

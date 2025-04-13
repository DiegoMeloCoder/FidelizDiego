'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PointAssignment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PointAssignment.belongsTo(models.User, {
        foreignKey: 'adminId',
        as: 'admin', // El admin que asignó los puntos
        allowNull: false,
      });
      PointAssignment.belongsTo(models.User, {
        foreignKey: 'empleadoId',
        as: 'employee', // El empleado que recibió los puntos
        allowNull: false,
      });
      PointAssignment.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        allowNull: false,
      });
      PointAssignment.belongsTo(models.Justification, {
        foreignKey: 'justificacionId',
        as: 'justification',
        allowNull: false,
      });
    }
  }
  PointAssignment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      adminId: { // Quién asignó
        type: DataTypes.STRING, // Coincide con User.id (Firebase UID)
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Opcional: si se borra el admin, mantener el registro?
      },
      empleadoId: { // Quién recibió
        type: DataTypes.STRING, // Coincide con User.id (Firebase UID)
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Si se borra el empleado, borrar sus asignaciones?
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
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'La cantidad debe ser un número entero.' }, // Asegurar que sea entero
          notNull: { msg: 'La cantidad no puede ser nula.' }, // Redundante con allowNull, pero explícito
          notZero(value) { // Validación personalizada para no ser cero
            if (value === 0) {
              throw new Error('La cantidad no puede ser cero.');
            }
          }
        },
      },
      fechaAsignacion: { // Sequelize maneja createdAt, pero podemos tener uno específico si es necesario
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      justificacionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Justifications',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT', // No permitir borrar una justificación si está en uso
      },
      justificacionTexto: { // Guardar el texto en el momento de la asignación por si la justificación original cambia/se borra
        type: DataTypes.STRING,
        allowNull: false,
      },
      // adminEmail, empleadoEmail, empleadoName se pueden obtener por asociación,
      // pero se guardaron en Firestore. Decidir si desnormalizar aquí o no.
      // Por ahora, se obtendrán mediante joins/includes.
      // createdAt y updatedAt son añadidos automáticamente
    },
    {
      sequelize,
      modelName: 'PointAssignment',
      // tableName: 'PointAssignments'
      timestamps: true,
      // Índices útiles para buscar historial
      indexes: [
        { fields: ['empleadoId', 'fechaAsignacion'] },
        { fields: ['adminId', 'fechaAsignacion'] },
        { fields: ['companyId', 'fechaAsignacion'] },
      ],
    }
  );
  return PointAssignment;
};

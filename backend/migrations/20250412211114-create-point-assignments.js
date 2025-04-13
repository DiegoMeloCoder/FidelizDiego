'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PointAssignments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      adminId: {
        type: Sequelize.STRING, // User ID (Firebase UID)
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Opcional: mantener registro si se borra admin
      },
      empleadoId: {
        type: Sequelize.STRING, // User ID (Firebase UID)
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Borrar asignaciones si se borra empleado
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fechaAsignacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      justificacionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Justifications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // No borrar justificación si está en uso
      },
      justificacionTexto: { // Texto denormalizado
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    // Añadir índices
    await queryInterface.addIndex('PointAssignments', ['empleadoId', 'fechaAsignacion']);
    await queryInterface.addIndex('PointAssignments', ['adminId', 'fechaAsignacion']);
    await queryInterface.addIndex('PointAssignments', ['companyId', 'fechaAsignacion']);
    await queryInterface.addIndex('PointAssignments', ['justificacionId']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PointAssignments');
  }
};

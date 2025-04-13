'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Justifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      textoJustificacion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Nulo para justificaciones globales
        references: {
          model: 'Companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Si se borra la empresa, borrar sus justificaciones
      },
      estaActiva: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      esPredeterminada: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    // Añadir índice para buscar justificaciones activas por empresa o globales
    await queryInterface.addIndex('Justifications', ['companyId', 'estaActiva', 'esPredeterminada']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Justifications');
  }
};

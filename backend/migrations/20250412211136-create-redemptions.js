'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Redemptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      empleadoId: {
        type: Sequelize.STRING, // User ID (Firebase UID)
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Borrar canjes si se borra empleado
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
      recompensaId: {
        type: Sequelize.INTEGER,
        allowNull: false, // O true si onDelete es SET NULL en el modelo
        references: {
          model: 'Rewards',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // No borrar recompensa si hay canjes
      },
      puntosCosto: { // Costo denormalizado
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fechaCanje: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
    await queryInterface.addIndex('Redemptions', ['empleadoId', 'fechaCanje']);
    await queryInterface.addIndex('Redemptions', ['companyId', 'fechaCanje']);
    await queryInterface.addIndex('Redemptions', ['recompensaId']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Redemptions');
  }
};

'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Usar una transacción para agrupar los cambios
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Añadir la nueva columna 'requestedItem'
      await queryInterface.addColumn('RewardRequests', 'requestedItem', {
        type: DataTypes.STRING,
        allowNull: true, // Permitir nulos temporalmente para filas existentes
      }, { transaction });

      // 2. Añadir la nueva columna 'additionalNotes'
      await queryInterface.addColumn('RewardRequests', 'additionalNotes', {
        type: DataTypes.TEXT,
        allowNull: true, // Notas adicionales son opcionales
      }, { transaction });

      // 3. (Opcional pero recomendado) Copiar datos existentes si es posible/necesario
      // Si hubiera datos en requestText que quisiéramos mapear a requestedItem,
      // se haría una consulta UPDATE aquí. Por ahora, asumimos que no hay datos críticos
      // o que la tabla está vacía/es nueva.

      // 4. Eliminar la columna antigua 'requestText'
      await queryInterface.removeColumn('RewardRequests', 'requestText', { transaction });

      // Confirmar la transacción
      await transaction.commit();
    } catch (err) {
      // Revertir en caso de error
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    // Revertir los cambios en orden inverso
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Volver a añadir la columna 'requestText'
      await queryInterface.addColumn('RewardRequests', 'requestText', {
        type: DataTypes.TEXT,
        allowNull: true, // Permitir nulos al revertir también, por si acaso
      }, { transaction });

      // 2. (Opcional) Copiar datos de vuelta si es posible desde requestedItem/additionalNotes
      // Esto sería complejo y dependiente de la lógica de mapeo.

      // 3. Eliminar la columna 'additionalNotes'
      await queryInterface.removeColumn('RewardRequests', 'additionalNotes', { transaction });

      // 4. Eliminar la columna 'requestedItem'
      await queryInterface.removeColumn('RewardRequests', 'requestedItem', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};

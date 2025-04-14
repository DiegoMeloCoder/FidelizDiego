'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // Change companyId column to allow null values
    await queryInterface.changeColumn('Rewards', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow NULL
      references: { // Keep references
        model: 'Companies',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // Or SET NULL if preferred for global rewards upon company deletion? Let's keep CASCADE for now.
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Change companyId column back to NOT allow null values
    // WARNING: This might fail if global rewards (companyId=NULL) exist when reverting.
    await queryInterface.changeColumn('Rewards', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: false, // Revert back to NOT NULL
       references: {
        model: 'Companies',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
};

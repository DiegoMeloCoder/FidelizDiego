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
    await queryInterface.addColumn('Companies', 'logoUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Companies', 'motto', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Companies', 'primaryColor', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Companies', 'secondaryColor', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Companies', 'tertiaryColor', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Companies', 'logoUrl');
    await queryInterface.removeColumn('Companies', 'motto');
    await queryInterface.removeColumn('Companies', 'primaryColor');
    await queryInterface.removeColumn('Companies', 'secondaryColor');
    await queryInterface.removeColumn('Companies', 'tertiaryColor');
  }
};

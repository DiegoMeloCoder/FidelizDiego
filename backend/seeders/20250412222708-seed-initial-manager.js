'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const managerUid = '3psURkWhO9bAmzUDyZgfFjwMmDm1'; // UID proporcionado
    const managerEmail = 'managersql@gmail.com'; // Email proporcionado

    await queryInterface.bulkInsert('Users', [{
      id: managerUid, // Usar el UID de Firebase como PK
      email: managerEmail,
      nombre: 'Manager Principal', // Puedes cambiar este nombre si quieres
      role: 'Manager',
      companyId: null, // Los Managers no pertenecen a una compañía específica
      points: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    const managerUid = '3psURkWhO9bAmzUDyZgfFjwMmDm1';
    await queryInterface.bulkDelete('Users', { id: managerUid }, {});
  }
};

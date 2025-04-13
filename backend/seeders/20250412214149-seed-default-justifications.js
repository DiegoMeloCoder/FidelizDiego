'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const defaultJustifications = [
      {
        textoJustificacion: 'Reconocimiento por desempeño excepcional',
        companyId: null, // Global
        estaActiva: true,
        esPredeterminada: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        textoJustificacion: 'Cumplimiento de objetivos mensuales',
        companyId: null, // Global
        estaActiva: true,
        esPredeterminada: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        textoJustificacion: 'Colaboración destacada en equipo',
        companyId: null, // Global
        estaActiva: true,
        esPredeterminada: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        textoJustificacion: 'Iniciativa y proactividad',
        companyId: null, // Global
        estaActiva: true,
        esPredeterminada: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        textoJustificacion: 'Aniversario en la empresa',
        companyId: null, // Global
        estaActiva: true,
        esPredeterminada: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Justifications', defaultJustifications, {});
  },

  async down (queryInterface, Sequelize) {
    // Eliminar específicamente las justificaciones insertadas por este seeder
    const { Op } = Sequelize;
    await queryInterface.bulkDelete('Justifications', {
      [Op.or]: [
        { textoJustificacion: 'Reconocimiento por desempeño excepcional' },
        { textoJustificacion: 'Cumplimiento de objetivos mensuales' },
        { textoJustificacion: 'Colaboración destacada en equipo' },
        { textoJustificacion: 'Iniciativa y proactividad' },
        { textoJustificacion: 'Aniversario en la empresa' }
      ],
      companyId: null, // Asegurarse que sean las globales
      esPredeterminada: true
    }, {});
  }
};

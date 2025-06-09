const { Justification } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');

/**
 * Obtiene las justificaciones para un admin.
 * Incluye las globales (activas y predeterminadas) y las específicas de su compañía.
 * @param {number} adminCompanyId - El ID de la compañía del admin.
 * @returns {Promise<Justification[]>}
 */
const getJustificationsService = async (adminCompanyId) => {
  if (!adminCompanyId) {
    throw new AppError(
      'El administrador debe estar asignado a una compañía para ver justificaciones.',
      403
    );
  }

  const justifications = await Justification.findAll({
    where: {
      [Op.or]: [
        { companyId: null, esPredeterminada: true, estaActiva: true }, // Globales, activas y predeterminadas
        { companyId: adminCompanyId }, // Todas las de la compañía del admin (activas e inactivas)
      ],
    },
    order: [
      ['companyId', 'ASC NULLS FIRST'],
      ['esPredeterminada', 'DESC'],
      ['textoJustificacion', 'ASC'],
    ],
  });
  return justifications;
};

/**
 * Crea una nueva justificación específica para una compañía.
 * @param {string} texto - El texto de la justificación.
 * @param {number} adminCompanyId - El ID de la compañía del admin.
 * @returns {Promise<Justification>}
 */
const createJustificationService = async (texto, adminCompanyId) => {
  if (!adminCompanyId) {
    throw new AppError(
      'El administrador debe estar asignado a una compañía para crear justificaciones.',
      403
    );
  }
  // La validación de que 'texto' existe se hará en el controlador.
  const newJustification = await Justification.create({
    textoJustificacion: texto,
    companyId: adminCompanyId,
    estaActiva: true,
    esPredeterminada: false, // Las creadas por admins nunca son predeterminadas
  });
  return newJustification;
};

/**
 * Helper para encontrar una justificación editable por un admin.
 * Lanza un error si no se encuentra o no es editable.
 * @param {number} justificationId - ID de la justificación.
 * @param {number} adminCompanyId - ID de la compañía del admin.
 * @returns {Promise<Justification>} La instancia de la justificación.
 */
const findEditableJustification = async (justificationId, adminCompanyId) => {
  const justification = await Justification.findOne({
    where: {
      id: justificationId,
      companyId: adminCompanyId, // Asegura que pertenece a la compañía del admin
      esPredeterminada: false, // Asegura que no es una justificación global/predeterminada
    },
  });

  if (!justification) {
    throw new AppError(
      'Justificación no encontrada, no pertenece a su compañía, o no es editable.',
      404
    );
  }
  return justification;
};

/**
 * Actualiza una justificación específica de una compañía.
 * @param {number} justificationId - ID de la justificación.
 * @param {number} adminCompanyId - ID de la compañía del admin.
 * @param {object} updateData - Datos para actualizar.
 * @returns {Promise<Justification>}
 */
const updateJustificationService = async (
  justificationId,
  adminCompanyId,
  updateData
) => {
  const justification = await findEditableJustification(
    justificationId,
    adminCompanyId
  );

  const { textoJustificacion, estaActiva } = updateData;
  if (textoJustificacion !== undefined)
    justification.textoJustificacion = textoJustificacion;
  if (estaActiva !== undefined) justification.estaActiva = estaActiva;

  await justification.save();
  return justification;
};

/**
 * Alterna el estado activo/inactivo de una justificación específica de una compañía.
 * @param {number} justificationId - ID de la justificación.
 * @param {number} adminCompanyId - ID de la compañía del admin.
 * @returns {Promise<Justification>}
 */
const toggleJustificationStatusService = async (
  justificationId,
  adminCompanyId
) => {
  const justification = await findEditableJustification(
    justificationId,
    adminCompanyId
  );

  justification.estaActiva = !justification.estaActiva;
  await justification.save();
  return justification;
};

module.exports = {
  getJustificationsService,
  createJustificationService,
  updateJustificationService,
  toggleJustificationStatusService,
};

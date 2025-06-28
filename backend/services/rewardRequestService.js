const { RewardRequest, User, Company } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const { PREDEFINED_REWARD_SUGGESTIONS } = require('../utils/constants');

/**
 * Crea una nueva solicitud de recompensa para un empleado.
 * @param {string} userId - ID del empleado.
 * @param {number} companyId - ID de la compañía del empleado.
 * @param {object} requestData - Datos de la solicitud { requestedItem, additionalNotes }.
 * @returns {Promise<RewardRequest>}
 */
const createRewardRequestService = async (userId, companyId, requestData) => {
  const { requestedItem, additionalNotes } = requestData;

  if (!companyId) {
    throw new AppError(
      'El usuario debe pertenecer a una compañía para crear una solicitud.',
      403
    );
  }
  if (
    !requestedItem ||
    !PREDEFINED_REWARD_SUGGESTIONS.includes(requestedItem)
  ) {
    throw new AppError(
      'Debe seleccionar una sugerencia válida de la lista.',
      400
    );
  }

  const newRequest = await RewardRequest.create({
    userId,
    companyId,
    requestedItem,
    additionalNotes: additionalNotes || null,
    status: 'new',
  });
  return newRequest;
};

/**
 * Obtiene una lista de solicitudes de recompensa según el rol del usuario y los filtros.
 * @param {object} dbUser - El objeto del usuario autenticado (role, companyId).
 * @param {object} queryParams - Los filtros de la URL (companyId, status).
 * @returns {Promise<RewardRequest[]>}
 */
const getRewardRequestsService = async (dbUser, queryParams) => {
  const { role, companyId: userCompanyId } = dbUser;
  const { companyId: queryCompanyId, status: queryStatus } = queryParams;

  const whereClause = {};

  // Lógica de filtrado por compañía basada en rol
  if (role === 'Admin') {
    if (!userCompanyId) {
      throw new AppError('El Admin no está asignado a ninguna compañía.', 403);
    }
    whereClause.companyId = userCompanyId;
  } else if (role === 'Manager' && queryCompanyId) {
    whereClause.companyId = parseInt(queryCompanyId, 10);
  }

  // Lógica de filtrado por estado
  if (
    queryStatus &&
    ['new', 'reviewed', 'planned', 'implemented', 'rejected'].includes(
      queryStatus
    )
  ) {
    whereClause.status = queryStatus;
  }

  return RewardRequest.findAll({
    where: whereClause,
    include: [
      { model: User, as: 'user', attributes: ['id', 'nombre', 'email'] },
      { model: Company, as: 'company', attributes: ['id', 'nombre'] },
    ],
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Actualiza el estado de una solicitud de recompensa.
 * @param {number} requestId - ID de la solicitud.
 * @param {string} newStatus - El nuevo estado para la solicitud.
 * @param {object} dbUser - El objeto del usuario autenticado (role, companyId).
 * @returns {Promise<RewardRequest>}
 */
const updateRewardRequestStatusService = async (
  requestId,
  newStatus,
  dbUser
) => {
  const { role, companyId: userCompanyId } = dbUser;

  const request = await RewardRequest.findByPk(requestId);
  if (!request) {
    throw new AppError('Solicitud no encontrada.', 404);
  }

  // Lógica de autorización
  if (role === 'Admin' && request.companyId !== userCompanyId) {
    throw new AppError(
      'Acceso prohibido. No puede modificar solicitudes de otra compañía.',
      403
    );
  }

  request.status = newStatus;
  await request.save();

  // Devolvemos la instancia actualizada con sus asociaciones
  return request.reload({
    include: [
      { model: User, as: 'user', attributes: ['id', 'nombre', 'email'] },
      { model: Company, as: 'company', attributes: ['id', 'nombre'] },
    ],
  });
};

module.exports = {
  createRewardRequestService,
  getRewardRequestsService,
  updateRewardRequestStatusService,
};

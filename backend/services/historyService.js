const {
  PointAssignment,
  User,
  Redemption,
  Reward,
  Company,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');

/**
 * Obtiene el historial de asignación de puntos para una compañía.
 * @param {number} companyId - ID de la compañía.
 * @returns {Promise<PointAssignment[]>}
 */
const getPointAssignmentHistoryService = async (companyId) => {
  if (!companyId) {
    throw new AppError('El administrador debe pertenecer a una compañía.', 403);
  }
  return PointAssignment.findAll({
    where: { companyId },
    include: [
      { model: User, as: 'admin', attributes: ['id', 'nombre', 'email'] },
      { model: User, as: 'employee', attributes: ['id', 'nombre', 'email'] },
    ],
    order: [['fechaAsignacion', 'DESC']],
  });
};

/**
 * Obtiene el historial de canjes de recompensas globales (para Managers).
 * @returns {Promise<Redemption[]>}
 */
const getManagerGlobalRedemptionHistoryService = async () => {
  return Redemption.findAll({
    include: [
      {
        model: Reward,
        as: 'reward',
        attributes: ['id', 'nombre'],
        where: { companyId: null }, // Filtra solo canjes de recompensas globales
        required: true, // Asegura que solo se devuelvan canjes de recompensas que cumplen el where
      },
      {
        model: User,
        as: 'employee',
        attributes: ['id', 'nombre', 'email', 'companyId'],
        include: [
          { model: Company, as: 'company', attributes: ['id', 'nombre'] },
        ],
      },
    ],
    order: [['fechaCanje', 'DESC']],
  });
};

/**
 * Obtiene el historial de puntos de un empleado específico.
 * @param {string} employeeId - UID del empleado.
 * @returns {Promise<PointAssignment[]>}
 */
const getMyPointHistoryService = async (employeeId) => {
  return PointAssignment.findAll({
    where: { empleadoId: employeeId },
    include: [{ model: User, as: 'admin', attributes: ['nombre', 'email'] }],
    order: [['fechaAsignacion', 'DESC']],
  });
};

/**
 * Obtiene el historial de canjes de un empleado específico.
 * @param {string} employeeId - UID del empleado.
 * @returns {Promise<Redemption[]>}
 */
const getMyRedemptionHistoryService = async (employeeId) => {
  return Redemption.findAll({
    where: { empleadoId: employeeId },
    include: [{ model: Reward, as: 'reward', attributes: ['nombre'] }],
    order: [['fechaCanje', 'DESC']],
  });
};

/**
 * Obtiene el ranking de empleados para una compañía.
 * @param {number} companyId - ID de la compañía.
 * @returns {Promise<User[]>}
 */
const getRankingService = async (companyId) => {
  if (!companyId) {
    throw new AppError(
      'El usuario debe pertenecer a una compañía para ver el ranking.',
      403
    );
  }
  return User.findAll({
    where: {
      companyId: companyId,
      role: 'Employee',
      isActive: true,
    },
    attributes: ['id', 'nombre', 'email', 'points'],
    order: [
      ['points', 'DESC'],
      ['nombre', 'ASC'],
    ],
  });
};

/**
 * Obtiene el historial de canjes de una compañía (para Admins).
 * @param {number} companyId - ID de la compañía.
 * @returns {Promise<Redemption[]>}
 */
const getRedemptionHistoryAdminService = async (companyId) => {
  if (!companyId) {
    throw new AppError('El administrador debe pertenecer a una compañía.', 403);
  }
  return Redemption.findAll({
    where: { companyId },
    include: [
      { model: User, as: 'employee', attributes: ['id', 'nombre', 'email'] },
      { model: Reward, as: 'reward', attributes: ['id', 'nombre'] },
    ],
    order: [['fechaCanje', 'DESC']],
  });
};

module.exports = {
  getPointAssignmentHistoryService,
  getManagerGlobalRedemptionHistoryService,
  getMyPointHistoryService,
  getMyRedemptionHistoryService,
  getRankingService,
  getRedemptionHistoryAdminService,
};

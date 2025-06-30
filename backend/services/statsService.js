const {
  User,
  Reward,
  Company,
  RewardRequest,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');

/**
 * Obtiene las estadísticas del dashboard para un Admin.
 * @param {number} companyId - El ID de la compañía del admin.
 * @returns {Promise<{employeeCount: number, rewardCount: number}>}
 */
const getAdminDashboardStatsService = async (companyId) => {
  if (!companyId) {
    throw new AppError('El administrador debe pertenecer a una compañía.', 403);
  }
  // Ejecutar ambas cuentas en paralelo para mayor eficiencia
  const [employeeCount, rewardCount] = await Promise.all([
    User.count({ where: { companyId, role: 'Employee', isActive: true } }),
    Reward.count({ where: { companyId, isActive: true } }),
  ]);
  return { employeeCount, rewardCount };
};

/**
 * Obtiene las estadísticas del dashboard para un Manager.
 * @returns {Promise<{companyStats: object, adminCount: number}>}
 */
const getManagerDashboardStatsService = async () => {
  const [companyCounts, adminCount] = await Promise.all([
    Company.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    }),
    User.count({ where: { role: 'Admin', isActive: true } }),
  ]);

  const companyStats = companyCounts.reduce(
    (acc, item) => {
      acc[item.status] = parseInt(item.count, 10);
      return acc;
    },
    { active: 0, inactive: 0, pending_payment: 0 }
  );
  companyStats.total =
    companyStats.active + companyStats.inactive + companyStats.pending_payment;

  return { companyStats, adminCount };
};

/**
 * Obtiene el interés más común de los empleados (global o por compañía).
 * @param {object} dbUser - El objeto del usuario autenticado.
 * @param {object} queryParams - Los parámetros de la URL.
 * @returns {Promise<{mostCommonInterest: string|null, count: number}>}
 */
const getCommonInterestService = async (dbUser, queryParams) => {
  const { role, companyId: userCompanyId } = dbUser;
  const requestedCompanyId = queryParams.companyId
    ? parseInt(queryParams.companyId, 10)
    : null;

  const whereClause = {
    role: 'Employee',
    isActive: true,
    interests: { [Op.ne]: null, [Op.ne]: [] },
  };

  if (role === 'Admin') {
    if (!userCompanyId)
      throw new AppError('Admin no asignado a una compañía.', 403);
    whereClause.companyId = userCompanyId;
  } else if (role === 'Manager' && requestedCompanyId) {
    whereClause.companyId = requestedCompanyId;
  }
  // Si es Manager y no hay requestedCompanyId, no se filtra por compañía (global).

  const usersInterests = await User.findAll({
    where: whereClause,
    attributes: ['interests'],
    raw: true,
  });

  if (!usersInterests.length) {
    return { mostCommonInterest: null, count: 0 };
  }

  const interestCounts = usersInterests
    .flatMap((user) => user.interests)
    .reduce((acc, interest) => {
      acc[interest] = (acc[interest] || 0) + 1;
      return acc;
    }, {});

  let mostCommonInterest = null;
  let maxCount = 0;
  for (const interest in interestCounts) {
    if (interestCounts[interest] > maxCount) {
      maxCount = interestCounts[interest];
      mostCommonInterest = interest;
    }
  }
  return { mostCommonInterest, count: maxCount };
};

/**
 * Obtiene las solicitudes de recompensa más frecuentes (global o por compañía).
 * @param {object} dbUser - El objeto del usuario autenticado.
 * @param {object} queryParams - Los parámetros de la URL.
 * @returns {Promise<object[]>}
 */
const getTopRewardRequestsService = async (dbUser, queryParams) => {
  const { role, companyId: userCompanyId } = dbUser;
  const requestedCompanyId = queryParams.companyId
    ? parseInt(queryParams.companyId, 10)
    : null;
  const limit = parseInt(queryParams.limit, 10) || 3;

  const whereClause = { status: 'new' };

  if (role === 'Admin') {
    if (!userCompanyId)
      throw new AppError('Admin no asignado a una compañía.', 403);
    whereClause.companyId = userCompanyId;
  } else if (role === 'Manager' && requestedCompanyId) {
    whereClause.companyId = requestedCompanyId;
  }

  return RewardRequest.findAll({
    where: whereClause,
    attributes: [
      'requestedItem',
      [sequelize.fn('COUNT', sequelize.col('requestedItem')), 'count'],
    ],
    group: ['requestedItem'],
    order: [[sequelize.fn('COUNT', sequelize.col('requestedItem')), 'DESC']],
    limit: limit,
    raw: true,
  });
};

module.exports = {
  getAdminDashboardStatsService,
  getManagerDashboardStatsService,
  getCommonInterestService,
  getTopRewardRequestsService,
};

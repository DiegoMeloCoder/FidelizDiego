const { Anomaly, Company, User } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');

/**
 * Obtiene una lista paginada y filtrada de anomalías.
 * @param {object} queryParams - Parámetros de consulta (status, companyId, etc.).
 * @returns {Promise<{count: number, rows: Anomaly[]}>}
 */
const getAnomaliesService = async (queryParams) => {
  const {
    status,
    companyId,
    startDate,
    endDate,
    limit = 25,
    offset = 0,
  } = queryParams;

  const whereClause = {};
  if (status && ['New', 'Reviewed', 'Dismissed'].includes(status)) {
    whereClause.status = status;
  }
  if (companyId) {
    whereClause.companyId = companyId;
  }
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    whereClause.timestamp = { [Op.gte]: start, [Op.lt]: end };
  } else if (startDate) {
    whereClause.timestamp = { [Op.gte]: new Date(startDate) };
  } else if (endDate) {
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    whereClause.timestamp = { [Op.lt]: end };
  }

  const result = await Anomaly.findAndCountAll({
    where: whereClause,
    include: [
      { model: Company, as: 'company', attributes: ['id', 'nombre'] },
      { model: User, as: 'employee', attributes: ['id', 'nombre', 'email'] },
      { model: User, as: 'admin', attributes: ['id', 'nombre', 'email'] },
    ],
    order: [['timestamp', 'DESC']],
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  });

  return result;
};

/**
 * Actualiza el estado de una anomalía.
 * @param {number} anomalyId - ID de la anomalía.
 * @param {string} status - Nuevo estado ('Reviewed' o 'Dismissed').
 * @returns {Promise<Anomaly>}
 */
const updateAnomalyStatusService = async (anomalyId, status) => {
  const anomaly = await Anomaly.findByPk(anomalyId);
  if (!anomaly) {
    throw new AppError('Anomalía no encontrada.', 404);
  }

  anomaly.status = status;
  await anomaly.save();
  return anomaly;
};

module.exports = {
  getAnomaliesService,
  updateAnomalyStatusService,
};

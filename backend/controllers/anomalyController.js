const anomalyService = require('../services/anomalyService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getAnomalies = catchAsync(async (req, res, next) => {
  // El servicio se encarga de construir la consulta a partir de req.query
  const { count, rows } = await anomalyService.getAnomaliesService(req.query);
  const { limit = 25, offset = 0 } = req.query;

  res.status(200).json({
    status: 'success',
    data: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Math.floor(offset / limit) + 1,
      anomalies: rows,
    },
  });
});

const updateAnomalyStatus = catchAsync(async (req, res, next) => {
  const { anomalyId } = req.params;
  const { status } = req.body;

  if (!status || !['Reviewed', 'Dismissed'].includes(status)) {
    return next(
      new AppError('Se requiere un estado válido (Reviewed o Dismissed).', 400)
    );
  }

  const updatedAnomaly = await anomalyService.updateAnomalyStatusService(
    anomalyId,
    status
  );

  res.status(200).json({
    status: 'success',
    data: {
      anomaly: updatedAnomaly,
    },
  });
});

module.exports = {
  getAnomalies,
  updateAnomalyStatus,
};

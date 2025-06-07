const redemptionService = require('../services/redemptionService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError'); // Para validaciones de entrada

/**
 * Canjea una recompensa. Solo para rol 'Employee'.
 */
const redeemReward = catchAsync(async (req, res, next) => {
  const employeeUserId = req.dbUser.id; // Obtenido del middleware 'authorize'
  const employeeCompanyId = req.dbUser.companyId; // Obtenido del middleware 'authorize'
  const { rewardId } = req.params;

  // Validación básica de entrada (idealmente en un middleware de validación)
  if (!rewardId) {
    return next(new AppError('El ID de la recompensa es requerido.', 400));
  }
  const parsedRewardId = parseInt(rewardId, 10);
  if (isNaN(parsedRewardId)) {
    return next(
      new AppError('El ID de la recompensa debe ser un número válido.', 400)
    );
  }

  // Llamada al servicio que contiene toda la lógica de negocio y transacciones
  const result = await redemptionService.redeemRewardService(
    employeeUserId,
    employeeCompanyId,
    parsedRewardId
  );

  // Respuesta JSend estandarizada
  res.status(201).json({
    status: 'success',
    data: {
      redemption: result.redemption,
      employeeNewBalance: result.employeeNewBalance,
    },
  });
});

// TODO: Implementar endpoint para obtener historial de canjes del empleado
// const getMyRedemptionHistory = catchAsync(async (req, res, next) => {
//   // const history = await redemptionService.getRedemptionHistoryForEmployee(req.dbUser.id);
//   // res.status(200).json({ status: 'success', data: { history } });
// });

module.exports = {
  redeemReward,
  // getMyRedemptionHistory,
};

const rewardRequestService = require('../services/rewardRequestService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const createRewardRequest = catchAsync(async (req, res, next) => {
  // El servicio se encargará de la validación de negocio.
  const newRequest = await rewardRequestService.createRewardRequestService(
    req.dbUser.id,
    req.dbUser.companyId,
    req.body
  );
  res.status(201).json({
    status: 'success',
    data: { request: newRequest },
  });
});

const getRewardRequests = catchAsync(async (req, res, next) => {
  const requests = await rewardRequestService.getRewardRequestsService(
    req.dbUser,
    req.query
  );
  res.status(200).json({
    status: 'success',
    results: requests.length,
    data: { requests },
  });
});

const updateRewardRequestStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validación de entrada básica
  if (
    !status ||
    !['new', 'reviewed', 'planned', 'implemented', 'rejected'].includes(status)
  ) {
    return next(new AppError('Se proporcionó un estado inválido.', 400));
  }

  const updatedRequest =
    await rewardRequestService.updateRewardRequestStatusService(
      id,
      status,
      req.dbUser
    );
  res.status(200).json({
    status: 'success',
    data: { request: updatedRequest },
  });
});

module.exports = {
  createRewardRequest,
  getRewardRequests,
  updateRewardRequestStatus,
};

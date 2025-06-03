const rewardService = require('../services/rewardService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const createReward = catchAsync(async (req, res, next) => {
  const { nombre, pointsRequired, stock } = req.body; // tags e imageUrl también

  // Validación básica de presencia (idealmente en middleware de validación)
  if (!nombre || pointsRequired === undefined) {
    return next(
      new AppError('Nombre y puntos requeridos son obligatorios.', 400)
    );
  }
  const points = parseInt(pointsRequired);
  if (isNaN(points) || points <= 0) {
    return next(
      new AppError('Los puntos requeridos deben ser un número positivo.', 400)
    );
  }
  if (stock !== undefined && stock !== null && stock !== '') {
    const stockValue = parseInt(stock);
    if (isNaN(stockValue) || stockValue < 0) {
      return next(
        new AppError(
          'El stock debe ser un número entero no negativo (o dejar vacío para infinito).',
          400
        )
      );
    }
  }
  // El servicio manejará la lógica de companyId basada en req.dbUser
  const newReward = await rewardService.createRewardService(
    req.body,
    req.dbUser
  );
  res.status(201).json({
    status: 'success',
    data: { reward: newReward },
  });
});

const getRewardsByCompany = catchAsync(async (req, res, next) => {
  // req.dbUser es adjuntado por el middleware 'authorize'
  const rewards = await rewardService.getRewardsByCompanyService(req.dbUser);
  res.status(200).json({
    status: 'success',
    results: rewards.length,
    data: { rewards },
  });
});

const getRewardById = catchAsync(async (req, res, next) => {
  const { rewardId } = req.params;
  // req.dbUser es adjuntado por el middleware 'authorize'
  const reward = await rewardService.getRewardByIdService(rewardId, req.dbUser);
  res.status(200).json({
    status: 'success',
    data: { reward },
  });
});

const updateReward = catchAsync(async (req, res, next) => {
  const { rewardId } = req.params;
  const { nombre, pointsRequired, isActive, stock, imageUrl, tags } = req.body;

  if (
    nombre === undefined &&
    pointsRequired === undefined &&
    isActive === undefined &&
    stock === undefined &&
    imageUrl === undefined &&
    tags === undefined
  ) {
    return next(
      new AppError('Se requiere al menos un campo para actualizar.', 400)
    );
  }
  if (pointsRequired !== undefined) {
    const pointsValue = parseInt(pointsRequired);
    if (isNaN(pointsValue) || pointsValue <= 0) {
      return next(
        new AppError('Los puntos requeridos deben ser un número positivo.', 400)
      );
    }
  }
  if (stock !== undefined && stock !== null && stock !== '') {
    const stockValue = parseInt(stock);
    if (isNaN(stockValue) || stockValue < 0) {
      return next(
        new AppError(
          'El stock debe ser un número entero no negativo (o dejar vacío/null para infinito).',
          400
        )
      );
    }
  }

  const updatedReward = await rewardService.updateRewardService(
    rewardId,
    req.body,
    req.dbUser
  );
  res.status(200).json({
    status: 'success',
    data: { reward: updatedReward },
  });
});

const toggleRewardStatus = catchAsync(async (req, res, next) => {
  const { rewardId } = req.params;
  const updatedReward = await rewardService.toggleRewardStatusService(
    rewardId,
    req.dbUser
  );
  res.status(200).json({
    status: 'success',
    message: `Estado de la recompensa cambiado a ${updatedReward.isActive ? 'activo' : 'inactivo'}`,
    data: { reward: updatedReward },
  });
});

const voteReward = catchAsync(async (req, res, next) => {
  const { rewardId } = req.params;
  const userId = req.dbUser.id;
  const { voteType } = req.body;

  if (!['like', 'dislike'].includes(voteType)) {
    return next(
      new AppError('Tipo de voto inválido. Debe ser "like" o "dislike".', 400)
    );
  }

  const updatedReward = await rewardService.castVoteService(
    userId,
    rewardId,
    voteType
  );
  res.status(200).json({
    status: 'success',
    message: 'Voto procesado.', // El servicio podría devolver un mensaje más específico si se desea
    data: { reward: updatedReward },
  });
});

module.exports = {
  createReward,
  getRewardsByCompany,
  getRewardById,
  updateReward,
  toggleRewardStatus,
  voteReward,
};

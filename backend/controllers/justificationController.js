const justificationService = require('../services/justificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getJustifications = catchAsync(async (req, res, next) => {
  const justifications = await justificationService.getJustificationsService(
    req.dbUser.companyId
  );
  res.status(200).json({
    status: 'success',
    results: justifications.length,
    data: {
      justifications,
    },
  });
});

const createCompanyJustification = catchAsync(async (req, res, next) => {
  const { textoJustificacion } = req.body;

  if (!textoJustificacion) {
    return next(
      new AppError('El texto de la justificación es un campo requerido.', 400)
    );
  }

  const newJustification =
    await justificationService.createJustificationService(
      textoJustificacion,
      req.dbUser.companyId
    );
  res.status(201).json({
    status: 'success',
    data: {
      justification: newJustification,
    },
  });
});

const updateCompanyJustification = catchAsync(async (req, res, next) => {
  const { justificationId } = req.params;
  const { textoJustificacion, estaActiva } = req.body;

  if (textoJustificacion === undefined && estaActiva === undefined) {
    return next(
      new AppError(
        'Se requiere al menos un campo (textoJustificacion o estaActiva) para actualizar.',
        400
      )
    );
  }

  const updatedJustification =
    await justificationService.updateJustificationService(
      justificationId,
      req.dbUser.companyId,
      req.body
    );
  res.status(200).json({
    status: 'success',
    data: {
      justification: updatedJustification,
    },
  });
});

const toggleCompanyJustificationStatus = catchAsync(async (req, res, next) => {
  const { justificationId } = req.params;
  const updatedJustification =
    await justificationService.toggleJustificationStatusService(
      justificationId,
      req.dbUser.companyId
    );

  res.status(200).json({
    status: 'success',
    message: `Estado de la justificación cambiado a ${updatedJustification.estaActiva ? 'activo' : 'inactivo'}`,
    data: {
      justification: updatedJustification,
    },
  });
});

module.exports = {
  getJustifications,
  createCompanyJustification,
  updateCompanyJustification,
  toggleCompanyJustificationStatus,
};

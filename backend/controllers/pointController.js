const pointService = require('../services/pointService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const assignPoints = catchAsync(async (req, res, next) => {
  const { empleadoId, cantidad, justificacionId } = req.body;

  // Validación básica de entrada (la validación de negocio está en el servicio)
  if (
    empleadoId === undefined ||
    cantidad === undefined ||
    justificacionId === undefined
  ) {
    return next(
      new AppError(
        'Se requiere ID de empleado, cantidad y ID de justificación.',
        400
      )
    );
  }
  if (isNaN(parseInt(cantidad, 10)) || parseInt(cantidad, 10) === 0) {
    return next(
      new AppError(
        'La cantidad debe ser un número entero distinto de cero.',
        400
      )
    );
  }
  if (isNaN(parseInt(justificacionId, 10))) {
    return next(
      new AppError('El ID de justificación debe ser un número.', 400)
    );
  }

  const result = await pointService.assignPointsService(
    req.dbUser.id,
    req.dbUser.companyId,
    req.body
  );

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

const getPointsSuggestionByJustification = catchAsync(
  async (req, res, next) => {
    const { justificationId } = req.params;
    const adminCompanyId = req.dbUser.companyId;

    if (!adminCompanyId) {
      return next(
        new AppError('El administrador no tiene una compañía asignada.', 403)
      );
    }
    if (!justificationId || isNaN(parseInt(justificationId, 10))) {
      return next(
        new AppError('Se requiere un ID de justificación numérico válido.', 400)
      );
    }

    const result = await pointService.getSuggestionService(
      adminCompanyId,
      parseInt(justificationId, 10)
    );

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

const generateRecognitionMessage = catchAsync(async (req, res, next) => {
  const { employeeName, justificationText, points } = req.body;

  if (!employeeName || !justificationText || points === undefined) {
    return next(
      new AppError(
        'Se requiere nombre del empleado, texto de justificación y puntos.',
        400
      )
    );
  }
  if (isNaN(parseInt(points, 10)) || parseInt(points, 10) === 0) {
    return next(
      new AppError('Los puntos deben ser un número distinto de cero.', 400)
    );
  }

  const suggestions = await pointService.generateRecognitionMessageService(
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      suggestions,
    },
  });
});

module.exports = {
  assignPoints,
  getPointsSuggestionByJustification,
  generateRecognitionMessage,
};

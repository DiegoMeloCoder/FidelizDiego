const AppError = require('../utils/AppError');

// Envía errores detallados en el entorno de desarrollo.
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Envía errores genéricos y seguros en el entorno de producción.
const sendErrorProd = (err, res) => {
  // A) Error operacional, confiable: enviar mensaje al cliente.
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // B) Error de programación o desconocido: no filtrar detalles.
  // 1. Registrar el error para los desarrolladores.
  console.error('ERROR:', err);

  // 2. Enviar una respuesta genérica.
  return res.status(500).json({
    status: 'error',
    message: 'Algo salió muy mal. Por favor, intente de nuevo más tarde.',
  });
};

// Middleware de manejo de errores global.
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message, name: err.name }; // Copiar el nombre del error también

    // Convertir errores específicos de Sequelize en errores operacionales
    if (error.name === 'SequelizeValidationError') {
      const errors = Object.values(err.errors).map((el) => el.message);
      const message = `Datos de entrada inválidos. ${errors.join('. ')}`;
      error = new AppError(message, 400);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      error = new AppError(
        'El valor proporcionado ya existe y debe ser único.',
        409
      ); // 409 Conflict
    }

    sendErrorProd(error, res);
  }
};

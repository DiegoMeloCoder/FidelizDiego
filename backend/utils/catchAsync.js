/**
 * Envuelve una función de controlador asíncrona para capturar cualquier error
 * y pasarlo al manejador de errores global de Express a través de next().
 * @param {Function} fn - La función de controlador asíncrona a envolver.
 * @returns {Function} Una nueva función que puede ser usada como middleware de Express.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // .catch(err => next(err))
  };
};

module.exports = catchAsync;

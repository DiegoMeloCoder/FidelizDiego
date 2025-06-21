const userService = require('../services/userService'); // Importamos nuestro nuevo servicio
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Obtiene el perfil del usuario actualmente autenticado.
 */
const getMyProfile = catchAsync(async (req, res, next) => {
  // El controlador solo orquesta: pide al servicio el perfil del usuario logueado.
  const userProfile = await userService.getUserProfileService(req.dbUser.id);

  // El servicio ya se encarga de lanzar un error 404 si no lo encuentra.

  res.status(200).json({
    status: 'success',
    data: {
      user: userProfile,
    },
  });
});

/**
 * Actualiza el perfil del usuario actualmente autenticado.
 */
const updateMyProfile = catchAsync(async (req, res, next) => {
  // Validación de entrada básica (presencia de datos)
  if (Object.keys(req.body).length === 0) {
    return next(
      new AppError('No se proporcionaron datos para actualizar.', 400)
    );
  }

  // El controlador delega la lógica de validación y actualización al servicio.
  const updatedUserProfile = await userService.updateMyProfileService(
    req.dbUser.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUserProfile,
    },
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
};

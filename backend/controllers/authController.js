const { User, Company } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { PREDEFINED_INTERESTS } = require('../utils/constants');

// --- LÓGICA REUTILIZABLE DE CONSULTA ---
// Esta función centraliza la forma en que obtenemos un perfil de usuario completo.
// A futuro, podría vivir en un archivo de servicio como `services/userService.js`.
const findUserForProfile = (userId) => {
  return User.findByPk(userId, {
    attributes: [
      'id',
      'email',
      'nombre',
      'role',
      'points',
      'isActive',
      'createdAt',
      'phoneNumber',
      'interests',
    ],
    include: [
      {
        model: Company,
        as: 'company',
        attributes: [
          'id',
          'nombre',
          'status',
          'logoUrl',
          'motto',
          'primaryColor',
          'secondaryColor',
          'tertiaryColor',
        ],
      },
    ],
  });
};

// --- CONTROLADORES REFACTORIZADOS ---

/**
 * Obtiene el perfil completo del usuario actualmente autenticado.
 */
const getMyProfile = catchAsync(async (req, res, next) => {
  // La comprobación de 'req.dbUser' ya no es necesaria aquí.
  // El middleware 'authorize' que se ejecuta antes ya lo ha validado.

  const userProfile = await findUserForProfile(req.dbUser.id);

  // Esta comprobación es una última barrera de seguridad, aunque es poco probable que falle
  // si el middleware 'authorize' funcionó correctamente.
  if (!userProfile) {
    return next(
      new AppError(
        'No se pudo encontrar el perfil del usuario asociado a su token.',
        404
      )
    );
  }

  // Enviamos una respuesta estandarizada (formato JSend).
  res.status(200).json({
    status: 'success',
    data: {
      user: userProfile,
    },
  });
});

/**
 * Actualiza el perfil (campos limitados) del usuario actualmente autenticado.
 */
const updateMyProfile = catchAsync(async (req, res, next) => {
  const { phoneNumber, interests } = req.body;
  const userId = req.dbUser.id;

  // --- Sección de Validación ---
  // Nota: Idealmente, esta lógica debería estar en un middleware de validación
  // que se ejecute ANTES del controlador, para mantener este archivo limpio.

  if (Object.keys(req.body).length === 0) {
    return next(
      new AppError(
        'No se proporcionaron datos para actualizar. Por favor, envíe al menos un campo.',
        400
      )
    );
  }

  if (interests) {
    if (!Array.isArray(interests)) {
      return next(
        new AppError('El campo de intereses debe ser un array.', 400)
      );
    }
    if (
      interests.some((interest) => !PREDEFINED_INTERESTS.includes(interest))
    ) {
      return next(
        new AppError(
          'Uno o más de los intereses proporcionados no son válidos.',
          400
        )
      );
    }
  }
  // Aquí se podría añadir validación para el formato de 'phoneNumber'.

  // --- Fin de la Validación ---

  // Buscamos el usuario para actualizarlo.
  const user = await User.findByPk(userId);

  // Actualizar solo los campos permitidos que fueron proporcionados.
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (interests !== undefined) user.interests = interests;

  await user.save(); // Usamos save() para ejecutar hooks de Sequelize si los hubiera.

  // Devolvemos el perfil completo y actualizado usando nuestra función reutilizable.
  const updatedUserProfile = await findUserForProfile(userId);

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

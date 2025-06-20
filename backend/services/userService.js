const { User, Company } = require('../models');
const AppError = require('../utils/AppError');
const { PREDEFINED_INTERESTS } = require('../utils/constants');

/**
 * Obtiene el perfil completo de un usuario por su ID, incluyendo datos de su compañía.
 * @param {string} userId - El ID (Firebase UID) del usuario.
 * @returns {Promise<User>} La instancia del usuario con su perfil completo.
 */
const getUserProfileService = async (userId) => {
  const userProfile = await User.findByPk(userId, {
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

  if (!userProfile) {
    throw new AppError(
      'No se pudo encontrar el perfil del usuario asociado a su token.',
      404
    );
  }
  return userProfile;
};

/**
 * Actualiza el perfil de un usuario con los datos proporcionados.
 * @param {string} userId - El ID (Firebase UID) del usuario a actualizar.
 * @param {object} updateData - Los datos a actualizar (phoneNumber, interests).
 * @returns {Promise<User>} El perfil completo y actualizado del usuario.
 */
const updateMyProfileService = async (userId, updateData) => {
  const { phoneNumber, interests } = updateData;

  // Lógica de validación de negocio (formato, valores permitidos, etc.)
  if (interests) {
    if (!Array.isArray(interests)) {
      throw new AppError('El campo de intereses debe ser un array.', 400);
    }
    if (
      interests.some((interest) => !PREDEFINED_INTERESTS.includes(interest))
    ) {
      throw new AppError(
        'Uno o más de los intereses proporcionados no son válidos.',
        400
      );
    }
  }
  // Aquí se podría añadir validación para el formato de 'phoneNumber'.

  // Buscamos la instancia del usuario.
  const user = await User.findByPk(userId);
  if (!user) {
    // Esto es una barrera de seguridad, aunque el middleware 'authorize' ya lo verifica.
    throw new AppError('Usuario no encontrado para actualizar.', 404);
  }

  // Actualizamos solo los campos permitidos que fueron proporcionados.
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (interests !== undefined) user.interests = interests;

  await user.save();

  // Devolvemos el perfil actualizado llamando a nuestra otra función de servicio.
  return getUserProfileService(userId);
};

module.exports = {
  getUserProfileService,
  updateMyProfileService,
};

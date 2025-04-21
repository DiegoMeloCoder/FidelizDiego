const { User, Company } = require('../models'); // Importar modelos necesarios

// Obtener perfil del usuario autenticado
const getMyProfile = async (req, res) => {
  // Asume que authenticate y authorize ya se ejecutaron y adjuntaron req.dbUser
  if (!req.dbUser) {
    return res.status(401).send({ message: 'Usuario no autenticado o no encontrado en DB.' });
  }

  try {
    // Volver a buscar al usuario para incluir asociaciones si es necesario o más detalles
    // O simplemente devolver la información ya adjunta en req.dbUser si es suficiente
    const userProfile = await User.findByPk(req.dbUser.id, {
      // Include new fields: phoneNumber and interests
      attributes: ['id', 'email', 'nombre', 'role', 'points', 'isActive', 'createdAt', 'phoneNumber', 'interests'],
      include: [
        {
          model: Company,
          as: 'company', // Usar el alias definido en la asociación User.belongsTo(Company)
          // Include branding fields from the company
          attributes: [
            'id',
            'nombre',
            'status',
            'logoUrl',
            'motto',
            'primaryColor',
            'secondaryColor',
            'tertiaryColor'
          ],
        },
      ],
    });

    if (!userProfile) {
      // Esto no debería pasar si authorize funcionó, pero por seguridad
      return res.status(404).send({ message: 'Perfil de usuario no encontrado.' });
    }

    res.status(200).json(userProfile);

  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    res.status(500).send({ message: 'Error interno al obtener el perfil.' });
  }
};

// Actualizar perfil del usuario autenticado
const updateMyProfile = async (req, res) => {
  if (!req.dbUser) {
    return res.status(401).send({ message: 'Usuario no autenticado o no encontrado en DB.' });
  }

  const { phoneNumber, interests } = req.body; // Obtener los campos actualizables del body
  const userId = req.dbUser.id;

  // TODO: Añadir validación para phoneNumber e interests (ej. que interests sea un array de strings válidos)
  // Lista predefinida (debería estar en un config o constante)
  const predefinedInterests = ['Deportes', 'Tecnología', 'Viajes', 'Hogar', 'Gastronomía', 'Moda', 'Bienestar', 'Lectura', 'Música', 'Cine/Series', 'Mascotas', 'Videojuegos', 'Arte/Cultura', 'Aire Libre'];
  if (interests && !Array.isArray(interests)) {
     return res.status(400).send({ message: 'Interests debe ser un array.' });
  }
  if (interests && interests.some(interest => !predefinedInterests.includes(interest))) {
     return res.status(400).send({ message: 'Uno o más intereses no son válidos.' });
  }
  // Podría añadirse validación para phoneNumber (formato, longitud)

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({ message: 'Usuario no encontrado.' });
    }

    // Actualizar solo los campos proporcionados
    const fieldsToUpdate = {};
    if (phoneNumber !== undefined) fieldsToUpdate.phoneNumber = phoneNumber; // Permitir string vacío para borrar
    if (interests !== undefined) fieldsToUpdate.interests = interests;

    if (Object.keys(fieldsToUpdate).length === 0) {
       return res.status(400).send({ message: 'No se proporcionaron campos para actualizar.' });
    }

    await user.update(fieldsToUpdate);

    // Devolver el perfil actualizado (opcional, pero bueno para el frontend)
    // Re-usar la lógica de getMyProfile podría ser una opción, o seleccionar campos aquí
    const updatedUserProfile = await User.findByPk(userId, {
       attributes: ['id', 'email', 'nombre', 'role', 'points', 'isActive', 'createdAt', 'phoneNumber', 'interests'],
       include: [{ model: Company, as: 'company', attributes: ['id', 'nombre', 'status', 'logoUrl', 'motto', 'primaryColor', 'secondaryColor', 'tertiaryColor'] }],
    });


    res.status(200).json(updatedUserProfile);

  } catch (error) {
    console.error('Error al actualizar el perfil del usuario:', error);
    // Considerar manejo de errores de validación específicos si se añaden
    res.status(500).send({ message: 'Error interno al actualizar el perfil.' });
  }
};


module.exports = {
  getMyProfile,
  updateMyProfile, // Exportar la nueva función
};

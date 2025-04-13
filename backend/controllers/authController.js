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
      attributes: ['id', 'email', 'nombre', 'role', 'points', 'isActive', 'createdAt'], // Excluir companyId si se incluye la asociación
      include: [
        {
          model: Company,
          as: 'company', // Usar el alias definido en la asociación User.belongsTo(Company)
          attributes: ['id', 'nombre', 'status'], // Solo traer campos necesarios de la compañía
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

module.exports = {
  getMyProfile,
};

const { Justification } = require('../models');
const { Op } = require('sequelize'); // Para usar operadores como 'or'

// Listar justificaciones (solo Admin)
// Devuelve las globales (predeterminadas y activas) Y las específicas de la compañía del Admin (activas e inactivas)
const getJustifications = async (req, res) => {
  const adminCompanyId = req.dbUser.companyId;

  if (!adminCompanyId) {
     return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }

  try {
    const justifications = await Justification.findAll({
      where: {
        [Op.or]: [
          // Justificaciones globales (predeterminadas Y activas)
          { companyId: null, esPredeterminada: true, estaActiva: true },
          // Justificaciones específicas de la compañía del admin (todas, activas e inactivas)
          { companyId: adminCompanyId }
        ]
      },
      order: [
        // Ordenar por compañía (null primero), luego si es predeterminada, luego por texto
        ['companyId', 'ASC NULLS FIRST'],
        ['esPredeterminada', 'DESC'],
        ['textoJustificacion', 'ASC']
      ],
    });
    res.status(200).json(justifications);
  } catch (error) {
    console.error('Error al listar justificaciones:', error);
    res.status(500).send({ message: 'Error interno al listar justificaciones.' });
  }
};

// Crear una nueva justificación específica de la compañía (solo Admin)
const createCompanyJustification = async (req, res) => {
  const adminCompanyId = req.dbUser.companyId;
  const { textoJustificacion } = req.body;

  if (!textoJustificacion) {
    return res.status(400).send({ message: 'El texto de la justificación es requerido.' });
  }
   if (!adminCompanyId) {
     return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }

  try {
    const newJustification = await Justification.create({
      textoJustificacion,
      companyId: adminCompanyId, // Asociar a la compañía del Admin
      estaActiva: true, // Por defecto activa
      esPredeterminada: false, // No puede ser predeterminada si es de compañía
    });
    res.status(201).json(newJustification);
  } catch (error) {
    console.error('Error al crear justificación:', error);
    res.status(500).send({ message: 'Error interno al crear la justificación.' });
  }
};

// Actualizar una justificación específica de la compañía (solo Admin)
// Se usa checkTenant en la ruta
const updateCompanyJustification = async (req, res) => {
  const { justificationId } = req.params;
  const { textoJustificacion, estaActiva } = req.body;
  const adminCompanyId = req.dbUser.companyId; // Necesario para asegurar que no se edite una global

  if (textoJustificacion === undefined && estaActiva === undefined) {
     return res.status(400).send({ message: 'Se requiere al menos un campo (textoJustificacion o estaActiva) para actualizar.' });
  }

  try {
    // checkTenant ya verificó que la justificación pertenece a la compañía del admin
    // Además, nos aseguramos que no sea una predeterminada/global
    const justification = await Justification.findOne({
        where: {
            id: justificationId,
            companyId: adminCompanyId, // Doble check por si acaso
            esPredeterminada: false // No se pueden editar las globales desde aquí
        }
    });

    if (!justification) {
      return res.status(404).send({ message: 'Justificación específica de la compañía no encontrada o no editable.' });
    }

    // Actualizar campos
    if (textoJustificacion !== undefined) justification.textoJustificacion = textoJustificacion;
    if (estaActiva !== undefined) justification.estaActiva = estaActiva;

    await justification.save();
    res.status(200).json(justification);

  } catch (error) {
    console.error(`Error al actualizar justificación ${justificationId}:`, error);
    res.status(500).send({ message: 'Error interno al actualizar la justificación.' });
  }
};

// Desactivar/Activar una justificación específica de la compañía (solo Admin)
// Se usa checkTenant en la ruta
const toggleCompanyJustificationStatus = async (req, res) => {
   const { justificationId } = req.params;
   const adminCompanyId = req.dbUser.companyId;

   try {
    // checkTenant ya verificó pertenencia
    // Asegurarse que no sea predeterminada
     const justification = await Justification.findOne({
        where: {
            id: justificationId,
            companyId: adminCompanyId,
            esPredeterminada: false
        }
    });

    if (!justification) {
      return res.status(404).send({ message: 'Justificación específica de la compañía no encontrada o no editable.' });
    }

    justification.estaActiva = !justification.estaActiva;
    await justification.save();

    res.status(200).json({ message: `Estado de la justificación cambiado a ${justification.estaActiva ? 'activo' : 'inactivo'}`, justification });

   } catch (error) {
    console.error(`Error al cambiar estado de justificación ${justificationId}:`, error);
    res.status(500).send({ message: 'Error interno al cambiar estado de la justificación.' });
  }
};


module.exports = {
  getJustifications,
  createCompanyJustification,
  updateCompanyJustification,
  toggleCompanyJustificationStatus,
};

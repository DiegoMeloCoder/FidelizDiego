'use strict';
// Importar sequelize junto con el modelo
const { RewardRequest, sequelize } = require('../models'); 

// Lista predefinida de sugerencias (debería estar en un archivo config)
const predefinedSuggestions = ['Suscripción Streaming (Música)', 'Suscripción Streaming (Video)', 'Bono Restaurante', 'Bono Ropa/Moda', 'Entradas Cine', 'Experiencia Aventura', 'Artículo Deportivo', 'Artículo Tecnológico', 'Donación Caridad', 'Día Libre Adicional', 'Otro (ver notas)'];

// Crear una nueva solicitud de recompensa (Empleado)
const createRewardRequest = async (req, res) => {
  const userId = req.dbUser.id; // ID del empleado autenticado
  const companyId = req.dbUser.companyId; // ID de la compañía del empleado
  const { requestedItem, additionalNotes } = req.body; // Nuevos campos

  if (!requestedItem || !predefinedSuggestions.includes(requestedItem)) {
    return res.status(400).send({ message: 'Debe seleccionar una sugerencia válida de la lista.' });
  }

  if (!companyId) {
     // Esto no debería ocurrir si el middleware checkTenant está activo para empleados
     console.warn(`Intento de crear solicitud de recompensa por usuario ${userId} sin companyId.`);
     return res.status(400).send({ message: 'El usuario debe pertenecer a una compañía.' });
  }

  try {
    const newRequest = await RewardRequest.create({
      userId,
      companyId,
      requestedItem: requestedItem, // Guardar el item seleccionado
      additionalNotes: additionalNotes || null, // Guardar notas si existen
      status: 'new', // Estado inicial por defecto
    });
    res.status(201).json(newRequest);
  } catch (error) {
    console.error(`Error al crear solicitud de recompensa para usuario ${userId}:`, error);
    res.status(500).send({ message: 'Error interno al crear la solicitud de recompensa.' });
  }
};

// Listar solicitudes de recompensa (Manager/Admin)
const getRewardRequests = async (req, res) => {
  const userRole = req.dbUser.role;
  const userCompanyId = req.dbUser.companyId; // Puede ser null para Manager global
  const { companyId: queryCompanyId, status: queryStatus } = req.query; // Filtros opcionales

  const whereClause = {};

  // Filtrar por compañía
  if (userRole === 'Admin') {
    // Admin solo ve su compañía
    whereClause.companyId = userCompanyId;
    if (!userCompanyId) {
       return res.status(403).send({ message: 'Admin no asignado a una compañía.' });
    }
    // Ignorar queryCompanyId si es Admin
  } else if (userRole === 'Manager') {
    // Manager puede filtrar por compañía específica o ver todas (si no se especifica queryCompanyId)
    if (queryCompanyId && !isNaN(parseInt(queryCompanyId, 10))) {
      whereClause.companyId = parseInt(queryCompanyId, 10);
    }
    // Si no hay queryCompanyId, no se filtra por compañía (ve todas)
  }

  // Filtrar por estado
  if (queryStatus && ['new', 'reviewed', 'planned', 'implemented', 'rejected'].includes(queryStatus)) {
    whereClause.status = queryStatus;
  }

  try {
    const requests = await RewardRequest.findAll({
      where: whereClause,
      include: [ // Incluir info del usuario y compañía
        { model: sequelize.models.User, as: 'user', attributes: ['id', 'nombre', 'email'] },
        { model: sequelize.models.Company, as: 'company', attributes: ['id', 'nombre'] }
      ],
      order: [['createdAt', 'DESC']], // Ordenar por más reciente
    });
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error al listar solicitudes de recompensa:', error);
    res.status(500).send({ message: 'Error interno al listar las solicitudes.' });
  }
};

// Actualizar estado de una solicitud de recompensa (Manager/Admin)
const updateRewardRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userRole = req.dbUser.role;
  const userCompanyId = req.dbUser.companyId;

  if (!status || !['new', 'reviewed', 'planned', 'implemented', 'rejected'].includes(status)) {
    return res.status(400).send({ message: 'Estado inválido proporcionado.' });
  }

  try {
    const request = await RewardRequest.findByPk(id);
    if (!request) {
      return res.status(404).send({ message: 'Solicitud no encontrada.' });
    }

    // Autorización: Admin solo puede modificar solicitudes de su compañía
    if (userRole === 'Admin' && request.companyId !== userCompanyId) {
       return res.status(403).send({ message: 'Acceso prohibido a esta solicitud.' });
    }
    // Manager puede modificar cualquiera (podría restringirse si es necesario)

    request.status = status;
    await request.save();

    // Devolver la solicitud actualizada (opcionalmente incluir user/company)
    const updatedRequest = await RewardRequest.findByPk(id, {
       include: [
         { model: sequelize.models.User, as: 'user', attributes: ['id', 'nombre', 'email'] },
         { model: sequelize.models.Company, as: 'company', attributes: ['id', 'nombre'] }
       ]
    });

    res.status(200).json(updatedRequest);

  } catch (error) {
    console.error(`Error al actualizar estado de solicitud ${id}:`, error);
    res.status(500).send({ message: 'Error interno al actualizar la solicitud.' });
  }
};


module.exports = {
  createRewardRequest,
  getRewardRequests, // Exportar nueva función
  updateRewardRequestStatus, // Exportar nueva función
};

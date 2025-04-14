// Import Company model as well
const { PointAssignment, User, Redemption, Reward, Company, sequelize } = require('../models');
const { Op } = require('sequelize');

// --- Definiciones de Funciones ---

// Obtener historial de puntos asignados (para Admin de su compañía)
const getPointAssignmentHistory = async (req, res) => {
  const adminCompanyId = req.dbUser.companyId;

  if (!adminCompanyId) {
    return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }

  try {
    const history = await PointAssignment.findAll({
      where: { companyId: adminCompanyId },
      include: [
        {
          model: User,
          as: 'admin', // Admin que asignó
          attributes: ['id', 'nombre', 'email'], // Incluir info del admin
        },
        {
          model: User,
          as: 'employee', // Empleado que recibió
          attributes: ['id', 'nombre', 'email'], // Incluir info del empleado
        },
        // No necesitamos incluir Justification aquí si ya guardamos el texto
      ],
      order: [['fechaAsignacion', 'DESC']], // Ordenar por fecha descendente
      // Considerar paginación para historiales largos
      // limit: 50,
      // offset: req.query.page ? (parseInt(req.query.page) - 1) * 50 : 0,
    });

    res.status(200).json(history);

  } catch (error) {
    console.error('Error al obtener historial de puntos asignados:', error);
    res.status(500).send({ message: 'Error interno al obtener el historial.' });
  }
};

// Obtener historial de canjes GLOBALES (para Manager)
const getManagerGlobalRedemptionHistory = async (req, res) => {
  // No necesitamos companyId aquí, buscamos canjes de recompensas globales

  try {
    const history = await Redemption.findAll({
      include: [
        {
          model: Reward,
          as: 'reward',
          attributes: ['id', 'nombre', 'companyId'], // Incluir companyId para verificar
          where: { companyId: null }, // *** Filtrar solo recompensas globales ***
          required: true, // INNER JOIN para asegurar que solo traemos canjes de recompensas existentes y globales
        },
        {
          model: User,
          as: 'employee', // Empleado que canjeó
          attributes: ['id', 'nombre', 'email', 'companyId'], // Incluir companyId del empleado
          include: [ // Incluir la compañía del empleado
            {
              model: Company,
              as: 'company',
              attributes: ['id', 'nombre'],
            }
          ]
        },
      ],
      order: [['fechaCanje', 'DESC']], // Ordenar por fecha descendente
      // Considerar paginación
    });

    res.status(200).json(history);

  } catch (error) {
    console.error('Error al obtener historial de canjes globales (Manager):', error);
    res.status(500).send({ message: 'Error interno al obtener el historial de canjes globales.' });
  }
};

// Obtener historial de puntos asignados PARA el empleado autenticado
const getMyPointHistory = async (req, res) => {
  const employeeUserId = req.dbUser.id; // UID del empleado autenticado

  try {
    const history = await PointAssignment.findAll({
      where: { empleadoId: employeeUserId },
      include: [
        {
          model: User,
          as: 'admin', // Admin que asignó
          attributes: ['nombre', 'email'], // Incluir info del admin
        },
        // No necesitamos incluir Justification aquí si ya guardamos el texto
      ],
      order: [['fechaAsignacion', 'DESC']],
    });
    res.status(200).json(history);
  } catch (error) {
    console.error(`Error al obtener historial de puntos para empleado ${employeeUserId}:`, error);
    res.status(500).send({ message: 'Error interno al obtener el historial de puntos.' });
  }
};

// Obtener historial de canjes PARA el empleado autenticado
const getMyRedemptionHistory = async (req, res) => {
   const employeeUserId = req.dbUser.id; // UID del empleado autenticado

  try {
    // Asegurarse que Redemption y Reward están importados arriba
    const history = await Redemption.findAll({
      where: { empleadoId: employeeUserId },
      include: [
        {
          model: Reward,
          as: 'reward', // La recompensa canjeada
          attributes: ['nombre'], // Incluir nombre de la recompensa
        },
      ],
      order: [['fechaCanje', 'DESC']],
    });
    res.status(200).json(history);
  } catch (error) {
    console.error(`Error al obtener historial de canjes para empleado ${employeeUserId}:`, error);
    res.status(500).send({ message: 'Error interno al obtener el historial de canjes.' });
  }
};

// Obtener ranking de empleados (para Admin y Employee de la misma compañía)
const getRanking = async (req, res) => {
  const userCompanyId = req.dbUser.companyId;

  if (!userCompanyId) {
    return res.status(403).send({ message: 'Usuario sin compañía asignada.' });
  }

  try {
    const ranking = await User.findAll({
      where: {
        companyId: userCompanyId,
        role: 'Employee', // Solo empleados en el ranking
        isActive: true,   // Solo empleados activos
      },
      attributes: ['id', 'nombre', 'email', 'points'], // Campos necesarios
      order: [['points', 'DESC'], ['nombre', 'ASC']], // Ordenar por puntos (desc), luego nombre (asc)
      // Considerar limitar el ranking (ej. Top 10)
      // limit: 10,
    });

    res.status(200).json(ranking);

  } catch (error) {
    console.error('Error al obtener el ranking:', error);
    res.status(500).send({ message: 'Error interno al obtener el ranking.' });
  }
};

// Obtener historial de canjes de la compañía (para Admin)
const getRedemptionHistoryAdmin = async (req, res) => {
  const adminCompanyId = req.dbUser.companyId;

  if (!adminCompanyId) {
    return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }

  try {
    const history = await Redemption.findAll({
      where: { companyId: adminCompanyId },
      include: [
        {
          model: User,
          as: 'employee', // Empleado que canjeó
          attributes: ['id', 'nombre', 'email'], // Incluir info del empleado
        },
        {
          model: Reward,
          as: 'reward', // La recompensa canjeada
          attributes: ['id', 'nombre'], // Incluir info de la recompensa
        },
      ],
      order: [['fechaCanje', 'DESC']], // Ordenar por fecha descendente
      // Considerar paginación
    });

    res.status(200).json(history);

  } catch (error) {
    console.error('Error al obtener historial de canjes (Admin):', error);
    res.status(500).send({ message: 'Error interno al obtener el historial de canjes.' });
  }
};


// --- Exportar todas las funciones ---
module.exports = {
  getPointAssignmentHistory,
  getMyPointHistory,
  getMyRedemptionHistory,
  getRanking,
  getRedemptionHistoryAdmin,
  getManagerGlobalRedemptionHistory, // Exportar la nueva función para managers
};

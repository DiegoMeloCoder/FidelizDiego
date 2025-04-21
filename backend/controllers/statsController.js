const { User, Reward, Company, sequelize } = require('../models'); // Importar Company y sequelize
const { Op } = require('sequelize');

// Obtener estadísticas para el dashboard del Admin
const getAdminDashboardStats = async (req, res) => {
  const adminCompanyId = req.dbUser.companyId;

  if (!adminCompanyId) {
    // Este caso no debería ocurrir si authorize('Admin') funciona, pero por seguridad
    return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }

  try {
    // Contar empleados activos de la compañía
    const employeeCount = await User.count({
      where: {
        companyId: adminCompanyId,
        role: 'Employee',
        isActive: true,
      },
    });

    // Contar recompensas activas de la compañía
    const rewardCount = await Reward.count({
      where: {
        companyId: adminCompanyId,
        isActive: true,
      },
    });

    res.status(200).json({
      employeeCount,
      rewardCount,
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard Admin:', error);
    res.status(500).send({ message: 'Error interno al obtener las estadísticas.' });
  }
};

// Podríamos añadir aquí las stats del Manager también si se necesita un endpoint dedicado
// const getManagerDashboardStats = async (req, res) => { ... }

module.exports = {
  getAdminDashboardStats,
  // getManagerDashboardStats,
};

// Obtener estadísticas para el dashboard del Manager
const getManagerDashboardStats = async (req, res) => {
  // No necesita companyId, el Manager ve todo
  try {
    // Contar todas las compañías por estado
    const companyCounts = await Company.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true, // Para obtener un resultado más simple
    });

    // Formatear resultados de compañías
    const companyStats = companyCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count, 10); // Asegurar que sea número
        return acc;
    }, { active: 0, inactive: 0, pending_payment: 0 }); // Inicializar todos los estados
    companyStats.total = companyStats.active + companyStats.inactive + companyStats.pending_payment;


    // Contar todos los Admins activos
    const adminCount = await User.count({
      where: {
        role: 'Admin',
        isActive: true,
      },
    });

    res.status(200).json({
      companyStats, // { total: x, active: y, inactive: z, pending_payment: w }
      adminCount,
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard Manager:', error);
    res.status(500).send({ message: 'Error interno al obtener las estadísticas.' });
  }
};

module.exports = {
  getAdminDashboardStats,
  getManagerDashboardStats, // Exportar nueva función
};

// --- Nuevas Estadísticas de Engagement ---
const { RewardRequest } = require('../models'); // Importar RewardRequest

// Obtener el interés más común de los empleados (global o por compañía)
const getCompanyCommonInterest = async (req, res) => {
  // Permitir filtrar por companyId via query param ?companyId=x
  // Si no hay query param, Admin usa su companyId, Manager ve global (companyId=null en where)
  const requestedCompanyId = req.query.companyId ? parseInt(req.query.companyId, 10) : null;
  const userRole = req.dbUser.role;
  const userCompanyId = req.dbUser.companyId; // ID de la compañía del usuario logueado

  let targetCompanyId = null; // Default to global for Manager if no specific ID requested

  if (userRole === 'Admin') {
    targetCompanyId = userCompanyId; // Admin always sees their own company
    if (requestedCompanyId && requestedCompanyId !== targetCompanyId) {
       return res.status(403).send({ message: 'Acceso prohibido a estadísticas de otra compañía.' });
    }
  } else if (userRole === 'Manager') {
    // Manager can see global (null) or a specific company if requestedCompanyId is provided
    targetCompanyId = requestedCompanyId; // Can be null (global) or a specific ID
  }

  // Construir cláusula where para la consulta de usuarios
  const whereUserClause = {
    role: 'Employee',
    isActive: true,
    interests: { [Op.ne]: null, [Op.ne]: [] }
  };

  if (targetCompanyId !== null) {
     // Si targetCompanyId es un número (específico), filtrar por él
     if (!isNaN(targetCompanyId)) {
        whereUserClause.companyId = targetCompanyId;
     } else {
        // Si targetCompanyId es null (solicitud global explícita o default Manager),
        // ¿Mostramos agregado de TODOS o solo de usuarios sin compañía?
        // Decisión: Mostraremos agregado de TODOS los empleados activos con intereses.
        // No añadimos filtro de companyId.
     }
  }
  // Si targetCompanyId es null (implícito o explícito), no filtramos por compañía.

  // Eliminar la validación obsoleta de companyId
  // if (!companyId) { ... } 

  try {
    // Consulta para obtener todos los intereses según el filtro definido
    const usersInterests = await User.findAll({
      where: whereUserClause, // Usar la cláusula where construida
      attributes: ['interests'],
      raw: true, // Obtener solo los datos
    });

    if (!usersInterests || usersInterests.length === 0) {
      return res.status(200).json({ mostCommonInterest: null, count: 0 });
    }

    // Contar la frecuencia de cada interés
    const interestCounts = usersInterests
      .flatMap(user => user.interests) // Aplanar todos los arrays de intereses en uno solo
      .reduce((acc, interest) => {
        acc[interest] = (acc[interest] || 0) + 1;
        return acc;
      }, {});

    // Encontrar el interés con la cuenta más alta
    let mostCommonInterest = null;
    let maxCount = 0;
    for (const interest in interestCounts) {
      if (interestCounts[interest] > maxCount) {
        maxCount = interestCounts[interest];
        mostCommonInterest = interest;
      }
    }

    res.status(200).json({ mostCommonInterest, count: maxCount });

  } catch (error) {
    console.error(`Error al obtener interés común (filtro: ${targetCompanyId}):`, error);
    res.status(500).send({ message: 'Error interno al obtener el interés más común.' });
  }
};

// Obtener las solicitudes de recompensa más frecuentes (global o por compañía)
const getTopRewardRequests = async (req, res) => {
  // Permitir filtrar por companyId via query param ?companyId=x
  const requestedCompanyId = req.query.companyId ? parseInt(req.query.companyId, 10) : null;
  const userRole = req.dbUser.role; // Manager o Admin
  const userCompanyId = req.dbUser.companyId;
  const limit = parseInt(req.query.limit, 10) || 3;

  let targetCompanyId = null; // Default global

   if (userRole === 'Admin') {
     targetCompanyId = userCompanyId;
     if (requestedCompanyId && requestedCompanyId !== targetCompanyId) {
        return res.status(403).send({ message: 'Acceso prohibido a solicitudes de otra compañía.' });
     }
     if (!targetCompanyId) {
         return res.status(400).send({ message: 'Admin debe pertenecer a una compañía.' });
     }
   } else if (userRole === 'Manager') {
     targetCompanyId = requestedCompanyId; // Puede ser null (global) o un ID específico
   }

   // Construir cláusula where
   const whereRequestClause = {
     status: 'new', // Solo contar solicitudes nuevas
   };
   if (targetCompanyId !== null && !isNaN(targetCompanyId)) {
     whereRequestClause.companyId = targetCompanyId;
   }
   // Si targetCompanyId es null, no filtramos por compañía (agregado global)

  try {
    const topRequests = await RewardRequest.findAll({
      where: whereRequestClause, // Usar la cláusula construida
      attributes: [
        'requestedItem', // Agrupar por el nuevo campo
        [sequelize.fn('COUNT', sequelize.col('requestedItem')), 'count'] // Contar por el nuevo campo
      ],
      group: ['requestedItem'], // Agrupar por el nuevo campo
      order: [[sequelize.fn('COUNT', sequelize.col('requestedItem')), 'DESC']], // Ordenar por el nuevo campo
      limit: limit,
      raw: true,
    });

    res.status(200).json(topRequests);

  } catch (error) {
    console.error(`Error al obtener top reward requests (filtro: ${targetCompanyId}):`, error);
    res.status(500).send({ message: 'Error interno al obtener las solicitudes de recompensa más frecuentes.' });
  }
};


module.exports = {
  getAdminDashboardStats,
  getManagerDashboardStats,
  getCompanyCommonInterest, // Exportar nueva función
  getTopRewardRequests,     // Exportar nueva función
};

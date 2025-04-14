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

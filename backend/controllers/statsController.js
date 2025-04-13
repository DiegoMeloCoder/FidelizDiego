const { User, Reward } = require('../models');
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

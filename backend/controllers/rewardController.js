const { Reward } = require('../models');

// Crear una nueva recompensa (solo Admin)
const createReward = async (req, res) => {
  const adminCompanyId = req.dbUser.companyId;
  const { nombre, pointsRequired } = req.body;

  if (!nombre || pointsRequired === undefined) {
    return res.status(400).send({ message: 'Nombre y puntos requeridos son obligatorios.' });
  }
  if (!adminCompanyId) {
     return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }
  if (isNaN(parseInt(pointsRequired)) || parseInt(pointsRequired) <= 0) {
    return res.status(400).send({ message: 'Los puntos requeridos deben ser un número positivo.' });
  }

  try {
    const newReward = await Reward.create({
      nombre,
      pointsRequired: parseInt(pointsRequired),
      companyId: adminCompanyId, // Asociar a la compañía del Admin
      isActive: true, // Por defecto activa
    });
    res.status(201).json(newReward);
  } catch (error) {
    console.error('Error al crear recompensa:', error);
    // Podría haber un unique constraint si se define en el modelo/migración
    res.status(500).send({ message: 'Error interno al crear la recompensa.' });
  }
};

// Listar recompensas de la compañía (para Admin y Employee)
// Los Admins ven todas (activas e inactivas) de su compañía.
// Los Employees ven solo las activas de su compañía.
const getRewardsByCompany = async (req, res) => {
  const userCompanyId = req.dbUser.companyId;
  const userRole = req.dbUser.role;

  if (!userCompanyId) {
     return res.status(403).send({ message: 'Usuario sin compañía asignada.' });
  }

  const whereClause = { companyId: userCompanyId };

  // Los empleados solo ven las recompensas activas
  if (userRole === 'Employee') {
    whereClause.isActive = true;
  }

  try {
    const rewards = await Reward.findAll({
      where: whereClause,
      order: [['pointsRequired', 'ASC'], ['nombre', 'ASC']], // Ordenar por puntos, luego nombre
    });
    res.status(200).json(rewards);
  } catch (error) {
    console.error('Error al listar recompensas:', error);
    res.status(500).send({ message: 'Error interno al listar recompensas.' });
  }
};

// Obtener una recompensa específica por ID (solo Admin)
// Se usa checkTenant en la ruta para verificar pertenencia
const getRewardById = async (req, res) => {
  const { rewardId } = req.params;
  try {
    // checkTenant ya verificó que el admin pertenece a la misma compañía que la recompensa
    const reward = await Reward.findByPk(rewardId);
    // findByPk devuelve null si no lo encuentra, no necesitamos verificar pertenencia de nuevo
    if (!reward) {
      return res.status(404).send({ message: 'Recompensa no encontrada.' });
    }
    res.status(200).json(reward);
  } catch (error) {
    console.error(`Error al obtener recompensa ${rewardId}:`, error);
    res.status(500).send({ message: 'Error interno al obtener la recompensa.' });
  }
};


// Actualizar una recompensa (solo Admin)
// Se usa checkTenant en la ruta
const updateReward = async (req, res) => {
  const { rewardId } = req.params;
  const { nombre, pointsRequired, isActive } = req.body;

  if (nombre === undefined && pointsRequired === undefined && isActive === undefined) {
     return res.status(400).send({ message: 'Se requiere al menos un campo (nombre, pointsRequired o isActive) para actualizar.' });
  }
  if (pointsRequired !== undefined && (isNaN(parseInt(pointsRequired)) || parseInt(pointsRequired) <= 0)) {
    return res.status(400).send({ message: 'Los puntos requeridos deben ser un número positivo.' });
  }

  try {
    // checkTenant ya verificó pertenencia
    const reward = await Reward.findByPk(rewardId);
    if (!reward) {
      return res.status(404).send({ message: 'Recompensa no encontrada.' });
    }

    // Actualizar campos
    if (nombre !== undefined) reward.nombre = nombre;
    if (pointsRequired !== undefined) reward.pointsRequired = parseInt(pointsRequired);
    if (isActive !== undefined) reward.isActive = isActive;

    await reward.save();
    res.status(200).json(reward);

  } catch (error) {
    console.error(`Error al actualizar recompensa ${rewardId}:`, error);
    res.status(500).send({ message: 'Error interno al actualizar la recompensa.' });
  }
};

// Desactivar/Activar una recompensa (eliminación lógica) (solo Admin)
// Se usa checkTenant en la ruta
const toggleRewardStatus = async (req, res) => {
   const { rewardId } = req.params;

   try {
    // checkTenant ya verificó pertenencia
    const reward = await Reward.findByPk(rewardId);
    if (!reward) {
      return res.status(404).send({ message: 'Recompensa no encontrada.' });
    }

    reward.isActive = !reward.isActive;
    await reward.save();

    res.status(200).json({ message: `Estado de la recompensa cambiado a ${reward.isActive ? 'activo' : 'inactivo'}`, reward });

   } catch (error) {
    console.error(`Error al cambiar estado de recompensa ${rewardId}:`, error);
    res.status(500).send({ message: 'Error interno al cambiar estado de la recompensa.' });
  }
};


module.exports = {
  createReward,
  getRewardsByCompany,
  getRewardById,
  updateReward,
  toggleRewardStatus, // Usaremos esto en lugar de DELETE
};

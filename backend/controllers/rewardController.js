const { Reward } = require('../models');
const { Op } = require("sequelize"); // Import Op for OR queries

// Crear una nueva recompensa (Admin o Manager)
const createReward = async (req, res) => {
  const userRole = req.dbUser.role;
  const userCompanyId = req.dbUser.companyId;
  // Incluir stock (opcional) y imageUrl (opcional)
  const { nombre, pointsRequired, stock, imageUrl } = req.body; // Add imageUrl

  if (!nombre || pointsRequired === undefined) {
    return res.status(400).send({ message: 'Nombre y puntos requeridos son obligatorios.' });
  }

  // Admins must belong to a company to create company-specific rewards
  if (userRole === 'Admin' && !userCompanyId) {
     return res.status(403).send({ message: 'El Admin debe pertenecer a una compañía para crear recompensas.' });
  }

  const points = parseInt(pointsRequired);
  if (isNaN(points) || points <= 0) {
    return res.status(400).send({ message: 'Los puntos requeridos deben ser un número positivo.' });
  }
  // Validar stock si se proporciona
  let stockValue = null; // Default a infinito
  if (stock !== undefined && stock !== null && stock !== '') {
      stockValue = parseInt(stock);
      if (isNaN(stockValue) || stockValue < 0) {
          return res.status(400).send({ message: 'El stock debe ser un número entero no negativo (o dejar vacío para infinito).' });
      }
  }

  try {
    // Determine companyId based on role
    const rewardCompanyId = userRole === 'Manager' ? null : userCompanyId;

    const newReward = await Reward.create({
      nombre,
      pointsRequired: points,
      companyId: rewardCompanyId, // Set to null for Manager, companyId for Admin
      isActive: true,
      stock: stockValue, // Guardar valor de stock (puede ser null)
      imageUrl: imageUrl || null, // Save imageUrl if provided, otherwise null
    });
    res.status(201).json(newReward);
  } catch (error) {
    console.error('Error al crear recompensa:', error);
    // Podría haber un unique constraint si se define en el modelo/migración
    res.status(500).send({ message: 'Error interno al crear la recompensa.' });
  }
};

// Listar recompensas (para Admin, Manager y Employee)
// Admins/Managers ven todas (activas e inactivas) de su ámbito (empresa o globales).
// Employees ven solo las activas de su ámbito (empresa + globales).
const getRewardsByCompany = async (req, res) => {
  const userCompanyId = req.dbUser.companyId;
  const userRole = req.dbUser.role;

  // Managers see global rewards, Admins/Employees see their company + global
  let companyIdFilter;
  if (userRole === 'Manager') {
    companyIdFilter = { companyId: null }; // Managers only see global rewards in this context (can be adjusted if needed)
  } else if (userCompanyId) {
    // Admins and Employees see their company's rewards OR global rewards
    companyIdFilter = {
      [Op.or]: [
        { companyId: userCompanyId },
        { companyId: null }
      ]
    };
  } else {
    // Employee or Admin without companyId - should ideally not happen for these roles
    // but if it does, they can only see global rewards
    companyIdFilter = { companyId: null };
  }

  const whereClause = {
    ...companyIdFilter,
    // Employees only see active rewards
    ...(userRole === 'Employee' && { isActive: true })
  };

  try {
    const rewards = await Reward.findAll({
      where: whereClause,
      order: [['companyId', 'ASC NULLS FIRST'], ['pointsRequired', 'ASC'], ['nombre', 'ASC']], // Show global first, then order
    });
    res.status(200).json(rewards);
  } catch (error) {
    console.error('Error al listar recompensas:', error);
    res.status(500).send({ message: 'Error interno al listar recompensas.' });
  }
};

// Obtener una recompensa específica por ID (Admin o Manager, con verificación)
const getRewardById = async (req, res) => {
  const { rewardId } = req.params;
  const userRole = req.dbUser.role;
  const userCompanyId = req.dbUser.companyId;

  try {
    const reward = await Reward.findByPk(rewardId);

    if (!reward) {
      return res.status(404).send({ message: 'Recompensa no encontrada.' });
    }

    // Authorization Check:
    if (userRole === 'Admin' && reward.companyId !== userCompanyId) {
      return res.status(403).send({ message: 'Acceso prohibido. No es una recompensa de su compañía.' });
    }
    if (userRole === 'Manager' && reward.companyId !== null) {
      return res.status(403).send({ message: 'Acceso prohibido. No es una recompensa global.' });
    }
    // If checks pass, user is authorized for this reward
    res.status(200).json(reward);
  } catch (error) {
    console.error(`Error al obtener recompensa ${rewardId}:`, error);
    res.status(500).send({ message: 'Error interno al obtener la recompensa.' });
  }
};


// Actualizar una recompensa (Admin o Manager, con verificación)
const updateReward = async (req, res) => {
  const { rewardId } = req.params;
  const userRole = req.dbUser.role;
  const userCompanyId = req.dbUser.companyId;
  // Incluir stock y imageUrl en los campos a actualizar
  const { nombre, pointsRequired, isActive, stock, imageUrl } = req.body; // Add imageUrl

  // Check if at least one field is provided for update
  if (nombre === undefined && pointsRequired === undefined && isActive === undefined && stock === undefined && imageUrl === undefined) {
     return res.status(400).send({ message: 'Se requiere al menos un campo (nombre, pointsRequired, isActive, stock o imageUrl) para actualizar.' });
  }

  let pointsValue;
  if (pointsRequired !== undefined) {
      pointsValue = parseInt(pointsRequired);
      if (isNaN(pointsValue) || pointsValue <= 0) {
          return res.status(400).send({ message: 'Los puntos requeridos deben ser un número positivo.' });
      }
  }

  let stockValue;
  if (stock !== undefined) {
      if (stock === null || stock === '') {
          stockValue = null; // Establecer a infinito
      } else {
          stockValue = parseInt(stock);
          if (isNaN(stockValue) || stockValue < 0) {
              return res.status(400).send({ message: 'El stock debe ser un número entero no negativo (o dejar vacío/null para infinito).' });
          }
      }
  }

  try {
    const reward = await Reward.findByPk(rewardId);
    if (!reward) {
      return res.status(404).send({ message: 'Recompensa no encontrada.' });
    }

    // Authorization Check:
    if (userRole === 'Admin' && reward.companyId !== userCompanyId) {
      return res.status(403).send({ message: 'Acceso prohibido. No puede modificar recompensas de otra compañía.' });
    }
    if (userRole === 'Manager' && reward.companyId !== null) {
      return res.status(403).send({ message: 'Acceso prohibido. No puede modificar recompensas específicas de una compañía.' });
    }

    // If checks pass, proceed with update
    // Actualizar campos
    if (nombre !== undefined) reward.nombre = nombre;
    if (pointsValue !== undefined) reward.pointsRequired = pointsValue;
    if (isActive !== undefined) reward.isActive = isActive;
    if (stock !== undefined) reward.stock = stockValue; // Actualizar stock (puede ser null)
    // Update imageUrl only if it's explicitly provided in the request body
    // Allows setting it to null to remove the image, or updating it
    if (imageUrl !== undefined) reward.imageUrl = imageUrl;

    await reward.save();
    res.status(200).json(reward);

  } catch (error) {
    console.error(`Error al actualizar recompensa ${rewardId}:`, error);
    res.status(500).send({ message: 'Error interno al actualizar la recompensa.' });
  }
};

// Desactivar/Activar una recompensa (Admin o Manager, con verificación)
const toggleRewardStatus = async (req, res) => {
   const { rewardId } = req.params;
   const userRole = req.dbUser.role;
   const userCompanyId = req.dbUser.companyId;

   try {
    const reward = await Reward.findByPk(rewardId);
    if (!reward) {
      return res.status(404).send({ message: 'Recompensa no encontrada.' });
    }

    // Authorization Check:
    if (userRole === 'Admin' && reward.companyId !== userCompanyId) {
      return res.status(403).send({ message: 'Acceso prohibido. No puede modificar recompensas de otra compañía.' });
    }
    if (userRole === 'Manager' && reward.companyId !== null) {
      return res.status(403).send({ message: 'Acceso prohibido. No puede modificar recompensas específicas de una compañía.' });
    }

    // If checks pass, proceed
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

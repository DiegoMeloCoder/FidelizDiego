const { Reward } = require('../models');
const { Op } = require("sequelize"); // Import Op for OR queries

// Crear una nueva recompensa (Admin o Manager)
const createReward = async (req, res) => {
  const userRole = req.dbUser.role;
  const userCompanyId = req.dbUser.companyId;
  // Incluir stock (opcional), imageUrl (opcional) y tags (opcional)
  const { nombre, pointsRequired, stock, imageUrl, tags } = req.body; // Add tags

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
      tags: tags && Array.isArray(tags) ? tags : [], // Save tags if provided and is an array
    });
    res.status(201).json(newReward);
  } catch (error) {
    console.error('Error al crear recompensa:', error);
    // Podría haber un unique constraint si se define en el modelo/migración
    res.status(500).send({ message: 'Error interno al crear la recompensa.' });
  }
};

const { Redemption } = require('../models'); // Needed for recommendation logic (future)

// Listar recompensas (para Admin, Manager y Employee)
// Admins/Managers ven todas (activas e inactivas) de su ámbito (empresa o globales).
// Employees ven solo las activas de su ámbito (empresa + globales), con recomendaciones MVP.
const getRewardsByCompany = async (req, res) => {
  const userCompanyId = req.dbUser.companyId;
  const userRole = req.dbUser.role;
  const userId = req.dbUser.id; // Employee ID
  const userPoints = req.dbUser.points; // Employee points
  const userInterests = req.dbUser.interests || []; // Employee interests (default to empty array)

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
      order: [['pointsRequired', 'ASC'], ['nombre', 'ASC']], // Base order
    });

    // --- MVP Recommendation Logic for Employees ---
    if (userRole === 'Employee') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Add recommendation flags/scores (Enhanced Logic)
      const recommendedRewards = rewards.map(reward => {
        const rewardData = reward.toJSON(); // Work with plain object
        let recommendationScore = 0;
        const reasons = [];
        const rewardTags = rewardData.tags || []; // Default to empty array if tags are null/undefined

        // 1. Achievability
        const isAchievable = rewardData.pointsRequired <= userPoints;
        const isNearlyAchievable = !isAchievable && rewardData.pointsRequired <= userPoints * 1.2; // Within 20% reach

        if (isAchievable) {
          recommendationScore += 3; // High priority
          reasons.push('Achievable');
        } else if (isNearlyAchievable) {
          recommendationScore += 2; // Medium priority
          reasons.push('Nearly Achievable');
        }

        // 2. Newness
        const isNew = new Date(rewardData.createdAt) > thirtyDaysAgo;
        if (isNew) {
          recommendationScore += 1; // Lower priority
          reasons.push('New');
        }

        // 3. Interest Match Bonus (Significant boost)
        const hasInterestMatch = userInterests.some(interest => rewardTags.includes(interest));
        if (hasInterestMatch) {
          recommendationScore += 5; // Strong boost for matching interest
          reasons.push('Matches Interest');
        }

        // 4. Vote Score (Optional, smaller impact)
        const likes = rewardData.likes ?? 0;
        const dislikes = rewardData.dislikes ?? 0;
        // Simple difference, could be more complex (e.g., Wilson score)
        // Avoid division by zero if likes + dislikes is 0
        const voteScore = (likes + dislikes > 0) ? (likes - dislikes) : 0;
        // Scale the vote score to have less impact than achievability/interest
        // Example: Add a fraction of the vote score, maxing out at +/- 1
        const scaledVoteScore = Math.max(-1, Math.min(1, voteScore / 10)); // Adjust divisor (10) to tune impact
        if (scaledVoteScore > 0.1) { // Only add reason if significantly liked
             recommendationScore += scaledVoteScore;
             reasons.push('Popular');
        } else if (scaledVoteScore < -0.1) { // Only add reason if significantly disliked
             recommendationScore += scaledVoteScore; // Subtract score
             reasons.push('Unpopular');
        }


        // Add flags and score to the object
        rewardData.recommendation = {
            score: recommendationScore,
            isAchievable,
            isNearlyAchievable,
            isNew,
            reasons: reasons, // Optional: reasons for recommendation
        };
        return rewardData;
      });

      // Sort based on recommendation score (desc), then points (asc)
      recommendedRewards.sort((a, b) => {
        // Primary sort: recommendation score descending
        if (b.recommendation.score !== a.recommendation.score) {
          return b.recommendation.score - a.recommendation.score;
        }
        // Secondary sort: points required ascending
        return a.pointsRequired - b.pointsRequired;
      });

      return res.status(200).json(recommendedRewards); // Return sorted/annotated list
    }
    // --- End MVP Recommendation Logic ---

    // For Admins/Managers, return the original list
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
  // Incluir stock, imageUrl y tags en los campos a actualizar
  const { nombre, pointsRequired, isActive, stock, imageUrl, tags } = req.body; // Add tags

  // Check if at least one field is provided for update
  if (nombre === undefined && pointsRequired === undefined && isActive === undefined && stock === undefined && imageUrl === undefined && tags === undefined) { // Add tags check
     return res.status(400).send({ message: 'Se requiere al menos un campo (nombre, pointsRequired, isActive, stock, imageUrl o tags) para actualizar.' });
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
    // Update tags if provided (ensure it's an array)
    if (tags !== undefined) {
        reward.tags = Array.isArray(tags) ? tags : [];
    }

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

// --- Funcionalidad de Votación ---
const { RewardVote, sequelize } = require('../models'); // Importar RewardVote y sequelize para transacciones

const voteReward = async (req, res) => {
  const { rewardId } = req.params;
  const userId = req.dbUser.id; // Asume que authenticate ya puso el ID del usuario
  const { voteType } = req.body; // 'like' or 'dislike'

  if (!['like', 'dislike'].includes(voteType)) {
    return res.status(400).send({ message: 'Tipo de voto inválido. Debe ser "like" o "dislike".' });
  }

  const t = await sequelize.transaction(); // Iniciar transacción

  try {
    const reward = await Reward.findByPk(rewardId, { transaction: t });
    if (!reward) {
      await t.rollback();
      return res.status(404).send({ message: 'Recompensa no encontrada.' });
    }

    // Verificar si el usuario ya votó por esta recompensa
    const existingVote = await RewardVote.findOne({
      where: { userId, rewardId },
      transaction: t,
    });

    let message = '';
    let likeChange = 0;
    let dislikeChange = 0;

    if (existingVote) {
      // El usuario ya votó
      if (existingVote.voteType === voteType) {
        // Voto repetido del mismo tipo -> quitar el voto
        await existingVote.destroy({ transaction: t });
        if (voteType === 'like') likeChange = -1;
        else dislikeChange = -1;
        message = 'Voto eliminado.';
      } else {
        // Cambiar el voto
        const oldVoteType = existingVote.voteType;
        existingVote.voteType = voteType;
        await existingVote.save({ transaction: t });

        if (oldVoteType === 'like') likeChange = -1;
        else dislikeChange = -1;

        if (voteType === 'like') likeChange = 1;
        else dislikeChange = 1;
        message = 'Voto actualizado.';
      }
    } else {
      // Nuevo voto
      await RewardVote.create({ userId, rewardId, voteType }, { transaction: t });
      if (voteType === 'like') likeChange = 1;
      else dislikeChange = 1;
      message = 'Voto registrado.';
    }

    // Actualizar contadores en la recompensa solo si hubo cambios
    if (likeChange !== 0 || dislikeChange !== 0) {
       // Usar increment para evitar race conditions si no estuviera en transacción
       // Asegurarse de que los contadores no bajen de 0
       const newLikes = Math.max(0, (reward.likes || 0) + likeChange);
       const newDislikes = Math.max(0, (reward.dislikes || 0) + dislikeChange);
       await reward.update({ likes: newLikes, dislikes: newDislikes }, { transaction: t });
    }

    await t.commit(); // Confirmar transacción

    // Devolver la recompensa actualizada con los nuevos contadores
    const updatedReward = await Reward.findByPk(rewardId); // Leer fuera de la transacción
    res.status(200).json({ message, reward: updatedReward });

  } catch (error) {
    await t.rollback(); // Revertir transacción en caso de error
    console.error(`Error al votar por recompensa ${rewardId}:`, error);
    // Podría haber error de constraint único si dos requests llegan casi al mismo tiempo (aunque la transacción ayuda)
    res.status(500).send({ message: 'Error interno al procesar el voto.' });
  }
};


module.exports = {
  createReward,
  getRewardsByCompany,
  getRewardById,
  updateReward,
  toggleRewardStatus,
  voteReward, // Exportar la nueva función
};

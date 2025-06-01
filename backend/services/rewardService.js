// backend/services/rewardService.js
const {
  Reward,
  Company,
  User,
  Redemption,
  RewardVote,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');

/**
 * Crea una nueva recompensa.
 * @param {object} rewardData - Datos de la recompensa.
 * @param {object} dbUser - Objeto del usuario de la BD (con role, companyId).
 * @returns {Promise<Reward>}
 */
const createRewardService = async (rewardData, dbUser) => {
  const { nombre, pointsRequired, stock, imageUrl, tags } = rewardData;
  const { role, companyId: userCompanyId } = dbUser;

  if (role === 'Admin' && !userCompanyId) {
    throw new AppError(
      'El Admin debe pertenecer a una compañía para crear recompensas.',
      403
    );
  }

  const points = parseInt(pointsRequired);
  // La validación de !nombre, points <=0, y stock ya la haremos en el controller/validation middleware.

  const rewardCompanyId = role === 'Manager' ? null : userCompanyId;

  try {
    const newReward = await Reward.create({
      nombre,
      pointsRequired: points,
      companyId: rewardCompanyId,
      isActive: true,
      stock: stock, // Sequelize manejará null/undefined como NULL en la BD
      imageUrl: imageUrl || null,
      tags: tags && Array.isArray(tags) ? tags : [],
    });
    return newReward;
  } catch (error) {
    // Un constraint único en (nombre, companyId) podría ser útil.
    console.error('Error en RewardService al crear recompensa:', error);
    throw error; // Dejar que catchAsync lo maneje como un error 500 genérico si no es un AppError.
  }
};

/**
 * Obtiene las recompensas según el rol y compañía del usuario.
 * Incluye lógica de recomendación para empleados.
 * @param {object} dbUser - Objeto del usuario de la BD.
 * @returns {Promise<Reward[]>}
 */
const getRewardsByCompanyService = async (dbUser) => {
  const {
    id: userId,
    role,
    companyId: userCompanyId,
    points: userPoints,
    interests: userInterests = [],
  } = dbUser;

  let companyIdFilter;
  if (role === 'Manager') {
    companyIdFilter = { companyId: null }; // Managers ven solo globales por defecto en este contexto
  } else if (userCompanyId) {
    // Admins and Employees see their company's rewards OR global rewards
    companyIdFilter = {
      [Op.or]: [{ companyId: userCompanyId }, { companyId: null }],
    };
  } else {
    companyIdFilter = { companyId: null }; // Usuarios sin compañía solo ven globales
  }

  const whereClause = {
    ...companyIdFilter,
    ...(role === 'Employee' && { isActive: true }), // Empleados solo ven activas
  };

  const rewards = await Reward.findAll({
    where: whereClause,
    order: [
      ['pointsRequired', 'ASC'],
      ['nombre', 'ASC'],
    ],
  });

  if (role === 'Employee') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Recommendation flags/scores (Enhanced Logic)
    const recommendedRewards = rewards.map((rewardInstance) => {
      const reward = rewardInstance.toJSON();
      let recommendationScore = 0;
      const reasons = [];
      const rewardTags = reward.tags || [];

      // Achievability
      const isAchievable = reward.pointsRequired <= userPoints;
      const isNearlyAchievable =
        !isAchievable && reward.pointsRequired <= userPoints * 1.2;

      if (isAchievable) {
        recommendationScore += 3;
        reasons.push('Achievable');
      } else if (isNearlyAchievable) {
        recommendationScore += 2;
        reasons.push('Nearly Achievable');
      }

      if (new Date(reward.createdAt) > thirtyDaysAgo) {
        recommendationScore += 1;
        reasons.push('New');
      }

      // Interest Match Bonus (Significant boost)
      if (userInterests.some((interest) => rewardTags.includes(interest))) {
        recommendationScore += 5;
        reasons.push('Matches Interest');
      }

      // Vote Score
      const likes = reward.likes ?? 0;
      const dislikes = reward.dislikes ?? 0;
      const voteScore = likes + dislikes > 0 ? likes - dislikes : 0;
      const scaledVoteScore = Math.max(-1, Math.min(1, voteScore / 10));

      if (scaledVoteScore > 0.1) {
        recommendationScore += scaledVoteScore;
        reasons.push('Popular');
      } else if (scaledVoteScore < -0.1) {
        recommendationScore += scaledVoteScore;
        reasons.push('Unpopular');
      }

      // Add flags and score to the object
      reward.recommendation = {
        score: recommendationScore,
        isAchievable,
        isNearlyAchievable,
        isNew: new Date(reward.createdAt) > thirtyDaysAgo,
        reasons,
      };
      return reward;
    });

    // Sort based on recommendation score (desc), then points (asc)
    recommendedRewards.sort((a, b) => {
      if (b.recommendation.score !== a.recommendation.score) {
        return b.recommendation.score - a.recommendation.score;
      }
      return a.pointsRequired - b.pointsRequired;
    });
    return recommendedRewards;
  }
  return rewards;
};

/**
 * Obtiene una recompensa específica por ID, aplicando lógica de autorización.
 * @param {number} rewardId - ID de la recompensa.
 * @param {object} dbUser - Objeto del usuario de la BD.
 * @returns {Promise<Reward>}
 */
const getRewardByIdService = async (rewardId, dbUser) => {
  const reward = await Reward.findByPk(rewardId);
  if (!reward) {
    throw new AppError('Recompensa no encontrada.', 404);
  }

  // Lógica de Autorización: ¿Puede este usuario ver esta recompensa específica?
  if (dbUser.role === 'Admin' && reward.companyId !== dbUser.companyId) {
    throw new AppError(
      'Acceso prohibido. No es una recompensa de su compañía.',
      403
    );
  }
  if (dbUser.role === 'Manager' && reward.companyId !== null) {
    throw new AppError(
      'Acceso prohibido. Esta es una recompensa específica de compañía, no global.',
      403
    );
  }
  // Empleados: La lógica de getRewardsByCompanyService ya filtra las recompensas que pueden ver.
  // Si un empleado intenta acceder a una recompensa por ID directo que no debería ver,
  // la lógica de 'checkTenant' (si se aplicara a recompensas) o la falta de `companyId` en reward lo manejaría.
  // O, si es una recompensa de su empresa pero está inactiva, también se debe considerar.
  if (dbUser.role === 'Employee') {
    if (!reward.isActive) {
      throw new AppError('Esta recompensa no está activa actualmente.', 403);
    }
    if (reward.companyId !== null && reward.companyId !== dbUser.companyId) {
      throw new AppError('Acceso prohibido a esta recompensa.', 403);
    }
  }

  return reward;
};

/**
 * Actualiza una recompensa.
 * @param {number} rewardId - ID de la recompensa.
 * @param {object} updateData - Datos para actualizar.
 * @param {object} dbUser - Objeto del usuario de la BD.
 * @returns {Promise<Reward>}
 */
const updateRewardService = async (rewardId, updateData, dbUser) => {
  const reward = await Reward.findByPk(rewardId);
  if (!reward) {
    throw new AppError('Recompensa no encontrada para actualizar.', 404);
  }

  // Lógica de Autorización para modificar
  if (dbUser.role === 'Admin' && reward.companyId !== dbUser.companyId) {
    throw new AppError(
      'Acceso prohibido. No puede modificar recompensas de otra compañía.',
      403
    );
  }
  if (dbUser.role === 'Manager' && reward.companyId !== null) {
    throw new AppError(
      'Acceso prohibido. Los Managers solo pueden modificar recompensas globales (sin compañía).',
      403
    );
  }

  // If checks pass, proceed with update
  const { nombre, pointsRequired, isActive, stock, imageUrl, tags } =
    updateData;

  if (nombre !== undefined) reward.nombre = nombre;
  if (pointsRequired !== undefined)
    reward.pointsRequired = parseInt(pointsRequired);
  if (isActive !== undefined) reward.isActive = isActive;
  if (stock !== undefined)
    reward.stock = stock === null || stock === '' ? null : parseInt(stock);
  if (imageUrl !== undefined) reward.imageUrl = imageUrl;
  if (tags !== undefined)
    reward.tags = Array.isArray(tags) ? tags : reward.tags || [];

  await reward.save();
  return reward;
};

/**
 * Alterna el estado activo/inactivo de una recompensa.
 * @param {number} rewardId - ID de la recompensa.
 * @param {object} dbUser - Objeto del usuario de la BD.
 * @returns {Promise<Reward>}
 */
const toggleRewardStatusService = async (rewardId, dbUser) => {
  const reward = await Reward.findByPk(rewardId);
  if (!reward) {
    throw new AppError('Recompensa no encontrada.', 404);
  }

  // Lógica de Autorización para modificar
  if (dbUser.role === 'Admin' && reward.companyId !== dbUser.companyId) {
    throw new AppError(
      'Acceso prohibido. No puede modificar el estado de recompensas de otra compañía.',
      403
    );
  }
  if (dbUser.role === 'Manager' && reward.companyId !== null) {
    throw new AppError(
      'Acceso prohibido. Los Managers solo pueden modificar el estado de recompensas globales.',
      403
    );
  }

  reward.isActive = !reward.isActive;
  await reward.save();
  return reward;
};

/**
 * Registra o actualiza un voto para una recompensa.
 * @param {string} userId - ID del usuario que vota.
 * @param {number} rewardId - ID de la recompensa.
 * @param {string} voteType - 'like' o 'dislike'.
 * @returns {Promise<Reward>} La recompensa actualizada.
 */
const castVoteService = async (userId, rewardId, voteType) => {
  const transaction = await sequelize.transaction();
  try {
    const reward = await Reward.findByPk(rewardId, { transaction });
    if (!reward) {
      await transaction.rollback();
      throw new AppError('Recompensa no encontrada para votar.', 404);
    }

    // Verificar si el usuario ya votó por esta recompensa
    const existingVote = await RewardVote.findOne({
      where: { userId, rewardId },
      transaction,
    });

    let likeChange = 0;
    let dislikeChange = 0;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Quitar voto
        await existingVote.destroy({ transaction });
        if (voteType === 'like') likeChange = -1;
        else dislikeChange = -1;
      } else {
        // Cambiar voto
        const oldVoteType = existingVote.voteType;
        existingVote.voteType = voteType;
        await existingVote.save({ transaction });
        if (oldVoteType === 'like') likeChange = -1;
        else dislikeChange = -1;
        if (voteType === 'like') likeChange = 1;
        else dislikeChange = 1;
      }
    } else {
      // Nuevo voto
      await RewardVote.create({ userId, rewardId, voteType }, { transaction });
      if (voteType === 'like') likeChange = 1;
      else dislikeChange = 1;
    }

    // Actualizar contadores en la recompensa solo si hubo cambios
    if (likeChange !== 0 || dislikeChange !== 0) {
      const newLikes = Math.max(0, (reward.likes || 0) + likeChange);
      const newDislikes = Math.max(0, (reward.dislikes || 0) + dislikeChange);
      await reward.update(
        { likes: newLikes, dislikes: newDislikes },
        { transaction }
      );
    }

    await transaction.commit();
    // Devolvemos la instancia de recompensa actualizada desde la BD para asegurar datos frescos
    return Reward.findByPk(rewardId);
  } catch (error) {
    await transaction.rollback();
    console.error(
      `Error en RewardService al procesar voto para recompensa ${rewardId}:`,
      error
    );
    throw new AppError('Error interno al procesar el voto.', 500);
  }
};

module.exports = {
  createRewardService,
  getRewardsByCompanyService,
  getRewardByIdService,
  updateRewardService,
  toggleRewardStatusService,
  castVoteService,
};

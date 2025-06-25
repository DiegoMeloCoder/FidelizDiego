const { Redemption, User, Reward, sequelize } = require('../models');
const AppError = require('../utils/AppError');

// --- Funciones Auxiliares (Privadas) ---

/**
 * Valida todos los prerrequisitos para un canje. Lanza un AppError si alguna validación falla.
 * @private
 */
const _validateRedemptionPrerequisites = (employee, reward) => {
  if (!reward) {
    throw new AppError('Recompensa no encontrada.', 404);
  }
  if (!reward.isActive) {
    throw new AppError('Esta recompensa no está activa actualmente.', 400);
  }
  if (reward.companyId !== null && reward.companyId !== employee.companyId) {
    throw new AppError(
      'Esta recompensa no pertenece a tu compañía ni es una recompensa global.',
      403
    );
  }
  if (reward.stock !== null && reward.stock <= 0) {
    throw new AppError(`La recompensa "${reward.nombre}" está agotada.`, 400);
  }
  if (employee.points < reward.pointsRequired) {
    throw new AppError(
      `Puntos insuficientes. Necesitas ${reward.pointsRequired} y tienes ${employee.points}.`,
      400
    );
  }
};

/**
 * Ejecuta las operaciones de escritura en la base de datos para el canje.
 * @private
 */
const _executeRedemptionWrites = async (employee, reward, transaction) => {
  // 1. Crear el registro de canje
  const newRedemption = await Redemption.create(
    {
      empleadoId: employee.id,
      companyId: employee.companyId,
      recompensaId: reward.id,
      puntosCosto: reward.pointsRequired,
      // fechaCanje tiene un defaultValue, por lo que no es necesario establecerlo aquí.
    },
    { transaction }
  );

  // 2. Decrementar stock si es finito
  if (reward.stock !== null) {
    await reward.decrement('stock', { by: 1, transaction });
  }

  // 3. Decrementar los puntos del empleado
  await employee.decrement('points', {
    by: reward.pointsRequired,
    transaction,
  });

  return newRedemption;
};

// --- Función Principal del Servicio ---

/**
 * Procesa el canje de una recompensa por un empleado.
 * Orquesta la validación, ejecución y transacción.
 */
const redeemRewardService = async (employeeUserId, rewardId) => {
  const transaction = await sequelize.transaction();

  try {
    // Paso 1: Obtener y bloquear los registros relevantes para evitar condiciones de carrera.
    const employee = await User.findByPk(employeeUserId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const reward = await Reward.findByPk(rewardId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!employee) {
      throw new AppError('Empleado no encontrado.', 404); // Única validación de existencia necesaria aquí.
    }

    // Paso 2: Validar todas las reglas de negocio en una función separada.
    _validateRedemptionPrerequisites(employee, reward);

    // Paso 3: Ejecutar todas las operaciones de escritura.
    const newRedemption = await _executeRedemptionWrites(
      employee,
      reward,
      transaction
    );

    // Paso 4: Si todo fue exitoso, confirmar la transacción.
    await transaction.commit();

    // Paso 5: Leer el nuevo saldo del empleado para devolver datos frescos y 100% correctos.
    const updatedEmployee = await User.findByPk(employeeUserId, {
      attributes: ['points'],
    });

    return {
      redemption: newRedemption,
      employeeNewBalance: updatedEmployee.points,
    };
  } catch (error) {
    // Si cualquier paso dentro del 'try' falla, se revierte toda la transacción.
    await transaction.rollback();
    console.error(
      `Error en RedemptionService al canjear recompensa ${rewardId} por empleado ${employeeUserId}:`,
      error
    );

    // Si el error ya es un AppError (lanzado por nuestras validaciones), lo relanzamos.
    if (error instanceof AppError) {
      throw error;
    }
    // Si no, es un error inesperado del servidor.
    throw new AppError('Error interno al procesar el canje.', 500);
  }
};

module.exports = {
  redeemRewardService,
};

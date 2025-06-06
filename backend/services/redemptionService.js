const { Redemption, User, Reward, sequelize } = require('../models');
const AppError = require('../utils/AppError');

/**
 * Procesa el canje de una recompensa por un empleado.
 * Maneja la transacción, validaciones de stock, puntos y pertenencia.
 * @param {string} employeeUserId - UID del empleado que realiza el canje.
 * @param {number} employeeCompanyId - ID de la compañía del empleado.
 * @param {number} rewardId - ID de la recompensa a canjear.
 * @returns {Promise<{redemption: Redemption, employeeNewBalance: number}>}
 */
const redeemRewardService = async (
  employeeUserId,
  employeeCompanyId,
  rewardId
) => {
  if (!employeeCompanyId) {
    // Esta validación es importante y pertenece a la lógica de negocio.
    throw new AppError(
      'El empleado no tiene una compañía asignada y no puede canjear recompensas.',
      403
    );
  }

  const transaction = await sequelize.transaction();

  try {
    // 1. Obtener empleado y recompensa DENTRO de la transacción con bloqueo (por si el usuario intenta canjear dos veces rápido)
    const employee = await User.findByPk(employeeUserId, {
      attributes: ['id', 'points', 'companyId'], // Asegurarse que companyId se obtiene del empleado
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const reward = await Reward.findByPk(rewardId, {
      attributes: [
        'id',
        'pointsRequired',
        'companyId',
        'isActive',
        'nombre',
        'stock',
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // 2. Validaciones de existencia y estado
    if (!employee) {
      // Aunque 'authorize' ya valida el usuario, una comprobación aquí es una barrera extra.
      await transaction.rollback(); // No es estrictamente necesario si se lanza error, pero es explícito.
      throw new AppError('Empleado no encontrado.', 404);
    }
    if (!reward) {
      await transaction.rollback();
      throw new AppError('Recompensa no encontrada.', 404);
    }
    // Verificar que el companyId del empleado coincida con el que se pasó (o con el del token).
    // Esto es una doble verificación, ya que employeeCompanyId viene de req.dbUser.
    if (employee.companyId !== employeeCompanyId) {
      await transaction.rollback();
      throw new AppError('Inconsistencia en la compañía del empleado.', 403);
    }

    // Validar si la recompensa es global (companyId es null) O pertenece a la compañía del empleado.
    if (reward.companyId !== null && reward.companyId !== employeeCompanyId) {
      await transaction.rollback();
      throw new AppError(
        'Esta recompensa no pertenece a tu compañía ni es una recompensa global.',
        403
      );
    }

    if (!reward.isActive) {
      await transaction.rollback();
      throw new AppError('Esta recompensa no está activa actualmente.', 400);
    }

    // 3. Validar stock (si no es null, o sea, no es infinito)
    if (reward.stock !== null && reward.stock <= 0) {
      await transaction.rollback();
      throw new AppError(`La recompensa "${reward.nombre}" está agotada.`, 400);
    }

    // 4. Validar si el empleado tiene suficientes puntos
    if (employee.points < reward.pointsRequired) {
      await transaction.rollback();
      throw new AppError(
        `Puntos insuficientes. Necesitas ${reward.pointsRequired} y tienes ${employee.points}.`,
        400
      );
    }

    // 5. Crear el registro de canje
    const newRedemption = await Redemption.create(
      {
        empleadoId: employee.id,
        companyId: employeeCompanyId, // Usar el companyId del empleado (que debe coincidir con la recompensa si no es global)
        recompensaId: reward.id,
        puntosCosto: reward.pointsRequired,
        fechaCanje: new Date(),
      },
      { transaction }
    );

    // 6. Decrementar stock si es finito
    if (reward.stock !== null) {
      await reward.decrement('stock', { by: 1, transaction });
    }

    // 7. Decrementar los puntos del empleado
    await employee.decrement('points', {
      by: reward.pointsRequired,
      transaction,
    });

    // 8. Confirmar la transacción
    await transaction.commit();

    return {
      redemption: newRedemption,
      employeeNewBalance: employee.points - reward.pointsRequired, // Puntos después del canje
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(
      `Error en RedemptionService al canjear recompensa ${rewardId} por empleado ${employeeUserId}:`,
      error
    );
    // Si el error ya es un AppError, lo relanzamos, sino, creamos uno genérico.
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error interno al procesar el canje.', 500);
  }
};

module.exports = {
  redeemRewardService,
};

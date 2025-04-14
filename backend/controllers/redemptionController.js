const { Redemption, User, Reward, sequelize } = require('../models');

// Canjear una recompensa (solo Employee)
const redeemReward = async (req, res) => {
  const employeeUserId = req.dbUser.id; // UID del empleado autenticado
  const employeeCompanyId = req.dbUser.companyId;
  const { rewardId } = req.params; // ID de la recompensa a canjear

  // --- Validaciones ---
  if (!employeeCompanyId) {
     return res.status(403).send({ message: 'El empleado no tiene una compañía asignada.' });
  }
  if (!rewardId || isNaN(parseInt(rewardId))) {
     return res.status(400).send({ message: 'Se requiere un ID de recompensa válido.' });
  }

  let transaction;

  try {
    transaction = await sequelize.transaction();

    // 1. Obtener empleado y recompensa DENTRO de la transacción para bloquear filas (FOR UPDATE)
    // Esto previene condiciones de carrera si el usuario intenta canjear dos veces rápido
    // o si un admin le quita puntos al mismo tiempo.
    const employee = await User.findByPk(employeeUserId, {
      attributes: ['id', 'points', 'companyId'],
      transaction,
      lock: transaction.LOCK.UPDATE // Bloquear fila del usuario
    });

    const reward = await Reward.findByPk(parseInt(rewardId), {
      // Incluir stock en los atributos a traer
      attributes: ['id', 'pointsRequired', 'companyId', 'isActive', 'nombre', 'stock'],
      transaction,
      lock: transaction.LOCK.UPDATE // Bloquear fila de la recompensa
    });

    // 2. Validar existencia, pertenencia a compañía y estado activo
    if (!employee) { // No debería pasar si authenticate/authorize funcionaron
      await transaction.rollback();
      return res.status(404).send({ message: 'Empleado no encontrado.' });
    }
    if (!reward) {
      await transaction.rollback();
      return res.status(404).send({ message: 'Recompensa no encontrada.' });
    }
    // Allow redemption if reward is global (companyId is null) OR belongs to the employee's company
    if (reward.companyId !== null && reward.companyId !== employeeCompanyId) {
      await transaction.rollback();
      return res.status(403).send({ message: 'Esta recompensa no pertenece a tu compañía ni es una recompensa global.' });
    }
    if (!reward.isActive) {
       await transaction.rollback();
       return res.status(400).send({ message: 'Esta recompensa no está activa actualmente.' });
    }

    // 3. Validar stock (si no es null)
    if (reward.stock !== null && reward.stock <= 0) {
        await transaction.rollback();
        return res.status(400).send({ message: `Recompensa "${reward.nombre}" agotada.` });
    }

    // 4. Validar si el empleado tiene suficientes puntos
    if (employee.points < reward.pointsRequired) {
      await transaction.rollback();
      return res.status(400).send({ message: `Puntos insuficientes. Necesitas ${reward.pointsRequired} puntos y tienes ${employee.points}.` });
    }

    // 4. Crear el registro de canje
    const newRedemption = await Redemption.create({
      empleadoId: employee.id,
      companyId: employeeCompanyId,
      recompensaId: reward.id,
      puntosCosto: reward.pointsRequired, // Guardar el costo en el momento del canje
      fechaCanje: new Date(),
    }, { transaction });

    // 5. Decrementar stock si es finito
    if (reward.stock !== null) {
        await Reward.decrement(
            { stock: 1 },
            { where: { id: reward.id }, transaction }
        );
    }

    // 6. Decrementar los puntos del empleado
    // Usamos decrement para seguridad
    await User.decrement(
        { points: reward.pointsRequired },
        { where: { id: employee.id }, transaction }
    );

    // 7. Confirmar la transacción
    await transaction.commit();

    // Devolver el registro del canje y el nuevo saldo
    const updatedEmployee = await User.findByPk(employee.id, { attributes: ['points'] });

    res.status(201).json({
        redemption: newRedemption,
        employeeNewBalance: updatedEmployee ? updatedEmployee.points : null
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(`Error al canjear recompensa ${rewardId} por empleado ${employeeUserId}:`, error);
    if (error.name && error.name.includes('Sequelize')) {
       return res.status(400).send({ message: `Error de base de datos: ${error.message}` });
    }
    res.status(500).send({ message: 'Error interno al procesar el canje.' });
  }
};

// TODO: Implementar endpoint para obtener historial de canjes del empleado
// const getMyRedemptionHistory = async (req, res) => { ... }

module.exports = {
  redeemReward,
  // getMyRedemptionHistory,
};

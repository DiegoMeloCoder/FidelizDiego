const { PointAssignment, User, Justification, sequelize } = require('../models');
const { Op } = require('sequelize');

// Asignar puntos a un empleado (solo Admin)
const assignPoints = async (req, res) => {
  const adminUserId = req.dbUser.id; // UID del admin autenticado
  const adminCompanyId = req.dbUser.companyId;
  const { empleadoId, cantidad, justificacionId } = req.body; // empleadoId es el UID del empleado

  // --- Validaciones ---
  if (!empleadoId || cantidad === undefined || !justificacionId) {
    return res.status(400).send({ message: 'Se requiere ID de empleado, cantidad y ID de justificación.' });
  }
  if (!adminCompanyId) {
     return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }
  const pointsAmount = parseInt(cantidad);
  if (isNaN(pointsAmount) || pointsAmount === 0) {
     return res.status(400).send({ message: 'La cantidad debe ser un número entero distinto de cero.' });
  }
   if (isNaN(parseInt(justificacionId))) {
     return res.status(400).send({ message: 'El ID de justificación debe ser un número.' });
  }

  let transaction; // Variable para la transacción

  try {
    // Iniciar transacción
    transaction = await sequelize.transaction();

    // 1. Validar que el empleado exista, esté activo y pertenezca a la misma compañía que el admin
    const employee = await User.findOne({
      where: {
        id: empleadoId,
        role: 'Employee',
        companyId: adminCompanyId,
        // isActive: true, // ¿Permitir asignar puntos a inactivos? Decisión de negocio. Por ahora sí.
      },
      attributes: ['id', 'points', 'isActive'], // Traer puntos actuales
      transaction // Incluir en la transacción
    });

    if (!employee) {
      await transaction.rollback(); // Revertir transacción
      return res.status(404).send({ message: 'Empleado no encontrado, inactivo o no pertenece a esta compañía.' });
    }

    // 2. Validar que la justificación exista, esté activa y sea global o de la compañía del admin
    const justification = await Justification.findOne({
      where: {
        id: parseInt(justificacionId),
        estaActiva: true,
        [Op.or]: [
          { companyId: null, esPredeterminada: true }, // Global activa
          { companyId: adminCompanyId } // O específica de la compañía (activa ya filtrado)
        ]
      },
      attributes: ['id', 'textoJustificacion'], // Traer texto para denormalizar
      transaction // Incluir en la transacción
    });

    if (!justification) {
       await transaction.rollback();
       return res.status(404).send({ message: 'Justificación no encontrada, inactiva o no válida para esta compañía.' });
    }

    // 3. Crear el registro de asignación de puntos
    const newAssignment = await PointAssignment.create({
      adminId: adminUserId,
      empleadoId: employee.id,
      companyId: adminCompanyId,
      cantidad: pointsAmount,
      justificacionId: justification.id,
      justificacionTexto: justification.textoJustificacion, // Guardar texto actual
      fechaAsignacion: new Date(), // O usar defaultValue
    }, { transaction }); // Incluir en la transacción

    // 4. Actualizar el saldo de puntos del empleado
    // Usamos increment para evitar condiciones de carrera si hubiera concurrencia
    await User.increment(
        { points: pointsAmount },
        { where: { id: employee.id }, transaction } // Incluir en la transacción
    );

    // Si todo fue bien, confirmar la transacción
    await transaction.commit();

    // Devolver la asignación creada y quizás el nuevo saldo del empleado
    // Volver a consultar el empleado para obtener el saldo actualizado
    const updatedEmployee = await User.findByPk(employee.id, { attributes: ['points'] });

    res.status(201).json({
        assignment: newAssignment,
        employeeNewBalance: updatedEmployee ? updatedEmployee.points : null // Nuevo saldo
    });

  } catch (error) {
    // Si hubo algún error, revertir la transacción
    if (transaction) await transaction.rollback();

    console.error('Error al asignar puntos:', error);
    // Manejar errores específicos si es necesario (ej. validación de Sequelize)
    if (error.name && error.name.includes('Sequelize')) {
       return res.status(400).send({ message: `Error de base de datos: ${error.message}` });
    }
    res.status(500).send({ message: 'Error interno al asignar puntos.' });
  }
};

// TODO: Implementar endpoint para obtener historial de puntos asignados (para Admin)
// const getPointAssignmentHistory = async (req, res) => { ... }

module.exports = {
  assignPoints,
  // getPointAssignmentHistory,
};

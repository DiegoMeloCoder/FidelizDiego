const { User, sequelize } = require('../models');
const admin = require('../config/firebaseAdmin');
const AppError = require('../utils/AppError');

/**
 * Helper para generar contraseñas temporales.
 * @param {number} length - La longitud de la contraseña.
 * @returns {string} Una contraseña temporal aleatoria.
 */
const generateTemporaryPassword = (length = 12) => {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

/**
 * Crea un nuevo usuario Empleado en Firebase y en la base de datos local.
 * @param {number} adminCompanyId - ID de la compañía del admin que crea el empleado.
 * @param {object} employeeData - Datos del empleado (email, password, nombre).
 * @returns {Promise<object>} El perfil del nuevo empleado.
 */
const createEmployeeService = async (adminCompanyId, employeeData) => {
  const { email, password, nombre } = employeeData;

  if (!adminCompanyId) {
    throw new AppError(
      'El administrador no tiene una compañía asignada para realizar esta acción.',
      403
    );
  }

  let firebaseUserRecord;
  try {
    firebaseUserRecord = await admin
      .auth()
      .createUser({ email, password, displayName: nombre, disabled: false });
    const newUserInDb = await User.create({
      id: firebaseUserRecord.uid,
      email,
      nombre,
      role: 'Employee',
      companyId: adminCompanyId,
      isActive: true,
      points: 0,
    });
    return {
      id: newUserInDb.id,
      email: newUserInDb.email,
      nombre: newUserInDb.nombre,
      role: newUserInDb.role,
      companyId: newUserInDb.companyId,
      isActive: newUserInDb.isActive,
    };
  } catch (error) {
    if (firebaseUserRecord) {
      console.warn(
        `La creación en la BD falló para el empleado ${firebaseUserRecord.uid}. Deshaciendo creación en Firebase...`
      );
      await admin
        .auth()
        .deleteUser(firebaseUserRecord.uid)
        .catch((delErr) =>
          console.error(
            `¡ERROR CRÍTICO! No se pudo eliminar el usuario ${firebaseUserRecord.uid} de Firebase.`,
            delErr
          )
        );
    }

    if (error.code === 'auth/email-already-exists') {
      throw new AppError('El email ya está registrado.', 409);
    }
    console.error('Error inesperado al crear empleado:', error);
    throw new AppError('Error interno al crear el empleado.', 500);
  }
};

/**
 * Obtiene todos los empleados de una compañía específica.
 * @param {number} adminCompanyId - ID de la compañía.
 * @returns {Promise<User[]>}
 */
const getAllEmployeesByCompanyService = async (adminCompanyId) => {
  if (!adminCompanyId) {
    throw new AppError(
      'El administrador debe pertenecer a una compañía para ver sus empleados.',
      403
    );
  }
  const employees = await User.findAll({
    where: { companyId: adminCompanyId, role: 'Employee' },
    attributes: [
      'id',
      'email',
      'nombre',
      'role',
      'companyId',
      'points',
      'isActive',
      'createdAt',
    ],
    order: [['nombre', 'ASC']],
  });
  return employees;
};

/**
 * Obtiene un empleado específico por su ID, asegurando que pertenezca a la compañía del admin.
 * @param {string} employeeId - UID del empleado.
 * @param {number} adminCompanyId - ID de la compañía del admin.
 * @returns {Promise<User>}
 */
const getEmployeeByIdService = async (employeeId, adminCompanyId) => {
  if (!adminCompanyId) {
    throw new AppError('El administrador debe pertenecer a una compañía.', 403);
  }
  const employee = await User.findOne({
    where: { id: employeeId, role: 'Employee', companyId: adminCompanyId },
    attributes: [
      'id',
      'email',
      'nombre',
      'role',
      'companyId',
      'points',
      'isActive',
      'createdAt',
      'updatedAt',
    ],
  });
  if (!employee) {
    throw new AppError('Empleado no encontrado en esta compañía.', 404);
  }
  return employee;
};

/**
 * Actualiza los datos de un empleado en la BD y en Firebase.
 * @param {string} employeeId - UID del empleado.
 * @param {number} adminCompanyId - ID de la compañía del admin.
 * @param {object} updateData - Datos a actualizar (nombre, isActive).
 * @returns {Promise<User>} El empleado actualizado.
 */
const updateEmployeeService = async (
  employeeId,
  adminCompanyId,
  updateData
) => {
  const { nombre, isActive } = updateData;
  const employeeUser = await getEmployeeByIdService(employeeId, adminCompanyId); // Reutilizamos para encontrar y autorizar

  try {
    // Actualización sincronizada: primero DB local, luego Firebase
    if (nombre !== undefined) employeeUser.nombre = nombre;
    if (isActive !== undefined) employeeUser.isActive = isActive;
    await employeeUser.save();

    const firebasePayload = {};
    if (nombre !== undefined) firebasePayload.displayName = nombre;
    if (isActive !== undefined) firebasePayload.disabled = !isActive;

    if (Object.keys(firebasePayload).length > 0) {
      await admin.auth().updateUser(employeeId, firebasePayload);
    }
    return employeeUser;
  } catch (error) {
    console.error(
      `Error actualizando empleado ${employeeId}. Posible desincronización entre DB y Firebase.`,
      error
    );
    if (error.code && error.code.startsWith('auth/')) {
      throw new AppError(`Error de Firebase: ${error.message}`, 400);
    }
    throw new AppError('Error interno al actualizar el empleado.', 500);
  }
};

/**
 * Procesa una carga masiva de empleados.
 * @param {number} adminCompanyId - ID de la compañía.
 * @param {object[]} employeesToCreate - Array de objetos de empleado a crear.
 * @returns {Promise<{success: object[], errors: object[]}>}
 */
const bulkUploadEmployeesService = async (
  adminCompanyId,
  employeesToCreate
) => {
  if (!adminCompanyId) {
    throw new AppError('El administrador debe pertenecer a una compañía.', 403);
  }

  const results = { success: [], errors: [] };
  const transaction = await sequelize.transaction();

  try {
    for (const empData of employeesToCreate) {
      const email = empData.email?.trim();
      const nombre = empData.nombre?.trim();

      if (!email || !nombre || !/\S+@\S+\.\S+/.test(email)) {
        results.errors.push({
          email: email || 'N/A',
          error: 'Faltan datos o el formato de email es inválido.',
        });
        continue;
      }

      let firebaseUserRecord;
      try {
        const tempPassword = generateTemporaryPassword();
        firebaseUserRecord = await admin.auth().createUser({
          email,
          password: tempPassword,
          displayName: nombre,
          disabled: false,
        });
        await User.create(
          {
            id: firebaseUserRecord.uid,
            email,
            nombre,
            role: 'Employee',
            companyId: adminCompanyId,
            isActive: true,
            points: 0,
          },
          { transaction }
        );
        results.success.push({ email, name: nombre, tempPassword });
      } catch (error) {
        if (firebaseUserRecord?.uid) {
          await admin
            .auth()
            .deleteUser(firebaseUserRecord.uid)
            .catch((delErr) =>
              console.error(
                `CRITICAL: Failed to delete Firebase user ${firebaseUserRecord.uid}`,
                delErr
              )
            );
        }
        const errorMessage =
          error.code === 'auth/email-already-exists'
            ? 'Email ya registrado.'
            : 'Error desconocido al procesar.';
        results.errors.push({ email, error: errorMessage });
      }
    }
    await transaction.commit();
    return results;
  } catch (error) {
    await transaction.rollback();
    console.error(
      'Error mayor durante la carga masiva que requirió rollback:',
      error
    );
    throw new AppError(
      'Error fatal durante la carga masiva. No se crearon empleados.',
      500
    );
  }
};

module.exports = {
  createEmployeeService,
  getAllEmployeesByCompanyService,
  getEmployeeByIdService,
  updateEmployeeService,
  bulkUploadEmployeesService,
};

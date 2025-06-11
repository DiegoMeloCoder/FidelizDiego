const { User, Company } = require('../models');
const admin = require('../config/firebaseAdmin'); // Firebase Admin SDK
const AppError = require('../utils/AppError');

/**
 * Crea un nuevo usuario Admin tanto en Firebase Auth como en la base de datos local.
 * Incluye lógica de rollback para mantener la consistencia entre sistemas.
 * @param {object} adminData - Datos del admin a crear (email, password, nombre, companyId).
 * @returns {Promise<object>} El perfil del nuevo admin.
 */
const createAdminService = async (adminData) => {
  const { email, password, nombre, companyId } = adminData;

  const companyExists = await Company.findByPk(companyId);
  if (!companyExists) {
    throw new AppError(
      `La compañía con ID ${companyId} no fue encontrada.`,
      404
    );
  }

  let firebaseUserRecord;
  try {
    // --- 1. Crear usuario en Firebase Auth ---
    firebaseUserRecord = await admin.auth().createUser({
      email,
      password,
      displayName: nombre,
      disabled: false,
    });

    // --- 2. Crear usuario en la base de datos local ---
    const newUserInDb = await User.create({
      id: firebaseUserRecord.uid, // Usar el UID de Firebase como PK
      email,
      nombre: nombre || null,
      role: 'Admin',
      companyId,
      isActive: true,
      points: 0,
    });

    // Opcional: Establecer Custom Claims para autorización basada en roles desde el token.
    // await admin.auth().setCustomUserClaims(firebaseUserRecord.uid, { role: 'Admin', companyId });

    // Devolvemos un perfil limpio
    return {
      id: newUserInDb.id,
      email: newUserInDb.email,
      nombre: newUserInDb.nombre,
      role: newUserInDb.role,
      companyId: newUserInDb.companyId,
      isActive: newUserInDb.isActive,
    };
  } catch (error) {
    // --- Lógica de Rollback / Compensación ---
    // Si la creación del usuario en Firebase tuvo éxito pero la creación en la BD falló,
    // debemos eliminar el usuario de Firebase para evitar datos inconsistentes.
    if (firebaseUserRecord) {
      console.warn(
        `La creación en la BD falló para el usuario ${firebaseUserRecord.uid}. Intentando rollback en Firebase...`
      );
      try {
        await admin.auth().deleteUser(firebaseUserRecord.uid);
        console.log(
          `Usuario ${firebaseUserRecord.uid} eliminado de Firebase exitosamente.`
        );
      } catch (deleteError) {
        // Este es un error crítico que requiere intervención manual.
        console.error(
          `¡ERROR CRÍTICO! No se pudo eliminar el usuario ${firebaseUserRecord.uid} de Firebase tras un fallo en la BD.`,
          deleteError
        );
        // Podrías registrar este error en un sistema de monitoreo.
      }
    }

    // Analizar el error original para dar una respuesta adecuada
    if (error.code === 'auth/email-already-exists') {
      throw new AppError('El email ya está registrado.', 409);
    }
    if (error.name && error.name.includes('Sequelize')) {
      throw new AppError(`Error de base de datos: ${error.message}`, 400);
    }

    // Para cualquier otro error inesperado
    console.error('Error inesperado al crear administrador:', error);
    throw new AppError('Error interno al crear el administrador.', 500);
  }
};

/**
 * Obtiene todos los usuarios con rol 'Admin'.
 * @param {number} [companyId] - ID opcional para filtrar por compañía.
 * @returns {Promise<User[]>}
 */
const getAllAdminsService = async (companyId) => {
  const whereClause = { role: 'Admin' };
  if (companyId) {
    whereClause.companyId = companyId;
  }

  const admins = await User.findAll({
    where: whereClause,
    attributes: [
      'id',
      'email',
      'nombre',
      'role',
      'companyId',
      'isActive',
      'createdAt',
    ],
    include: [{ model: Company, as: 'company', attributes: ['id', 'nombre'] }],
    order: [['createdAt', 'DESC']],
  });
  return admins;
};

/**
 * Actualiza los datos de un admin en la BD y en Firebase.
 * @param {string} adminId - UID del admin.
 * @param {object} updateData - Datos a actualizar (nombre, isActive).
 * @returns {Promise<object>} El perfil actualizado del admin.
 */
const updateAdminService = async (adminId, updateData) => {
  const { nombre, isActive } = updateData;
  const adminUser = await User.findOne({
    where: { id: adminId, role: 'Admin' },
  });

  if (!adminUser) {
    throw new AppError('Administrador no encontrado.', 404);
  }

  // --- Actualización Sincronizada ---
  // Actualizamos primero nuestra DB, luego Firebase.
  try {
    if (nombre !== undefined) adminUser.nombre = nombre;
    if (isActive !== undefined) adminUser.isActive = isActive;
    await adminUser.save();

    const firebasePayload = {};
    if (nombre !== undefined) firebasePayload.displayName = nombre;
    if (isActive !== undefined) firebasePayload.disabled = !isActive;

    if (Object.keys(firebasePayload).length > 0) {
      await admin.auth().updateUser(adminId, firebasePayload);
    }

    return adminUser;
  } catch (error) {
    // Si la actualización de Firebase falla, nuestra DB ya está actualizada.
    // Esto podría dejar una inconsistencia. Se debe loguear como un error grave.
    console.error(
      `Error al actualizar admin ${adminId}. Posible desincronización entre DB y Firebase.`,
      error
    );
    if (error.code && error.code.startsWith('auth/')) {
      throw new AppError(`Error de Firebase: ${error.message}`, 400);
    }
    throw new AppError('Error interno al actualizar el administrador.', 500);
  }
};

/**
 * Alterna el estado activo/inactivo de un admin.
 * @param {string} adminId - UID del admin.
 * @returns {Promise<User>} El admin actualizado.
 */
const toggleAdminStatusService = async (adminId) => {
  const adminUser = await User.findOne({
    where: { id: adminId, role: 'Admin' },
  });
  if (!adminUser) {
    throw new AppError('Administrador no encontrado.', 404);
  }

  const newStatus = !adminUser.isActive;
  return await updateAdminService(adminId, { isActive: newStatus });
};

module.exports = {
  createAdminService,
  getAllAdminsService,
  updateAdminService,
  toggleAdminStatusService,
};

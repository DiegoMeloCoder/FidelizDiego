const { User, Company } = require('../models');
const admin = require('../config/firebaseAdmin'); // Firebase Admin SDK

// Crear un nuevo usuario Administrador (solo para Manager)
const createAdmin = async (req, res) => {
  const { email, password, nombre, companyId } = req.body;

  if (!email || !password || !companyId) {
    return res.status(400).send({ message: 'Email, contraseña y ID de compañía son requeridos.' });
  }

  // Validar que la compañía exista
  try {
    const companyExists = await Company.findByPk(companyId);
    if (!companyExists) {
      return res.status(404).send({ message: `Compañía con ID ${companyId} no encontrada.` });
    }

    // 1. Crear usuario en Firebase Auth
    const firebaseUserRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: nombre, // Opcional, pero útil
      disabled: false, // Asegurarse de que el usuario esté activo en Firebase
    });

    // 2. Crear usuario en nuestra base de datos
    const newUser = await User.create({
      id: firebaseUserRecord.uid, // Usar el UID de Firebase como ID
      email: email,
      nombre: nombre || null,
      role: 'Admin', // Asignar rol Admin
      companyId: companyId,
      isActive: true, // Por defecto activo
      points: 0, // Admins no manejan puntos directamente
    });

    // Opcional: ¿Establecer custom claims en Firebase para el rol? Podría ser útil.
    // await admin.auth().setCustomUserClaims(firebaseUserRecord.uid, { role: 'Admin', companyId: companyId });

    // Devolver solo la información necesaria (excluir contraseña, etc.)
    const userProfile = {
      id: newUser.id,
      email: newUser.email,
      nombre: newUser.nombre,
      role: newUser.role,
      companyId: newUser.companyId,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
    };

    res.status(201).json(userProfile);

  } catch (error) {
    console.error('Error al crear administrador:', error);
    // Manejar errores específicos de Firebase (ej. email ya existe)
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).send({ message: 'El email ya está registrado en Firebase.' });
    }
    // Manejar errores de Sequelize (ej. validación)
    if (error.name && error.name.includes('Sequelize')) {
       // Si falla la creación en Sequelize después de crear en Firebase,
       // idealmente deberíamos borrar el usuario de Firebase para consistencia.
       if (firebaseUserRecord && firebaseUserRecord.uid) {
         try {
           await admin.auth().deleteUser(firebaseUserRecord.uid);
           console.warn(`Usuario ${firebaseUserRecord.uid} eliminado de Firebase debido a error en BD.`);
         } catch (deleteError) {
           console.error(`Error al intentar eliminar usuario ${firebaseUserRecord.uid} de Firebase tras fallo en BD:`, deleteError);
         }
       }
       return res.status(400).send({ message: `Error de base de datos: ${error.message}` });
    }
    res.status(500).send({ message: 'Error interno al crear el administrador.' });
  }
};

// Listar todos los administradores (solo para Manager)
// Opcionalmente filtrar por compañía si se pasa un query param ?companyId=...
const getAllAdmins = async (req, res) => {
  const { companyId } = req.query; // Filtrar por compañía opcionalmente
  const whereClause = { role: 'Admin' };

  if (companyId) {
    // Validar que companyId sea un número si se proporciona
    if (isNaN(parseInt(companyId))) {
       return res.status(400).send({ message: 'El ID de compañía debe ser un número.' });
    }
    whereClause.companyId = parseInt(companyId);
  }

  try {
    const admins = await User.findAll({
      where: whereClause,
      attributes: ['id', 'email', 'nombre', 'role', 'companyId', 'isActive', 'createdAt'],
      include: [{ model: Company, as: 'company', attributes: ['id', 'nombre'] }], // Incluir nombre de la compañía
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(admins);
  } catch (error) {
    console.error('Error al listar administradores:', error);
    res.status(500).send({ message: 'Error interno al listar administradores.' });
  }
};


// Actualizar un administrador (solo para Manager) - Solo permite cambiar nombre y estado activo
const updateAdmin = async (req, res) => {
  const { adminId } = req.params; // El ID aquí es el UID de Firebase
  const { nombre, isActive } = req.body;

  // Validar que al menos uno de los campos a actualizar esté presente
  if (nombre === undefined && isActive === undefined) {
    return res.status(400).send({ message: 'Se requiere al menos un campo (nombre o isActive) para actualizar.' });
  }

  try {
    const adminUser = await User.findOne({ where: { id: adminId, role: 'Admin' } });

    if (!adminUser) {
      return res.status(404).send({ message: 'Administrador no encontrado.' });
    }

    // Actualizar en Firebase Auth (nombre y estado disabled)
    const updatePayload = {};
    if (nombre !== undefined) updatePayload.displayName = nombre;
    if (isActive !== undefined) updatePayload.disabled = !isActive; // Firebase usa 'disabled'

    if (Object.keys(updatePayload).length > 0) {
        await admin.auth().updateUser(adminId, updatePayload);
    }

    // Actualizar en nuestra base de datos
    if (nombre !== undefined) adminUser.nombre = nombre;
    if (isActive !== undefined) adminUser.isActive = isActive;

    await adminUser.save();

     // Devolver solo la información necesaria
    const userProfile = {
      id: adminUser.id,
      email: adminUser.email,
      nombre: adminUser.nombre,
      role: adminUser.role,
      companyId: adminUser.companyId,
      isActive: adminUser.isActive,
      createdAt: adminUser.createdAt,
      updatedAt: adminUser.updatedAt, // Incluir updatedAt
    };

    res.status(200).json(userProfile);

  } catch (error) {
    console.error(`Error al actualizar administrador ${adminId}:`, error);
     // Manejar errores específicos de Firebase (ej. usuario no encontrado)
    if (error.code && error.code.startsWith('auth/')) {
       return res.status(400).send({ message: `Error de Firebase: ${error.message}` });
    }
    // Manejar errores de Sequelize
    if (error.name && error.name.includes('Sequelize')) {
       return res.status(400).send({ message: `Error de base de datos: ${error.message}` });
    }
    res.status(500).send({ message: 'Error interno al actualizar el administrador.' });
  }
};

// Desactivar/Activar un administrador (eliminación lógica) (solo para Manager)
const toggleAdminStatus = async (req, res) => {
  const { adminId } = req.params;

  try {
    const adminUser = await User.findOne({ where: { id: adminId, role: 'Admin' } });

    if (!adminUser) {
      return res.status(404).send({ message: 'Administrador no encontrado.' });
    }

    const newStatus = !adminUser.isActive;

    // Actualizar en Firebase Auth
    await admin.auth().updateUser(adminId, { disabled: !newStatus });

    // Actualizar en nuestra base de datos
    adminUser.isActive = newStatus;
    await adminUser.save();

    res.status(200).json({ message: `Estado del administrador cambiado a ${newStatus ? 'activo' : 'inactivo'}`, admin: adminUser });

  } catch (error) {
    console.error(`Error al cambiar estado de administrador ${adminId}:`, error);
     if (error.code && error.code.startsWith('auth/')) {
       return res.status(400).send({ message: `Error de Firebase: ${error.message}` });
    }
    res.status(500).send({ message: 'Error interno al cambiar estado del administrador.' });
  }
};


module.exports = {
  createAdmin,
  getAllAdmins,
  updateAdmin,
  toggleAdminStatus,
};

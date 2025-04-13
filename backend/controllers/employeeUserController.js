const { User, sequelize } = require('../models'); // Importar sequelize para transacciones
const admin = require('../config/firebaseAdmin'); // Firebase Admin SDK
const { Op } = require('sequelize'); // Para operadores de consulta

// Crear un nuevo usuario Empleado (solo para Admin de la misma compañía)
const createEmployee = async (req, res) => {
  // El companyId viene del Admin autenticado (adjunto en req.dbUser por el middleware authorize)
  const adminCompanyId = req.dbUser.companyId;
  const { email, password, nombre } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: 'Email y contraseña son requeridos.' });
  }
  if (!adminCompanyId) {
     return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }

  let firebaseUserRecord; // Para poder borrarlo si falla la creación en BD

  try {
    // 1. Crear usuario en Firebase Auth
    firebaseUserRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: nombre,
      disabled: false,
    });

    // 2. Crear usuario en nuestra base de datos
    const newUser = await User.create({
      id: firebaseUserRecord.uid,
      email: email,
      nombre: nombre || null,
      role: 'Employee', // Asignar rol Employee
      companyId: adminCompanyId, // Asignar la compañía del Admin que lo crea
      isActive: true,
      points: 0, // Los empleados empiezan con 0 puntos
    });

    // Opcional: Establecer custom claims en Firebase
    // await admin.auth().setCustomUserClaims(firebaseUserRecord.uid, { role: 'Employee', companyId: adminCompanyId });

    const userProfile = {
      id: newUser.id,
      email: newUser.email,
      nombre: newUser.nombre,
      role: newUser.role,
      companyId: newUser.companyId,
      isActive: newUser.isActive,
      points: newUser.points,
      createdAt: newUser.createdAt,
    };

    res.status(201).json(userProfile);

  } catch (error) {
    console.error('Error al crear empleado:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).send({ message: 'El email ya está registrado en Firebase.' });
    }
    if (error.name && error.name.includes('Sequelize')) {
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
    res.status(500).send({ message: 'Error interno al crear el empleado.' });
  }
};

// Listar todos los empleados DE LA COMPAÑÍA del Admin autenticado
const getAllEmployeesByCompany = async (req, res) => {
  const adminCompanyId = req.dbUser.companyId;

  if (!adminCompanyId) {
     return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }

  try {
    const employees = await User.findAll({
      where: {
        companyId: adminCompanyId,
        role: 'Employee', // Asegurarse de traer solo empleados
      },
      attributes: ['id', 'email', 'nombre', 'role', 'companyId', 'points', 'isActive', 'createdAt'],
      order: [['nombre', 'ASC']], // Ordenar por nombre
    });
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error al listar empleados:', error);
    res.status(500).send({ message: 'Error interno al listar empleados.' });
  }
};

// Actualizar un empleado (solo Admin de la misma compañía) - Permite cambiar nombre y estado activo
const updateEmployee = async (req, res) => {
  const adminCompanyId = req.dbUser.companyId;
  const { employeeId } = req.params; // UID de Firebase del empleado
  const { nombre, isActive } = req.body;

   if (!adminCompanyId) {
     return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }
  if (nombre === undefined && isActive === undefined) {
    return res.status(400).send({ message: 'Se requiere al menos un campo (nombre o isActive) para actualizar.' });
  }

  try {
    // Buscar al empleado asegurándose que pertenece a la compañía del admin
    const employeeUser = await User.findOne({
      where: {
        id: employeeId,
        role: 'Employee',
        companyId: adminCompanyId // ¡Importante! Verificar pertenencia
      }
    });

    if (!employeeUser) {
      return res.status(404).send({ message: 'Empleado no encontrado en esta compañía.' });
    }

    // Actualizar en Firebase Auth (nombre y estado disabled)
    const updatePayload = {};
    if (nombre !== undefined) updatePayload.displayName = nombre;
    if (isActive !== undefined) updatePayload.disabled = !isActive;

    if (Object.keys(updatePayload).length > 0) {
        await admin.auth().updateUser(employeeId, updatePayload);
    }

    // Actualizar en nuestra base de datos
    if (nombre !== undefined) employeeUser.nombre = nombre;
    if (isActive !== undefined) employeeUser.isActive = isActive;

    await employeeUser.save();

    const userProfile = {
      id: employeeUser.id,
      email: employeeUser.email,
      nombre: employeeUser.nombre,
      role: employeeUser.role,
      companyId: employeeUser.companyId,
      isActive: employeeUser.isActive,
      points: employeeUser.points,
      createdAt: employeeUser.createdAt,
      updatedAt: employeeUser.updatedAt,
    };

    res.status(200).json(userProfile);

  } catch (error) {
    console.error(`Error al actualizar empleado ${employeeId}:`, error);
    if (error.code && error.code.startsWith('auth/')) {
       return res.status(400).send({ message: `Error de Firebase: ${error.message}` });
    }
    if (error.name && error.name.includes('Sequelize')) {
       return res.status(400).send({ message: `Error de base de datos: ${error.message}` });
    }
    res.status(500).send({ message: 'Error interno al actualizar el empleado.' });
  }
};

// Desactivar/Activar un empleado (solo Admin de la misma compañía)
const toggleEmployeeStatus = async (req, res) => {
  const adminCompanyId = req.dbUser.companyId;
  const { employeeId } = req.params;

  if (!adminCompanyId) {
     return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }

  try {
     const employeeUser = await User.findOne({
      where: {
        id: employeeId,
        role: 'Employee',
        companyId: adminCompanyId // Verificar pertenencia
      }
    });

    if (!employeeUser) {
      return res.status(404).send({ message: 'Empleado no encontrado en esta compañía.' });
    }

    const newStatus = !employeeUser.isActive;

    // Actualizar en Firebase Auth
    await admin.auth().updateUser(employeeId, { disabled: !newStatus });

    // Actualizar en nuestra base de datos
    employeeUser.isActive = newStatus;
    await employeeUser.save();

    res.status(200).json({ message: `Estado del empleado cambiado a ${newStatus ? 'activo' : 'inactivo'}`, employee: employeeUser });

  } catch (error) {
    console.error(`Error al cambiar estado de empleado ${employeeId}:`, error);
    if (error.code && error.code.startsWith('auth/')) {
       return res.status(400).send({ message: `Error de Firebase: ${error.message}` });
    }
    res.status(500).send({ message: 'Error interno al cambiar estado del empleado.' });
  }
};

// TODO: Implementar endpoint para carga masiva (POST /bulk-upload)
// const bulkUploadEmployees = async (req, res) => { ... }

module.exports = {
  createEmployee,
  getAllEmployeesByCompany,
  updateEmployee,
  toggleEmployeeStatus,
  // bulkUploadEmployees, // Añadir cuando se implemente
};

// Simple random password generator (move from frontend)
const generateTemporaryPassword = (length = 10) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
};

// Bulk Upload Employees (solo Admin)
const bulkUploadEmployees = async (req, res) => {
    const adminCompanyId = req.dbUser.companyId;
    const employeesToCreate = req.body; // Espera un array: [{ nombre: '...', email: '...' }, ...]

    if (!adminCompanyId) {
        return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
    }
    if (!Array.isArray(employeesToCreate) || employeesToCreate.length === 0) {
        return res.status(400).send({ message: 'Se requiere un array de empleados no vacío.' });
    }

    const results = { success: [], errors: [] };
    let transaction;

    try {
        // Iniciar transacción de base de datos
        transaction = await sequelize.transaction();

        for (const empData of employeesToCreate) {
            const email = empData.email?.trim();
            const nombre = empData.nombre?.trim();

            if (!email || !nombre) {
                results.errors.push({ email: email || 'N/A', error: 'Faltan nombre o email.' });
                continue; // Saltar este registro
            }

            // Validar formato de email básico
             if (!/\S+@\S+\.\S+/.test(email)) {
                results.errors.push({ email: email, error: 'Formato de email inválido.' });
                continue;
            }

            const tempPassword = generateTemporaryPassword();
            let firebaseUserRecord;

            try {
                // 1. Intentar crear en Firebase Auth
                firebaseUserRecord = await admin.auth().createUser({
                    email: email,
                    password: tempPassword,
                    displayName: nombre,
                    disabled: false,
                });

                // 2. Intentar crear en la base de datos (dentro de la transacción)
                await User.create({
                    id: firebaseUserRecord.uid,
                    email: email,
                    nombre: nombre,
                    role: 'Employee',
                    companyId: adminCompanyId,
                    isActive: true,
                    points: 0,
                }, { transaction }); // Importante pasar la transacción

                // Si ambos tienen éxito
                results.success.push({ email: email, name: nombre, tempPassword: tempPassword });

            } catch (error) {
                 console.error(`Error procesando empleado ${email} en bulk upload:`, error);
                 let errorMessage = 'Error desconocido.';
                 if (error.code === 'auth/email-already-exists') {
                    errorMessage = 'Email ya registrado en Firebase.';
                 } else if (error.name && error.name.includes('Sequelize')) {
                    errorMessage = `Error de base de datos: ${error.message}`;
                    // Si falla la BD después de crear en Firebase, borrar de Firebase
                    if (firebaseUserRecord?.uid) {
                        try {
                            await admin.auth().deleteUser(firebaseUserRecord.uid);
                            console.warn(`Usuario ${firebaseUserRecord.uid} eliminado de Firebase por fallo en BD durante bulk.`);
                        } catch (deleteError) {
                            console.error(`Error eliminando usuario ${firebaseUserRecord.uid} de Firebase tras fallo en BD:`, deleteError);
                        }
                    }
                 } else if (error.message) {
                     errorMessage = error.message;
                 }
                 results.errors.push({ email: email, error: errorMessage });
                 // No continuar a la BD si Firebase falló
            }
        }

        // Si llegamos aquí sin errores mayores que aborten todo, confirmar la transacción
        await transaction.commit();
        res.status(200).json(results);

    } catch (error) {
        // Si hubo un error inesperado durante el bucle o al iniciar/commitear la transacción
        if (transaction) await transaction.rollback();
        console.error('Error mayor durante bulk upload:', error);
        res.status(500).send({ message: 'Error interno del servidor durante la carga masiva.' });
    }
};


module.exports = {
  createEmployee,
  getAllEmployeesByCompany,
  updateEmployee,
  toggleEmployeeStatus,
  bulkUploadEmployees, // Exportar nueva función
};

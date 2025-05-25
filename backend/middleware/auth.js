// Middleware para autenticación y autorización
const admin = require('../config/firebaseAdmin');
const { User, Company } = require('../models'); // Importar modelos User y Company
const AppError = require('../utils/AppError'); // Importar nuestra clase de error personalizada

/**
 * Middleware para verificar el token de Firebase ID.
 * Adjunta la información del usuario decodificado (desde Firebase) a req.user.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Si no hay token o el formato es incorrecto, pasar el error al manejador global.
    return next(
      new AppError(
        'Acceso no autorizado. Se requiere un token de autenticación en formato Bearer.',
        401
      )
    );
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Información del token de Firebase
    console.log(
      `[Authenticate] Usuario autenticado vía Firebase: ${decodedToken.uid}, Email: ${decodedToken.email}`
    );
    next(); // Continuar al siguiente middleware/ruta
  } catch (error) {
    console.error('Error verificando el token de Firebase ID:', error);
    if (error.code === 'auth/id-token-expired') {
      return next(
        new AppError(
          'El token de autenticación ha expirado. Por favor, inicie sesión de nuevo.',
          401
        )
      );
    }
    // Para otros errores de verificación de token (inválido, revocado, etc.)
    return next(
      new AppError(
        'Acceso prohibido. El token de autenticación es inválido o ha sido revocado.',
        403
      )
    );
  }
};

/**
 * Middleware para verificar roles de usuario y su estado activo.
 * Asume que 'authenticate' ya se ejecutó y puso req.user.uid.
 * Adjunta información del usuario de la BD (rol, companyId) a req.dbUser.
 * @param {string|string[]} requiredRoles - Rol o array de roles requeridos para acceder a la ruta.
 */
const authorize = (requiredRoles = []) => {
  // Asegurarse de que requiredRoles sea siempre un array
  const roles = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  return async (req, res, next) => {
    if (!req.user || !req.user.uid) {
      console.error(
        '[Authorize] Middleware llamado sin usuario autenticado previamente por Firebase (req.user.uid faltante).'
      );
      return next(
        new AppError(
          'No autenticado. Se requiere autenticación previa para la autorización.',
          401
        )
      );
    }
    const firebaseUserId = req.user.uid;
    console.log(
      `[Authorize] Buscando usuario en DB con Firebase UID: ${firebaseUserId}`
    );

    try {
      const user = await User.findByPk(firebaseUserId, { // Asumimos que el PK de User es el Firebase UID
        attributes: ['id', 'role', 'companyId', 'isActive'],
      });

      if (!user) {
        console.error(
          `[Authorize] Usuario con Firebase UID ${firebaseUserId} NO encontrado en la base de datos.`
        );
        return next(
          new AppError(
            'Acceso prohibido. El usuario autenticado no se encuentra registrado en el sistema.',
            403
          )
        );
      }

      console.log(
        `[Authorize] Usuario encontrado en DB: ID=${user.id}, Rol=${user.role}, CompanyID=${user.companyId}, IsActive=${user.isActive}`
      );

      if (!user.isActive) {
        console.warn(
          `[Authorize] Intento de acceso por usuario inactivo: ${user.id} (Firebase UID: ${firebaseUserId})`
        );
        return next(
          new AppError(
            'Acceso prohibido. Su cuenta de usuario está inactiva.',
            403
          )
        );
      }

      // Adjuntar información relevante de la BD a la solicitud
      req.dbUser = {
        id: user.id, // Este es el ID de la tabla User (Firebase UID)
        role: user.role,
        companyId: user.companyId,
      };

      // Verificar si el rol del usuario está en la lista de roles requeridos
      if (roles.length > 0 && !roles.includes(user.role)) {
        console.warn(
          `[Authorize] Acceso denegado para usuario ${user.id} (Rol: ${user.role}). Roles requeridos: ${roles.join(', ')}`
        );
        return next(
          new AppError(
            'Acceso prohibido. No tiene los permisos necesarios para acceder a este recurso.',
            403
          )
        );
      }

      console.log(
        `[Authorize] Usuario ${user.id} autorizado con rol ${user.role}.`
      );
      next();
    } catch (error) {
      console.error(
        `[Authorize] Error durante la búsqueda o validación del usuario ${firebaseUserId} en la BD:`,
        error
      );
      return next(
        new AppError(
          'Error interno del servidor durante el proceso de autorización.',
          500
        )
      );
    }
  };
};

/**
 * Middleware para verificar que el usuario pertenece a la misma compañía que el recurso solicitado (aislamiento de tenant).
 * Omite la verificación para el rol 'Manager'.
 * @param {string} modelName - Nombre del modelo Sequelize a consultar (ej. 'Reward', 'User').
 * @param {string} paramName - Nombre del parámetro en req.params que contiene el ID del recurso (ej. 'rewardId', 'employeeId'). Por defecto 'id'.
 */
const checkTenant = (modelName, paramName = 'id') => {
  return async (req, res, next) => {
    if (!req.dbUser || !req.dbUser.id) {
      console.error(
        '[CheckTenant] Middleware llamado sin información de usuario de BD adjunta (req.dbUser faltante).'
      );
      return next(
        new AppError(
          'No autenticado o usuario no encontrado en el sistema. Se requiere autorización previa.',
          401 // O 403 si se prefiere indicar que la autorización falló
        )
      );
    }

    // Los Managers (superadmins) no tienen verificación de tenant; pueden acceder a datos de cualquier compañía.
    if (req.dbUser.role === 'Manager') {
      console.log(
        `[CheckTenant] Verificación de tenant omitida para Manager ${req.dbUser.id}`
      );
      return next();
    }

    // Otros roles (Admin, Employee) deben tener un companyId.
    if (!req.dbUser.companyId) {
      console.error(
        `[CheckTenant] Usuario ${req.dbUser.id} (Rol: ${req.dbUser.role}) no tiene un companyId asignado.`
      );
      return next(
        new AppError(
          'Acceso prohibido. Su usuario no está asignado a ninguna compañía.',
          403
        )
      );
    }

    const resourceId = req.params[paramName];
    if (!resourceId) {
      console.error(
        `[CheckTenant] No se encontró el parámetro de ruta '${paramName}' en req.params.`
      );
      return next(
        new AppError(
          `Parámetro de ruta requerido '${paramName}' faltante para la verificación de pertenencia.`,
          400
        )
      );
    }

    try {
      const Model = require('../models')[modelName]; // Cargar el modelo dinámicamente
      if (!Model) {
        console.error(
          `[CheckTenant] Error crítico: Modelo '${modelName}' no encontrado en el sistema.`
        );
        return next(
          new AppError(
            'Error interno del servidor: Configuración de modelo incorrecta.',
            500
          )
        );
      }

      // Buscar el recurso por su ID y obtener su companyId.
      // Asumimos que el recurso tiene un campo 'companyId'.
      const resource = await Model.findByPk(resourceId, {
        attributes: ['companyId'], // Solo necesitamos companyId para la verificación
      });

      if (!resource) {
        console.warn(
          `[CheckTenant] Recurso ${modelName} con ID ${resourceId} no encontrado durante la verificación de pertenencia.`
        );
        // Es importante no revelar si el recurso no existe o si el usuario no tiene permiso.
        // Un 403 genérico es más seguro. El controlador puede luego dar un 404 si es apropiado.
        return next(
          new AppError(
            'Acceso prohibido. El recurso solicitado no existe o no tiene permiso para acceder a él.',
            403 // Podría ser 404 si estamos seguros que el recurso no existe, pero 403 es más general para permisos.
          )
        );
      }

      // Comparar companyId del usuario con el del recurso.
      if (resource.companyId !== req.dbUser.companyId) {
        console.warn(
          `[CheckTenant] Acceso denegado al recurso ${modelName} ${resourceId}. Usuario ${req.dbUser.id} (Cía: ${req.dbUser.companyId}) intentó acceder a recurso de Cía: ${resource.companyId}`
        );
        return next(
          new AppError(
            'Acceso prohibido. No tiene permiso para acceder a recursos de esta compañía.',
            403
          )
        );
      }

      console.log(
        `[CheckTenant] Verificación de pertenencia OK para usuario ${req.dbUser.id} en recurso ${modelName} ${resourceId}`
      );
      next();
    } catch (error) {
      console.error(
        `[CheckTenant] Error durante la verificación de pertenencia para ${modelName} con ID ${resourceId}:`,
        error
      );
      return next(
        new AppError(
          'Error interno del servidor durante la verificación de pertenencia del recurso.',
          500
        )
      );
    }
  };
};

/**
 * Middleware para verificar si la compañía del usuario tiene una suscripción activa.
 * Omite la verificación para el rol 'Manager'.
 * @param {object} options - Opciones para la verificación.
 * @param {boolean} options.allowPending - Si es true, permite acceso si el estado es 'pending_payment'.
 */
const checkSubscription = (options = { allowPending: false }) => {
  return async (req, res, next) => {
    if (!req.dbUser || !req.dbUser.id) {
      console.error(
        '[CheckSubscription] Middleware llamado sin información de usuario de BD adjunta (req.dbUser faltante).'
      );
      return next(
        new AppError(
          'No autenticado o usuario no encontrado en el sistema. Se requiere autorización previa.',
          401
        )
      );
    }

    if (req.dbUser.role === 'Manager') {
      console.log(
        `[CheckSubscription] Verificación de suscripción omitida para Manager ${req.dbUser.id}`
      );
      return next();
    }

    if (!req.dbUser.companyId) {
      console.error(
        `[CheckSubscription] Usuario ${req.dbUser.id} (Rol: ${req.dbUser.role}) no tiene companyId para verificar suscripción.`
      );
      // Usamos 402 (Payment Required) para indicar problemas relacionados con suscripción/pago.
      return next(
        new AppError(
          'Acceso restringido. Su usuario no está asociado a una compañía con suscripción.',
          402
        )
      );
    }

    try {
      // No es necesario re-importar 'Company' si ya está en el scope global del archivo.
      // const Company = require('../models').Company; 
      const company = await Company.findByPk(req.dbUser.companyId, {
        attributes: ['status'], // Solo necesitamos el estado de la compañía
      });

      if (!company) {
        console.error(
          `[CheckSubscription] Compañía con ID ${req.dbUser.companyId} (asociada al usuario ${req.dbUser.id}) no fue encontrada.`
        );
        return next(
          new AppError(
            'Error de configuración: La compañía asociada a su cuenta no existe.',
            403 // Podría ser un 500 si consideramos esto un error grave de integridad de datos.
          )
        );
      }

      const companyStatus = company.status;
      req.subscriptionStatus = companyStatus; // Adjuntar estado para posible uso en frontend/controlador

      if (companyStatus === 'active') {
        console.log(
          `[CheckSubscription] Verificación OK (Estado: Active) para usuario ${req.dbUser.id} (Compañía: ${req.dbUser.companyId})`
        );
        return next();
      }

      if (companyStatus === 'pending_payment' && options.allowPending) {
        console.log(
          `[CheckSubscription] Verificación OK (Estado: Pending Payment, acceso permitido) para usuario ${req.dbUser.id} (Compañía: ${req.dbUser.companyId})`
        );
        return next();
      }
      
      // Para otros estados (inactive, o pending_payment sin permiso explícito)
      console.warn(
        `[CheckSubscription] Acceso denegado para usuario ${req.dbUser.id}. Compañía ${req.dbUser.companyId} tiene estado: ${companyStatus} (allowPending: ${options.allowPending})`
      );
      
      let message = `Acceso restringido. La suscripción de su compañía (Estado: ${companyStatus}) no permite el acceso.`;
      if (companyStatus === 'inactive') {
        message = `Acceso denegado. La compañía asociada está inactiva. Contacte al soporte o a su manager.`;
      } else if (companyStatus === 'pending_payment') {
        message = `Acceso restringido. La suscripción de su compañía está pendiente de pago. Contacte a su administrador.`;
      }
      // Otros estados podrían tener mensajes específicos.

      return next(new AppError(message, 402)); // 402 Payment Required
      
    } catch (error) {
      console.error(
        `[CheckSubscription] Error durante la verificación de suscripción para compañía ${req.dbUser.companyId} (Usuario ${req.dbUser.id}):`,
        error
      );
      return next(
        new AppError(
          'Error interno del servidor durante la verificación del estado de la suscripción.',
          500
        )
      );
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  checkTenant,
  checkSubscription,
};

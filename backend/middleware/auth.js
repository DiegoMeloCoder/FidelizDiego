// Middleware para autenticación y autorización

const admin = require('../config/firebaseAdmin');
const { User } = require('../models'); // Importar el modelo User

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('No se proporcionó token de autenticación o formato incorrecto.');
    return res.status(401).send({ message: 'Acceso no autorizado. Token requerido.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Adjuntar información del usuario decodificado a la solicitud
    console.log(`Usuario autenticado: ${decodedToken.uid}, Email: ${decodedToken.email}`);
    next(); // Continuar al siguiente middleware/ruta
  } catch (error) {
    console.error('Error verificando el token de Firebase ID:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).send({ message: 'Token expirado. Por favor, inicie sesión de nuevo.' });
    }
    return res.status(403).send({ message: 'Acceso prohibido. Token inválido.' });
  }
};

const authorize = (requiredRoles = []) => {
  // Asegurarse de que requiredRoles sea siempre un array
  if (typeof requiredRoles === 'string') {
    requiredRoles = [requiredRoles];
  }

  return async (req, res, next) => {
    // Asume que authenticate ya se ejecutó y puso el UID en req.user.uid
    if (!req.user || !req.user.uid) {
      console.error('Middleware authorize llamado sin usuario autenticado previamente.');
      return res.status(401).send({ message: 'No autenticado.' });
    }
    const userIdToFind = req.user.uid; // Guardar el UID que buscamos
    console.log(`[Authorize] Buscando usuario en DB con UID: ${userIdToFind}`); // Log antes de buscar

    try {
      const user = await User.findByPk(userIdToFind, {
        attributes: ['id', 'role', 'companyId', 'isActive'], // Solo traer los campos necesarios
      });

      if (!user) {
        console.error(`[Authorize] Usuario con UID ${userIdToFind} NO encontrado en la base de datos.`); // Log si no se encuentra
        return res.status(403).send({ message: 'Usuario no encontrado en el sistema.' });
      }

      console.log(`[Authorize] Usuario encontrado en DB: ID=${user.id}, Rol=${user.role}, CompanyID=${user.companyId}, IsActive=${user.isActive}`); // Log si se encuentra

      if (!user.isActive) {
        console.warn(`Intento de acceso por usuario inactivo: ${user.id}`);
        return res.status(403).send({ message: 'Usuario inactivo.' });
      }

      // Adjuntar información relevante de la BD a la solicitud para uso posterior
      req.dbUser = {
        id: user.id,
        role: user.role,
        companyId: user.companyId,
      };

      // Verificar si el rol del usuario está en la lista de roles requeridos
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        console.warn(`Acceso denegado para usuario ${user.id} (Rol: ${user.role}). Roles requeridos: ${requiredRoles}`);
        return res.status(403).send({ message: 'Acceso prohibido. Permisos insuficientes.' });
      }

      // Si pasa la verificación de rol (o no se requieren roles específicos), continuar
      console.log(`Usuario ${user.id} autorizado con rol ${user.role}.`);
      next();

    } catch (error) {
      console.error('Error en middleware authorize:', error);
      return res.status(500).send({ message: 'Error interno del servidor durante la autorización.' });
    }
  };
};

// Middleware para verificar que el usuario pertenece a la misma compañía que el recurso solicitado
// modelName: Nombre del modelo Sequelize a consultar (ej. 'Reward', 'User' para empleados)
// paramName: Nombre del parámetro en req.params que contiene el ID del recurso (ej. 'rewardId', 'employeeId')
const checkTenant = (modelName, paramName = 'id') => {
  return async (req, res, next) => {
    // Asume que authenticate y authorize ya se ejecutaron
    if (!req.dbUser || !req.dbUser.id) {
      console.error('Middleware checkTenant llamado sin usuario de BD adjunto.');
      return res.status(401).send({ message: 'No autenticado o usuario no encontrado.' });
    }

    // Los Managers no tienen tenant check (pueden ver/gestionar todo)
    if (req.dbUser.role === 'Manager') {
      console.log(`Tenant check omitido para Manager ${req.dbUser.id}`);
      return next();
    }

    // Si el usuario no es Manager, debe tener un companyId
    if (!req.dbUser.companyId) {
      console.error(`Usuario ${req.dbUser.id} (Rol: ${req.dbUser.role}) no tiene companyId asignado.`);
      return res.status(403).send({ message: 'Acceso prohibido. Usuario sin compañía asignada.' });
    }

    const resourceId = req.params[paramName];
    if (!resourceId) {
      console.error(`Middleware checkTenant: No se encontró el parámetro '${paramName}' en req.params.`);
      return res.status(400).send({ message: `Parámetro de ruta '${paramName}' faltante.` });
    }

    try {
      const Model = require('../models')[modelName]; // Cargar el modelo dinámicamente
      if (!Model) {
        console.error(`Middleware checkTenant: Modelo '${modelName}' no encontrado.`);
        return res.status(500).send({ message: 'Error interno del servidor: Modelo no encontrado.' });
      }

      // Buscar el recurso por su ID y verificar su companyId
      // Usamos findByPk para buscar por clave primaria. Si el ID del recurso no es la PK, ajustar la consulta.
      const resource = await Model.findByPk(resourceId, { attributes: ['companyId'] });

      if (!resource) {
        // No enviar 404 aquí directamente, podría ser un problema de permisos o ID incorrecto.
        // Dejar que el controlador maneje el 404 si el recurso realmente no existe.
        console.warn(`Middleware checkTenant: Recurso ${modelName} con ID ${resourceId} no encontrado.`);
        return res.status(403).send({ message: 'Acceso prohibido o recurso no encontrado.' });
      }

      // Comparar companyId del usuario con el del recurso
      if (resource.companyId !== req.dbUser.companyId) {
        console.warn(`Acceso denegado a recurso ${modelName} ${resourceId}. Usuario ${req.dbUser.id} (Cía: ${req.dbUser.companyId}) vs Recurso (Cía: ${resource.companyId})`);
        return res.status(403).send({ message: 'Acceso prohibido. No pertenece a la compañía correcta.' });
      }

      // Si las companyId coinciden, permitir el acceso
      console.log(`Tenant check OK para usuario ${req.dbUser.id} en recurso ${modelName} ${resourceId}`);
      next();

    } catch (error) {
      console.error(`Error en middleware checkTenant (${modelName}, ${paramName}=${resourceId}):`, error);
      return res.status(500).send({ message: 'Error interno del servidor durante la verificación de pertenencia.' });
    }
  };
};


module.exports = {
  authenticate,
  authorize,
  checkTenant,
};

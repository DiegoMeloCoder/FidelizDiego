const express = require('express');
const statsController = require('../controllers/statsController');
const { authenticate, authorize, checkSubscription } = require('../middleware/auth'); 

const router = express.Router();

// Ruta para obtener estadísticas del dashboard del Admin
// Permitir ver dashboard si está activa o pendiente
router.get(
    '/admin',
    authenticate,
    authorize('Admin'),
    checkSubscription({ allowPending: true }),
    statsController.getAdminDashboardStats
);

// Ruta para obtener estadísticas del dashboard del Manager
router.get(
    '/manager',
    authenticate,
    authorize('Manager'),
    statsController.getManagerDashboardStats
);

// Ruta para obtener el interés más común de los empleados de una compañía
// Accesible por Admin (para su compañía) y Manager (para cualquier compañía que gestione, requiere checkTenant)
router.get(
    '/company/common-interest',
    authenticate,
    authorize(['Admin', 'Manager']),
    checkSubscription({ allowPending: true }),
    statsController.getCompanyCommonInterest
);

// Ruta para obtener las solicitudes de recompensa más frecuentes
// Accesible por Manager (para la compañía que gestiona, requiere checkTenant)
router.get(
    '/company/top-reward-requests',
    authenticate,
    authorize(['Manager']),
    statsController.getTopRewardRequests
);


module.exports = router;

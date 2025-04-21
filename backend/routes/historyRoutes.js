const express = require('express');
const historyController = require('../controllers/historyController');
// Importar checkSubscription
const { authenticate, authorize, checkSubscription } = require('../middleware/auth'); 

const router = express.Router();

// Rutas para Admin
// Permitir ver historial si está activa o pendiente
router.get(
  '/admin/points',
  authenticate,
  authorize('Admin'), // Solo Admin
  checkSubscription({ allowPending: true }), // Permitir acceso limitado
  historyController.getPointAssignmentHistory
);
router.get(
    '/admin/redemptions',
    authenticate,
    authorize('Admin'), // Solo Admin
    checkSubscription({ allowPending: true }), // Permitir acceso limitado
    historyController.getRedemptionHistoryAdmin
);

// Rutas para Employee
// Permitir ver historial si está activa o pendiente
router.get(
    '/employee/points',
    authenticate,
    authorize('Employee'), // Solo Employee
    checkSubscription({ allowPending: true }), // Permitir acceso limitado
    historyController.getMyPointHistory
);
router.get(
    '/employee/redemptions',
    authenticate,
    authorize('Employee'), // Solo Employee
    checkSubscription({ allowPending: true }), // Permitir acceso limitado
    historyController.getMyRedemptionHistory
);

// Ruta para Ranking (accesible por Admin y Employee)
// Permitir ver ranking si está activa o pendiente
router.get(
    '/ranking',
    authenticate,
    authorize(['Admin', 'Employee']), // Permitir ambos roles
    checkSubscription({ allowPending: true }), // Permitir acceso limitado
    historyController.getRanking
);

// Rutas para Manager
router.get(
    '/manager/redemptions/global',
    authenticate,
    authorize('Manager'), // Solo Manager
    historyController.getManagerGlobalRedemptionHistory
);


module.exports = router;

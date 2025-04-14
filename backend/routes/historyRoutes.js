const express = require('express');
const historyController = require('../controllers/historyController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Rutas para Admin
router.get(
  '/admin/points',
  authenticate,
  authorize('Admin'), // Solo Admin
  historyController.getPointAssignmentHistory
);
router.get(
    '/admin/redemptions',
    authenticate,
    authorize('Admin'), // Solo Admin
    historyController.getRedemptionHistoryAdmin
);

// Rutas para Employee
router.get(
    '/employee/points',
    authenticate,
    authorize('Employee'), // Solo Employee
    historyController.getMyPointHistory
);
router.get(
    '/employee/redemptions',
    authenticate,
    authorize('Employee'), // Solo Employee
    historyController.getMyRedemptionHistory
);

// Ruta para Ranking (accesible por Admin y Employee)
router.get(
    '/ranking',
    authenticate,
    authorize(['Admin', 'Employee']), // Permitir ambos roles
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

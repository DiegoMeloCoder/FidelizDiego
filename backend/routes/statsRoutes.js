const express = require('express');
const statsController = require('../controllers/statsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Ruta para obtener estadísticas del dashboard del Admin
router.get(
    '/admin',
    authenticate,
    authorize('Admin'), // Solo Admin puede acceder
    statsController.getAdminDashboardStats
);

// Ruta para obtener estadísticas del dashboard del Manager
router.get(
    '/manager',
    authenticate,
    authorize('Manager'), // Solo Manager puede acceder
    statsController.getManagerDashboardStats
);

module.exports = router;

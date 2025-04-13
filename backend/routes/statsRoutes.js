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

// TODO: Añadir ruta para stats del Manager si es necesario
// router.get('/manager', authenticate, authorize('Manager'), statsController.getManagerDashboardStats);

module.exports = router;

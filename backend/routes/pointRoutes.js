const express = require('express');
const pointController = require('../controllers/pointController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación y autorización (solo Admin)
router.use(authenticate, authorize('Admin'));

// Ruta para asignar puntos
router.post('/assign', pointController.assignPoints);

// TODO: Añadir ruta para historial de puntos asignados (GET /history ?)
// router.get('/history', pointController.getPointAssignmentHistory);

module.exports = router;

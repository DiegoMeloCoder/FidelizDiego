const express = require('express');
const justificationController = require('../controllers/justificationController');
const { authenticate, authorize, checkTenant } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación y autorización (solo Admin) a todas las rutas de justificaciones
router.use(authenticate, authorize('Admin'));

// Rutas CRUD para Justificaciones
router.get('/', justificationController.getJustifications); // Lista globales activas y todas las de la compañía
router.post('/', justificationController.createCompanyJustification); // Crea una específica de la compañía
router.put('/:justificationId', checkTenant('Justification', 'justificationId'), justificationController.updateCompanyJustification); // Actualiza solo específicas de la compañía
router.patch('/:justificationId/toggle-status', checkTenant('Justification', 'justificationId'), justificationController.toggleCompanyJustificationStatus); // Cambia estado solo específicas de la compañía

module.exports = router;

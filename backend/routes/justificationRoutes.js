const express = require('express');
const justificationController = require('../controllers/justificationController');
const { authenticate, authorize, checkTenant, checkSubscription } = require('../middleware/auth'); 

const router = express.Router();

// Aplicar autenticación, autorización (solo Admin) y verificación de suscripción
// Usar checkSubscription() sin opciones (allowPending: false por defecto) para bloquear si no está activa
router.use(authenticate, authorize('Admin'), checkSubscription()); 

// Rutas CRUD para Justificaciones
router.get('/', justificationController.getJustifications); // Lista globales activas y todas las de la compañía
router.post('/', justificationController.createCompanyJustification); // Crea una específica de la compañía
router.put('/:justificationId', checkTenant('Justification', 'justificationId'), justificationController.updateCompanyJustification); // Actualiza solo específicas de la compañía
router.patch('/:justificationId/toggle-status', checkTenant('Justification', 'justificationId'), justificationController.toggleCompanyJustificationStatus); // Cambia estado solo específicas de la compañía

module.exports = router;

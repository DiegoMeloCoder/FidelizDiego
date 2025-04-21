const express = require('express');
const pointController = require('../controllers/pointController');
// Importar checkSubscription
const { authenticate, authorize, checkSubscription } = require('../middleware/auth'); 

const router = express.Router();

// Aplicar autenticación y autorización (solo Admin) globalmente
router.use(authenticate, authorize('Admin')); 

// Ruta para asignar puntos - Requiere suscripción activa
router.post('/assign', 
  checkSubscription(), // Bloquear si no está activa
  pointController.assignPoints
);

// Ruta para obtener sugerencias de puntos basadas en justificación - Permitir si está activa o pendiente
router.get('/suggestions/justification/:justificationId', 
  checkSubscription({ allowPending: true }), // Permitir acceso limitado
  pointController.getPointsSuggestionByJustification
);

// Ruta para generar mensaje de reconocimiento (AI) - Permitir si está activa o pendiente
router.post('/generate-message', 
  checkSubscription({ allowPending: true }), // Permitir acceso limitado
  pointController.generateRecognitionMessage
);

// TODO: Añadir ruta para historial de puntos asignados (GET /history ?)
// router.get('/history', pointController.getPointAssignmentHistory);

module.exports = router;

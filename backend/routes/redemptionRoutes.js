const express = require('express');
const redemptionController = require('../controllers/redemptionController');
const { authenticate, authorize, checkSubscription } = require('../middleware/auth'); 

const router = express.Router();

// Aplicar autenticación, autorización (solo Employee) y verificación de suscripción
// Usar checkSubscription() sin opciones (allowPending: false por defecto) para bloquear si no está activa
router.use(authenticate, authorize('Employee'), checkSubscription()); 

// Ruta para canjear una recompensa específica
router.post('/rewards/:rewardId/redeem', redemptionController.redeemReward);

// TODO: Añadir ruta para historial de canjes del empleado (GET /history ?)
// router.get('/history', redemptionController.getMyRedemptionHistory);

module.exports = router;

const express = require('express');
const redemptionController = require('../controllers/redemptionController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación y autorización (solo Employee)
router.use(authenticate, authorize('Employee'));

// Ruta para canjear una recompensa específica
router.post('/rewards/:rewardId/redeem', redemptionController.redeemReward);

// TODO: Añadir ruta para historial de canjes del empleado (GET /history ?)
// router.get('/history', redemptionController.getMyRedemptionHistory);

module.exports = router;

const express = require('express');
const rewardController = require('../controllers/rewardController');
const { authenticate, authorize, checkTenant } = require('../middleware/auth');

const router = express.Router();

// Rutas accesibles por Admin y Employee (con diferentes lógicas en el controlador)
// Todos necesitan estar autenticados y pertenecer a una compañía
router.get('/', authenticate, authorize(['Admin', 'Employee']), rewardController.getRewardsByCompany);

// Rutas exclusivas para Admin (para crear, obtener una específica, actualizar, cambiar estado)
// Se aplica authenticate, authorize('Admin') y checkTenant para las rutas con :rewardId
router.post('/', authenticate, authorize('Admin'), rewardController.createReward);
router.get('/:rewardId', authenticate, authorize('Admin'), checkTenant('Reward', 'rewardId'), rewardController.getRewardById);
router.put('/:rewardId', authenticate, authorize('Admin'), checkTenant('Reward', 'rewardId'), rewardController.updateReward);
router.patch('/:rewardId/toggle-status', authenticate, authorize('Admin'), checkTenant('Reward', 'rewardId'), rewardController.toggleRewardStatus);

module.exports = router;

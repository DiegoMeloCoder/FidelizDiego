const express = require('express');
const rewardController = require('../controllers/rewardController');
const { authenticate, authorize, checkTenant } = require('../middleware/auth');

const router = express.Router();

// Rutas accesibles por Admin, Manager y Employee (con diferentes lógicas en el controlador)
router.get('/', authenticate, authorize(['Admin', 'Manager', 'Employee']), rewardController.getRewardsByCompany);

// Rutas para crear, obtener una específica, actualizar, cambiar estado (Admin o Manager, con lógica en controlador)
// Se aplica authenticate y authorize(['Admin', 'Manager']). La verificación específica se hace en el controlador.
router.post('/', authenticate, authorize(['Admin', 'Manager']), rewardController.createReward);
router.get('/:rewardId', authenticate, authorize(['Admin', 'Manager']), rewardController.getRewardById); // checkTenant removido
router.put('/:rewardId', authenticate, authorize(['Admin', 'Manager']), rewardController.updateReward); // checkTenant removido
router.patch('/:rewardId/toggle-status', authenticate, authorize(['Admin', 'Manager']), rewardController.toggleRewardStatus); // checkTenant removido

module.exports = router;

const express = require('express');
const rewardRequestController = require('../controllers/rewardRequestController');
const { authenticate, authorize, checkTenant } = require('../middleware/auth');

const router = express.Router();

// Ruta para que un empleado cree una nueva solicitud
router.post(
  '/',
  authenticate,
  authorize(['Employee']),
  rewardRequestController.createRewardRequest
);

// Ruta para listar solicitudes (Admin/Manager)
router.get(
  '/',
  authenticate,
  authorize(['Admin', 'Manager']),
  rewardRequestController.getRewardRequests
);

// Ruta para actualizar el estado de una solicitud
router.patch(
  '/:id',
  authenticate,
  authorize(['Admin', 'Manager']),
  checkTenant('RewardRequest', 'id'),
  rewardRequestController.updateRewardRequestStatus
);

module.exports = router;

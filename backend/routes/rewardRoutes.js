const express = require('express');
const rewardController = require('../controllers/rewardController');
const {
  authenticate,
  authorize,
  checkTenant,
  checkSubscription,
} = require('../middleware/auth');

const router = express.Router();

// Rutas accesibles por Admin, Manager y Employee (con diferentes lógicas en el controlador)
// Permitir ver catálogo si está activa o pendiente
router.get(
  '/',
  authenticate,
  authorize(['Admin', 'Manager', 'Employee']),
  checkSubscription({ allowPending: true }),
  rewardController.getRewardsByCompany
);

// Rutas para crear, obtener una específica, actualizar, cambiar estado (Admin o Manager)
// Bloquear acciones de modificación si no está activa
router.post(
  '/',
  authenticate,
  authorize(['Admin', 'Manager']),
  checkSubscription(),
  rewardController.createReward
);

router.get(
  '/:rewardId',
  authenticate,
  authorize(['Admin', 'Manager']), // Empleados no acceden a detalles por ID directo
  checkSubscription({ allowPending: true }),
  rewardController.getRewardById
);

router.put(
  '/:rewardId',
  authenticate,
  authorize(['Admin', 'Manager']),
  checkSubscription(),
  checkTenant('Reward', 'rewardId'),
  rewardController.updateReward
);

router.patch(
  '/:rewardId/toggle-status',
  authenticate,
  authorize(['Admin', 'Manager']),
  checkSubscription(),
  checkTenant('Reward', 'rewardId'),
  rewardController.toggleRewardStatus
);

// Ruta para que un empleado vote por una recompensa (like/dislike)
// Permitir votar si está activa o pendiente
router.post(
  '/:rewardId/vote',
  authenticate,
  authorize(['Employee']),
  checkSubscription({ allowPending: true }),
  rewardController.voteReward
);

module.exports = router;

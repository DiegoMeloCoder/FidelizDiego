const express = require('express');
const rewardController = require('../controllers/rewardController');
const { authenticate, authorize, checkTenant, checkSubscription } = require('../middleware/auth'); 

const router = express.Router();

// Rutas accesibles por Admin, Manager y Employee (con diferentes lógicas en el controlador)
// Permitir ver catálogo si está activa o pendiente
router.get('/', 
  authenticate, 
  authorize(['Admin', 'Manager', 'Employee']), 
  checkSubscription({ allowPending: true }), // Permitir acceso limitado
  rewardController.getRewardsByCompany
);

// Rutas para crear, obtener una específica, actualizar, cambiar estado (Admin o Manager)
// Bloquear acciones de modificación si no está activa
router.post('/', 
  authenticate, 
  authorize(['Admin', 'Manager']), 
  checkSubscription(), // Bloquear si no está activa
  rewardController.createReward
);
// GET /:rewardId no necesita checkSubscription aquí, ya que es informativo y accesible por Manager/Admin
router.get('/:rewardId', 
  authenticate, 
  authorize(['Admin', 'Manager']), 
  checkSubscription({ allowPending: true }), // Permitir ver si está activa o pendiente
  rewardController.getRewardById
); 
router.put('/:rewardId', 
  authenticate, 
  authorize(['Admin', 'Manager']), 
  checkSubscription(), // Bloquear si no está activa
  rewardController.updateReward
); 
router.patch('/:rewardId/toggle-status', 
  authenticate, 
  authorize(['Admin', 'Manager']), 
  checkSubscription(), // Bloquear si no está activa
  rewardController.toggleRewardStatus
); 

// Ruta para que un empleado vote por una recompensa (like/dislike)
// Permitir votar si está activa o pendiente
router.post('/:rewardId/vote', 
  authenticate, 
  authorize(['Employee']), 
  checkSubscription({ allowPending: true }), // Permitir acceso limitado
  rewardController.voteReward
);

module.exports = router;

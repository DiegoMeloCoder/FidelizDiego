const express = require('express');
const rewardRequestController = require('../controllers/rewardRequestController');
const { authenticate, authorize, checkTenant } = require('../middleware/auth');

const router = express.Router();

// Ruta para que un empleado cree una nueva solicitud de recompensa
// Requiere autenticación y que el usuario sea un empleado con compañía asignada
router.post('/',
  authenticate,
  authorize(['Employee']), // authorize ya verifica que el rol sea Employee
  // checkTenant() no es necesario aquí, el controlador verifica companyId en req.dbUser
  rewardRequestController.createRewardRequest
);

// Ruta para listar solicitudes (Admin/Manager)
// El filtrado por compañía se maneja en el controlador basado en rol y query params
router.get('/',
  authenticate,
  authorize(['Admin', 'Manager']),
  rewardRequestController.getRewardRequests
);

// Ruta para actualizar el estado de una solicitud (Admin/Manager)
router.patch('/:id',
  authenticate,
  authorize(['Admin', 'Manager']),
  rewardRequestController.updateRewardRequestStatus
);


module.exports = router;

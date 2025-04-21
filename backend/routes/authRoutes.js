const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authorize, checkSubscription } = require('../middleware/auth'); // Importar middlewares

const router = express.Router();

// Ruta para obtener el perfil del usuario autenticado
// Se aplica authenticate, authorize (verifica user.isActive), y checkSubscription (verifica company.status)
router.get(
  '/me', 
  authenticate, 
  authorize(), 
  checkSubscription({ allowPending: true }), // Permitir si activa o pendiente
  authController.getMyProfile
);

// Aquí podrían ir otras rutas relacionadas con autenticación si fueran necesarias
// (ej. registro si no se usara solo Firebase, refrescar token si se usara JWT propio, etc.)

// Ruta para actualizar el perfil del usuario autenticado
// Requiere autenticación, que el usuario exista y compañía activa/pendiente
router.put(
  '/profile', 
  authenticate, 
  authorize(), 
  checkSubscription({ allowPending: true }), // Permitir si activa o pendiente
  authController.updateMyProfile
);


module.exports = router;

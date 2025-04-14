const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth'); // Importar middlewares

const router = express.Router();

// Ruta para obtener el perfil del usuario autenticado
// Se aplica primero authenticate, luego authorize (sin roles específicos, solo verifica que exista en DB y esté activo)
router.get('/me', authenticate, authorize(), authController.getMyProfile);

// Aquí podrían ir otras rutas relacionadas con autenticación si fueran necesarias
// (ej. registro si no se usara solo Firebase, refrescar token si se usara JWT propio, etc.)

module.exports = router;

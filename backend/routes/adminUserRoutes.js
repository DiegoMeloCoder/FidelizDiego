const express = require('express');
const adminUserController = require('../controllers/adminUserController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación y autorización (solo Manager) a todas las rutas de gestión de Admins
router.use(authenticate, authorize('Manager'));

// Rutas CRUD para Admins
router.get('/', adminUserController.getAllAdmins); // Puede filtrar por ?companyId=...
router.post('/', adminUserController.createAdmin);
router.put('/:adminId', adminUserController.updateAdmin); // adminId es el UID de Firebase
router.patch('/:adminId/toggle-status', adminUserController.toggleAdminStatus); // adminId es el UID de Firebase

module.exports = router;

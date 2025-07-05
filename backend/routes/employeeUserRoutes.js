const express = require('express');
const employeeUserController = require('../controllers/employeeUserController');
const {
  authenticate,
  authorize,
  checkSubscription,
  checkTenant,
} = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación, autorización (solo Admin) y verificación de suscripción
// Usar checkSubscription() sin opciones (allowPending: false por defecto) para bloquear si no está activa
// El middleware authorize ya adjunta req.dbUser con el companyId del Admin
router.use(authenticate, authorize('Admin'), checkSubscription());

// Rutas que operan sobre la colección (no necesitan checkTenant aquí)
router.get('/', employeeUserController.getAllEmployeesByCompany);
router.post('/', employeeUserController.createEmployee);
router.post('/bulk-upload', employeeUserController.bulkUploadEmployees); // Ruta para carga masiva

// Rutas que operan sobre un RECURSO ESPECÍFICO
// Aplicamos checkTenant para asegurar que el :employeeId pertenece a la compañía del Admin
router.get(
  '/:employeeId',
  checkTenant('User', 'employeeId'),
  employeeUserController.getEmployeeById
); // Ruta para obtener uno específico
router.put(
  '/:employeeId',
  checkTenant('User', 'employeeId'),
  employeeUserController.updateEmployee
); // employeeId es el UID de Firebase
router.patch(
  '/:employeeId/toggle-status',
  checkTenant('User', 'employeeId'),
  employeeUserController.toggleEmployeeStatus
); // employeeId es el UID de Firebase

module.exports = router;

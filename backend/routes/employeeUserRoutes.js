const express = require('express');
const employeeUserController = require('../controllers/employeeUserController');
const { authenticate, authorize } = require('../middleware/auth');
// Importar checkTenant si necesitamos verificar acceso a un empleado específico por ID
// const { checkTenant } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación y autorización (solo Admin) a todas las rutas de gestión de Employees
// El middleware authorize ya adjunta req.dbUser con el companyId del Admin
router.use(authenticate, authorize('Admin'));

// Rutas CRUD para Employees (operando dentro de la compañía del Admin)
router.get('/', employeeUserController.getAllEmployeesByCompany);
router.get('/:employeeId', employeeUserController.getEmployeeById); // Ruta para obtener uno específico
router.post('/', employeeUserController.createEmployee);
router.put('/:employeeId', employeeUserController.updateEmployee); // employeeId es el UID de Firebase
router.patch('/:employeeId/toggle-status', employeeUserController.toggleEmployeeStatus); // employeeId es el UID de Firebase

// Ruta para carga masiva
router.post('/bulk-upload', employeeUserController.bulkUploadEmployees);

module.exports = router;

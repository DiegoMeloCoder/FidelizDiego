const express = require('express');
const companyController = require('../controllers/companyController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación y autorización (solo Manager) a todas las rutas de compañías
router.use(authenticate, authorize('Manager'));

// Rutas CRUD para Compañías
router.get('/', companyController.getAllCompanies);
router.post('/', companyController.createCompany);
router.get('/:companyId', companyController.getCompanyById);
router.put('/:companyId', companyController.updateCompany);
router.patch('/:companyId/toggle-status', companyController.toggleCompanyStatus); // Usar PATCH para cambio de estado

module.exports = router;

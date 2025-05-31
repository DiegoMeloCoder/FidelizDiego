const companyService = require('../services/companyService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Listar todas las compañías.
 */
const getAllCompanies = catchAsync(async (req, res, next) => {
  const companies = await companyService.getAllCompaniesService();
  res.status(200).json({
    status: 'success',
    results: companies.length,
    data: {
      companies,
    },
  });
});

/**
 * Crear una nueva compañía.
 */
const createCompany = catchAsync(async (req, res, next) => {
  // Nota: Una validación más robusta de req.body debería hacerse en un middleware de validación.
  // Por ejemplo, usando Joi o express-validator.
  if (!req.body.nombre) {
    return next(
      new AppError('El nombre de la compañía es un campo requerido.', 400)
    );
  }

  const newCompany = await companyService.createCompanyService(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      company: newCompany,
    },
  });
});

/**
 * Obtener una compañía por ID.
 */
const getCompanyById = catchAsync(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await companyService.getCompanyByIdService(companyId);
  // La verificación de si la compañía existe ahora la hace el servicio.
  // Si no existe, el servicio lanzará un AppError(404) que será capturado por catchAsync.
  res.status(200).json({
    status: 'success',
    data: {
      company,
    },
  });
});

/**
 * Actualizar una compañía.
 */
const updateCompany = catchAsync(async (req, res, next) => {
  const { companyId } = req.params;

  // Nota: La validación de que al menos un campo está presente y que los campos son válidos
  // debería estar en un middleware de validación.
  if (Object.keys(req.body).length === 0) {
    return next(
      new AppError('Se requiere al menos un campo para actualizar.', 400)
    );
  }

  const updatedCompany = await companyService.updateCompanyService(
    companyId,
    req.body
  );
  res.status(200).json({
    status: 'success',
    data: {
      company: updatedCompany,
    },
  });
});

/**
 * Alternar el estado de una compañía (active/inactive).
 */
const toggleCompanyStatus = catchAsync(async (req, res, next) => {
  const { companyId } = req.params;
  const result = await companyService.toggleCompanyStatusService(companyId);

  res.status(200).json({
    status: 'success',
    message: result.message,
    data: {
      company: result.company,
    },
  });
});

module.exports = {
  getAllCompanies,
  createCompany,
  getCompanyById,
  updateCompany,
  toggleCompanyStatus,
};

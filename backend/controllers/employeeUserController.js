const employeeUserService = require('../services/employeeUserService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const createEmployee = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Email y contraseña son requeridos.', 400));
  }
  const newEmployeeProfile = await employeeUserService.createEmployeeService(
    req.dbUser.companyId,
    req.body
  );
  res.status(201).json({
    status: 'success',
    data: { user: newEmployeeProfile },
  });
});

const getAllEmployeesByCompany = catchAsync(async (req, res, next) => {
  const employees = await employeeUserService.getAllEmployeesByCompanyService(
    req.dbUser.companyId
  );
  res.status(200).json({
    status: 'success',
    results: employees.length,
    data: { employees },
  });
});

const getEmployeeById = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;
  const employee = await employeeUserService.getEmployeeByIdService(
    employeeId,
    req.dbUser.companyId
  );
  res.status(200).json({
    status: 'success',
    data: { employee },
  });
});

const updateEmployee = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;
  if (req.body.nombre === undefined && req.body.isActive === undefined) {
    return next(
      new AppError(
        'Se requiere al menos un campo (nombre o isActive) para actualizar.',
        400
      )
    );
  }
  const updatedEmployee = await employeeUserService.updateEmployeeService(
    employeeId,
    req.dbUser.companyId,
    req.body
  );
  res.status(200).json({
    status: 'success',
    data: { user: updatedEmployee },
  });
});

// Nota: toggleEmployeeStatus puede ser manejado por updateEmployee, o tener su propia ruta/controlador
const toggleEmployeeStatus = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;
  const employeeUser = await employeeUserService.getEmployeeByIdService(
    employeeId,
    req.dbUser.companyId
  );
  const newStatus = !employeeUser.isActive;
  const updatedEmployee = await employeeUserService.updateEmployeeService(
    employeeId,
    req.dbUser.companyId,
    { isActive: newStatus }
  );
  res.status(200).json({
    status: 'success',
    message: `Estado del empleado cambiado a ${newStatus ? 'activo' : 'inactivo'}`,
    data: { employee: updatedEmployee },
  });
});

const bulkUploadEmployees = catchAsync(async (req, res, next) => {
  const employeesToCreate = req.body;
  if (!Array.isArray(employeesToCreate) || employeesToCreate.length === 0) {
    return next(
      new AppError(
        'Se requiere un array de empleados no vacío en el cuerpo de la solicitud.',
        400
      )
    );
  }
  const results = await employeeUserService.bulkUploadEmployeesService(
    req.dbUser.companyId,
    employeesToCreate
  );
  res.status(200).json({
    status: results.errors.length > 0 ? 'partial_success' : 'success',
    data: results,
  });
});

module.exports = {
  createEmployee,
  getAllEmployeesByCompany,
  getEmployeeById,
  updateEmployee,
  toggleEmployeeStatus,
  bulkUploadEmployees,
};

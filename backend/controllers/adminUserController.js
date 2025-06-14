const adminUserService = require('../services/adminUserService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const createAdmin = catchAsync(async (req, res, next) => {
  const { email, password, companyId } = req.body;

  if (!email || !password || !companyId) {
    return next(
      new AppError('Email, contraseña y ID de compañía son requeridos.', 400)
    );
  }

  const newAdminProfile = await adminUserService.createAdminService(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newAdminProfile,
    },
  });
});

const getAllAdmins = catchAsync(async (req, res, next) => {
  const { companyId } = req.query;

  if (companyId && isNaN(parseInt(companyId, 10))) {
    return next(new AppError('El ID de compañía debe ser un número.', 400));
  }

  const admins = await adminUserService.getAllAdminsService(
    companyId ? parseInt(companyId, 10) : undefined
  );

  res.status(200).json({
    status: 'success',
    results: admins.length,
    data: {
      admins,
    },
  });
});

const updateAdmin = catchAsync(async (req, res, next) => {
  const { adminId } = req.params;
  const { nombre, isActive } = req.body;

  if (nombre === undefined && isActive === undefined) {
    return next(
      new AppError(
        'Se requiere al menos un campo (nombre o isActive) para actualizar.',
        400
      )
    );
  }

  const updatedAdmin = await adminUserService.updateAdminService(
    adminId,
    req.body
  );

  // Limpiamos la respuesta para no enviar datos innecesarios
  const userProfile = {
    id: updatedAdmin.id,
    email: updatedAdmin.email,
    nombre: updatedAdmin.nombre,
    role: updatedAdmin.role,
    companyId: updatedAdmin.companyId,
    isActive: updatedAdmin.isActive,
  };

  res.status(200).json({
    status: 'success',
    data: {
      user: userProfile,
    },
  });
});

const toggleAdminStatus = catchAsync(async (req, res, next) => {
  const { adminId } = req.params;
  const updatedAdmin = await adminUserService.toggleAdminStatusService(adminId);

  res.status(200).json({
    status: 'success',
    message: `Estado del administrador cambiado a ${updatedAdmin.isActive ? 'activo' : 'inactivo'}`,
    data: {
      admin: updatedAdmin,
    },
  });
});

module.exports = {
  createAdmin,
  getAllAdmins,
  updateAdmin,
  toggleAdminStatus,
};

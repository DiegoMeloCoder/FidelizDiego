const { Company, User, sequelize } = require('../models');
const AppError = require('../utils/AppError');

/**
 * Obtiene todas las compañías.
 * @returns {Promise<Company[]>}
 */
const getAllCompaniesService = async () => {
  // Nota: Considerar paginación y filtros en el futuro para listas largas.
  const companies = await Company.findAll({
    order: [['nombre', 'ASC']],
  });
  return companies;
};

/**
 * Crea una nueva compañía.
 * @param {object} companyData - Datos de la compañía a crear.
 * @returns {Promise<Company>}
 */
const createCompanyService = async (companyData) => {
  const {
    nombre,
    status,
    logoUrl,
    motto,
    primaryColor,
    secondaryColor,
    tertiaryColor,
  } = companyData;

  // La validación de 'nombre' requerido y formato de colores debería hacerse en un middleware de validación.
  // Aquí asumimos que los datos básicos ya están validados.
  try {
    const newCompany = await Company.create({
      nombre,
      status: status || 'active', // Valor por defecto si no se envía
      logoUrl: logoUrl || null,
      motto: motto || null,
      primaryColor: primaryColor || null,
      secondaryColor: secondaryColor || null,
      tertiaryColor: tertiaryColor || null,
    });
    return newCompany;
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new AppError('Ya existe una compañía con ese nombre.', 409);
    }
    // Para otros errores de base de datos, permitimos que se propaguen
    // y sean capturados como un error 500 genérico por catchAsync.
    throw error;
  }
};

/**
 * Obtiene una compañía por su ID.
 * @param {number} companyId - ID de la compañía.
 * @returns {Promise<Company>}
 */
const getCompanyByIdService = async (companyId) => {
  const company = await Company.findByPk(companyId, {
    // Opcional: incluir usuarios asociados (admins/employees)
    // include: [{ model: User, as: 'users', attributes: ['id', 'email', 'role', 'isActive'] }]
  });

  if (!company) {
    throw new AppError('Compañía no encontrada.', 404);
  }
  return company;
};

/**
 * Actualiza una compañía existente.
 * @param {number} companyId - ID de la compañía a actualizar.
 * @param {object} updateData - Datos para actualizar la compañía.
 * @returns {Promise<Company>}
 */
const updateCompanyService = async (companyId, updateData) => {
  // La validación de que al menos un campo es enviado debería hacerse en un middleware.
  const company = await getCompanyByIdService(companyId); // Reutilizamos para verificar existencia y obtener instancia

  const {
    nombre,
    status,
    logoUrl,
    motto,
    primaryColor,
    secondaryColor,
    tertiaryColor,
  } = updateData;

  // Actualizar solo los campos proporcionados
  if (nombre !== undefined) company.nombre = nombre;
  if (status !== undefined) company.status = status;
  if (logoUrl !== undefined) company.logoUrl = logoUrl;
  if (motto !== undefined) company.motto = motto;
  if (primaryColor !== undefined) company.primaryColor = primaryColor;
  if (secondaryColor !== undefined) company.secondaryColor = secondaryColor;
  if (tertiaryColor !== undefined) company.tertiaryColor = tertiaryColor;

  try {
    await company.save();
    return company;
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new AppError('Ya existe otra compañía con ese nombre.', 409);
    }
    throw error;
  }
};

/**
 * Alterna el estado de una compañía (active/inactive) y actualiza el estado de sus usuarios.
 * @param {number} companyId - ID de la compañía.
 * @returns {Promise<{message: string, company: Company}>}
 */
const toggleCompanyStatusService = async (companyId) => {
  const company = await getCompanyByIdService(companyId); // Reutilizamos para verificar existencia

  // Iniciar una transacción para asegurar la atomicidad
  const transaction = await sequelize.transaction();

  try {
    // Alternar estado de la compañía
    const newCompanyStatus =
      company.status === 'active' ? 'inactive' : 'active';
    company.status = newCompanyStatus;
    await company.save({ transaction });

    // Actualizar estado de los usuarios de la compañía (solo Admins y Employees)
    // Los Managers no se desactivan por esto.
    const newUsersStatus = newCompanyStatus === 'active'; // true si la compañía está activa, false si inactiva
    await User.update(
      { isActive: newUsersStatus },
      {
        where: {
          companyId: company.id,
          role: ['Admin', 'Employee'], // Solo afecta a Admin y Employee
        },
        transaction, // Asegurar que esta operación sea parte de la transacción
      }
    );

    // Si todo va bien, confirmar la transacción
    await transaction.commit();

    return {
      message: `Estado de la compañía cambiado a ${company.status}. Usuarios asociados actualizados.`,
      company,
    };
  } catch (error) {
    // Si algo falla, revertir la transacción
    await transaction.rollback();
    console.error(
      `Error al cambiar estado de compañía ${companyId} y usuarios:`,
      error
    );
    throw new AppError(
      'Error interno al cambiar el estado de la compañía y sus usuarios.',
      500
    );
  }
};

module.exports = {
  getAllCompaniesService,
  createCompanyService,
  getCompanyByIdService,
  updateCompanyService,
  toggleCompanyStatusService,
};

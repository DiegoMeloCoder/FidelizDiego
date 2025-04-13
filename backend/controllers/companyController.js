const { Company, User } = require('../models'); // Importar modelos

// Listar todas las compañías (solo para Manager)
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      order: [['nombre', 'ASC']],
      // Considerar paginación para listas largas
    });
    res.status(200).json(companies);
  } catch (error) {
    console.error('Error al listar compañías:', error);
    res.status(500).send({ message: 'Error interno al listar compañías.' });
  }
};

// Crear una nueva compañía (solo para Manager)
const createCompany = async (req, res) => {
  const { nombre, status } = req.body;

  if (!nombre) {
    return res.status(400).send({ message: 'El nombre de la compañía es requerido.' });
  }

  try {
    const newCompany = await Company.create({
      nombre,
      status: status || 'active', // Valor por defecto si no se envía
    });
    res.status(201).json(newCompany);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).send({ message: 'Ya existe una compañía con ese nombre.' });
    }
    console.error('Error al crear compañía:', error);
    res.status(500).send({ message: 'Error interno al crear la compañía.' });
  }
};

// Obtener una compañía por ID (solo para Manager)
const getCompanyById = async (req, res) => {
  const { companyId } = req.params;
  try {
    const company = await Company.findByPk(companyId, {
      // Opcional: incluir usuarios asociados (admins/employees)
      // include: [{ model: User, as: 'users', attributes: ['id', 'email', 'role', 'isActive'] }]
    });
    if (!company) {
      return res.status(404).send({ message: 'Compañía no encontrada.' });
    }
    res.status(200).json(company);
  } catch (error) {
    console.error(`Error al obtener compañía ${companyId}:`, error);
    res.status(500).send({ message: 'Error interno al obtener la compañía.' });
  }
};

// Actualizar una compañía (solo para Manager)
const updateCompany = async (req, res) => {
  const { companyId } = req.params;
  const { nombre, status } = req.body;

  try {
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).send({ message: 'Compañía no encontrada.' });
    }

    // Actualizar solo los campos proporcionados
    if (nombre !== undefined) company.nombre = nombre;
    if (status !== undefined) company.status = status;

    await company.save();
    res.status(200).json(company);

  } catch (error) {
     if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).send({ message: 'Ya existe otra compañía con ese nombre.' });
    }
    console.error(`Error al actualizar compañía ${companyId}:`, error);
    res.status(500).send({ message: 'Error interno al actualizar la compañía.' });
  }
};

// Desactivar/Activar una compañía (eliminación lógica) (solo para Manager)
const toggleCompanyStatus = async (req, res) => {
   const { companyId } = req.params;
   // Podríamos recibir el nuevo estado en el body o simplemente alternar
   // Aquí alternaremos basado en el estado actual

   try {
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).send({ message: 'Compañía no encontrada.' });
    }

    // Alternar estado entre 'active' e 'inactive'
    company.status = company.status === 'active' ? 'inactive' : 'active';
    await company.save();

    // Opcional: ¿Desactivar/Activar usuarios de la compañía también?
    // await User.update({ isActive: company.status === 'active' }, { where: { companyId: company.id } });

    res.status(200).json({ message: `Estado de la compañía cambiado a ${company.status}`, company });

   } catch (error) {
    console.error(`Error al cambiar estado de compañía ${companyId}:`, error);
    res.status(500).send({ message: 'Error interno al cambiar estado de la compañía.' });
  }
};


module.exports = {
  getAllCompanies,
  createCompany,
  getCompanyById,
  updateCompany,
  toggleCompanyStatus, // Usaremos esto en lugar de un DELETE físico
};

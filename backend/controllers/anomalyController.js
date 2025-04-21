const { Anomaly, Company, User } = require('../models'); // Import necessary models
const { Op } = require('sequelize');

// Get anomalies (Manager only) - Add filtering/pagination later
const getAnomalies = async (req, res) => {
  // Managers can see all anomalies. Add filtering by companyId if needed later.
  // Add pagination and filtering by status/date range for production readiness.
  const { status, companyId, startDate, endDate, limit = 25, offset = 0 } = req.query;

  const whereClause = {};
  if (status && ['New', 'Reviewed', 'Dismissed'].includes(status)) {
    whereClause.status = status;
  }
  if (companyId) { // Allow manager to filter by specific company
      whereClause.companyId = companyId;
  }
  if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // Include whole end day
      whereClause.timestamp = { [Op.gte]: start, [Op.lt]: end };
  } else if (startDate) {
      whereClause.timestamp = { [Op.gte]: new Date(startDate) };
  } else if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      whereClause.timestamp = { [Op.lt]: end };
  }


  try {
    const { count, rows } = await Anomaly.findAndCountAll({
      where: whereClause,
      include: [ // Include related data for context
          { model: Company, as: 'company', attributes: ['id', 'nombre'] },
          { model: User, as: 'employee', attributes: ['id', 'nombre', 'email'] },
          { model: User, as: 'admin', attributes: ['id', 'nombre', 'email'] },
      ],
      order: [['timestamp', 'DESC']], // Show newest first
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    res.status(200).json({
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Math.floor(offset / limit) + 1,
        anomalies: rows,
    });
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    res.status(500).send({ message: 'Error interno al obtener anomalías.' });
  }
};

// Update anomaly status (Manager only)
const updateAnomalyStatus = async (req, res) => {
  const { anomalyId } = req.params;
  const { status } = req.body;

  if (!status || !['Reviewed', 'Dismissed'].includes(status)) {
    return res.status(400).send({ message: 'Se requiere un estado válido (Reviewed o Dismissed).' });
  }

  try {
    const anomaly = await Anomaly.findByPk(anomalyId);
    if (!anomaly) {
      return res.status(404).send({ message: 'Anomalía no encontrada.' });
    }

    anomaly.status = status;
    await anomaly.save();

    res.status(200).json(anomaly);
  } catch (error) {
    console.error(`Error updating status for anomaly ${anomalyId}:`, error);
    res.status(500).send({ message: 'Error interno al actualizar estado de la anomalía.' });
  }
};

module.exports = {
  getAnomalies,
  updateAnomalyStatus,
};

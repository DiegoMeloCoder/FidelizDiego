const engagementService = require('../services/engagementService');

// Get engagement scores for a company (Admin or Manager)
const getEngagementScores = async (req, res) => {
  // Admins get scores for their own company
  // Managers could potentially get scores for any company if needed (add companyId query param?)
  // For now, assume Admin gets their company, Manager gets... maybe needs adjustment?
  // Let's assume for now it's primarily for the logged-in user's company context.
  const companyId = req.dbUser?.companyId;
  const userRole = req.dbUser?.role;

  // Require companyId for Admin, allow Manager (maybe they select company later?)
  if (!companyId && userRole !== 'Manager') {
      return res.status(403).send({ message: 'User must belong to a company.' });
  }

  // Allow overriding companyId for Manager via query param (optional)
  const targetCompanyId = (userRole === 'Manager' && req.query.companyId) ? req.query.companyId : companyId;

  if (!targetCompanyId) {
       return res.status(400).send({ message: 'Company ID is required.' });
  }


  // Optional: Allow overriding lookback period via query param
  const daysLookback = req.query.days ? parseInt(req.query.days) : 90;
  if (isNaN(daysLookback) || daysLookback <= 0) {
      return res.status(400).send({ message: 'Invalid lookback period specified.' });
  }

  try {
    const scores = await engagementService.calculateEngagementScores(targetCompanyId, daysLookback);
    res.status(200).json(scores);
  } catch (error) {
    console.error(`Error fetching engagement scores for company ${targetCompanyId}:`, error);
    res.status(500).send({ message: 'Error interno al calcular los scores de engagement.' });
  }
};

module.exports = {
  getEngagementScores,
};

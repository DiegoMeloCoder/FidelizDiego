const { User, PointAssignment, Redemption } = require('../models');
const { Op, Sequelize } = require('sequelize'); // Import Sequelize

/**
 * Calculates a simple engagement score for active employees of a company based on recent activity.
 * @param {string} companyId - The ID of the company.
 * @param {number} daysLookback - How many days back to check for activity (e.g., 90).
 * @returns {Promise<Array<object>>} - Array of objects { employeeId, employeeName, employeeEmail, engagementScore }
 */
const calculateEngagementScores = async (companyId, daysLookback = 90) => {
  console.log(`[Engagement Score] Calculating scores for company ${companyId}, lookback ${daysLookback} days.`);

  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - daysLookback);

  const dateFilter = { [Op.gte]: lookbackDate };

  try {
    // 1. Get all active employees of the company
    const employees = await User.findAll({
      where: {
        companyId: companyId,
        role: 'Employee',
        isActive: true,
      },
      attributes: ['id', 'nombre', 'email'],
      raw: true,
    });

    if (employees.length === 0) {
      return [];
    }

    const employeeIds = employees.map(e => e.id);

    // 2. Find employees who received points recently
    const earners = await PointAssignment.findAll({
      where: {
        empleadoId: { [Op.in]: employeeIds },
        fechaAsignacion: dateFilter,
        cantidad: { [Op.gt]: 0 } // Only positive assignments count for earning
      },
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('empleadoId')), 'employeeId']],
      raw: true,
    });
    const earnerIds = new Set(earners.map(e => e.employeeId));

    // 3. Find employees who redeemed points recently
    const redeemers = await Redemption.findAll({
      where: {
        empleadoId: { [Op.in]: employeeIds },
        fechaCanje: dateFilter,
      },
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('empleadoId')), 'employeeId']],
      raw: true,
    });
    const redeemerIds = new Set(redeemers.map(r => r.employeeId));

    // 4. Calculate score for each employee
    const results = employees.map(employee => {
      let score = 0;
      if (earnerIds.has(employee.id)) {
        score += 1; // Score for earning
      }
      if (redeemerIds.has(employee.id)) {
        score += 2; // Higher score for redeeming
      }

      return {
        employeeId: employee.id,
        employeeName: employee.nombre,
        employeeEmail: employee.email,
        engagementScore: score, // Max score is 3 in this simple model
      };
    });

    // Sort by score descending, then name ascending
    results.sort((a, b) => {
        if (b.engagementScore !== a.engagementScore) {
            return b.engagementScore - a.engagementScore;
        }
        return (a.employeeName || a.employeeEmail).localeCompare(b.employeeName || b.employeeEmail);
    });


    console.log(`[Engagement Score] Calculated scores for ${results.length} employees.`);
    return results;

  } catch (error) {
    console.error('[Engagement Score] Error calculating scores:', error);
    throw new Error('Failed to calculate engagement scores.');
  }
};

module.exports = {
  calculateEngagementScores,
};

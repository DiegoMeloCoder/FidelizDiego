const { PointAssignment, Redemption, User, Reward, Justification, Anomaly } = require('../models'); // Ensure Anomaly is imported
const { Op, Sequelize } = require('sequelize');

// --- Configuration ---
const LARGE_ASSIGNMENT_THRESHOLD = 500; // Points threshold for a single large assignment
const LARGE_REDEMPTION_THRESHOLD = 100; // Lowered threshold as requested
const HIGH_FREQUENCY_REDEMPTION_COUNT = 5; // Increased count threshold
const HIGH_FREQUENCY_REDEMPTION_THRESHOLD = 2000; // Kept total points threshold

/**
 * Checks for potential anomalies in point assignments and redemptions
 * within a given date range (typically the previous day).
 * @param {Date} startDate - The start date/time of the period to check.
 * @param {Date} endDate - The end date/time of the period to check.
 * @returns {Promise<void>} - Doesn't need to return anomalies anymore, just saves them.
 */
const checkAnomalies = async (startDate, endDate) => {
  console.log(`[Anomaly Check] Starting check for period >= ${startDate.toISOString()} and < ${endDate.toISOString()}`);
  const potentialAnomaliesData = []; // Store data before saving

  // Corrected date filter to be >= startDate and < endDate
  const dateFilter = {
    [Op.gte]: startDate,
    [Op.lt]: endDate,
   };

  try {
    // 1. Check for large single point assignments
    const largeAssignments = await PointAssignment.findAll({
      where: {
        cantidad: { [Op.gte]: LARGE_ASSIGNMENT_THRESHOLD },
        fechaAsignacion: dateFilter,
      },
      include: [
        { model: User, as: 'employee', attributes: ['id', 'nombre', 'email'] },
        { model: User, as: 'admin', attributes: ['id', 'nombre', 'email'] },
        { model: Justification, as: 'justification', attributes: ['textoJustificacion'] },
      ],
      order: [['cantidad', 'DESC']],
    });

    largeAssignments.forEach(assignment => {
      potentialAnomaliesData.push({
        type: 'Large Point Assignment',
        timestamp: assignment.fechaAsignacion,
        companyId: assignment.companyId,
        details: `Assigned ${assignment.cantidad} points to employee ${assignment.employee?.nombre || assignment.employeeId} (Justification: ${assignment.justification?.textoJustificacion || 'N/A'}) by admin ${assignment.admin?.nombre || assignment.adminId}.`,
        referenceId: assignment.id, // Use referenceId for the related record
        employeeId: assignment.employeeId,
        adminId: assignment.adminId,
        status: 'New', // Default status
      });
    });

    // 2. Check for large single point redemptions
    const largeRedemptions = await Redemption.findAll({
        where: {
            puntosCosto: { [Op.gte]: LARGE_REDEMPTION_THRESHOLD },
            fechaCanje: dateFilter,
        },
        include: [
            { model: User, as: 'employee', attributes: ['id', 'nombre', 'email'] },
            { model: Reward, as: 'reward', attributes: ['nombre'] },
        ],
        order: [['puntosCosto', 'DESC']],
    });

    largeRedemptions.forEach(redemption => {
        potentialAnomaliesData.push({
            type: 'Large Point Redemption',
            timestamp: redemption.fechaCanje,
            companyId: redemption.companyId,
            details: `Employee ${redemption.employee?.nombre || redemption.employeeId} redeemed ${redemption.puntosCosto} points for reward "${redemption.reward?.nombre || 'N/A'}".`,
            referenceId: redemption.id, // Use referenceId
            employeeId: redemption.employeeId,
            adminId: null, // Not applicable
            status: 'New',
        });
    });

    // 3. Check for high-frequency/high-value redemptions by user per day
    const frequentRedeemers = await Redemption.findAll({
        where: { fechaCanje: dateFilter },
        attributes: [
            'empleadoId',
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'redemptionCount'],
            [Sequelize.fn('SUM', Sequelize.col('puntosCosto')), 'totalPointsRedeemed'],
            // Get the companyId associated with these redemptions
            [Sequelize.fn('MAX', Sequelize.col('companyId')), 'companyId'], // Use MAX or MIN as aggregate
        ],
        group: ['empleadoId'],
        // Updated HAVING clause with new count threshold
        having: Sequelize.literal(`COUNT(id) >= ${HIGH_FREQUENCY_REDEMPTION_COUNT} OR SUM("puntosCosto") >= ${HIGH_FREQUENCY_REDEMPTION_THRESHOLD}`),
        raw: true, // Get plain results for aggregation
    });

    frequentRedeemers.forEach(redeemer => {
        potentialAnomaliesData.push({
            type: 'High Frequency/Value Redemption',
            timestamp: endDate, // Use end date as representative time for daily check
            companyId: redeemer.companyId, // Get companyId from the aggregation
            details: `Employee ${redeemer.empleadoId} made ${redeemer.redemptionCount} redemptions totaling ${redeemer.totalPointsRedeemed} points within the period.`,
            referenceId: null, // No single reference ID
            employeeId: redeemer.empleadoId,
            adminId: null,
            status: 'New',
        });
    });

    // --- Save detected anomalies to the database ---
    let savedCount = 0;
    if (potentialAnomaliesData.length > 0) {
        try {
            // Use bulkCreate for efficiency if saving many anomalies
            await Anomaly.bulkCreate(potentialAnomaliesData);
            savedCount = potentialAnomaliesData.length;
        } catch (dbError) {
             console.error(`[Anomaly Check] Failed to bulk save anomalies:`, dbError);
             // Fallback to individual saving if bulk fails (optional)
             // for (const anomalyData of potentialAnomaliesData) {
             //     try { await Anomaly.create(anomalyData); savedCount++; } catch (e) { console.error('Failed individual save:', e); }
             // }
        }
    }

    // TODO: Add more checks (e.g., statistical deviation, unusual times - might need more complex logic/libs)

    console.log(`[Anomaly Check] Completed. Found ${potentialAnomaliesData.length} potential anomalies, saved ${savedCount}.`);
    return potentialAnomaliesData; // Return the array of anomalies found (even if empty)

  } catch (error) {
    console.error('[Anomaly Check] Error during anomaly detection:', error);
    return []; // Return empty array on error to prevent TypeError in caller
  }
};

module.exports = {
  checkAnomalies,
};

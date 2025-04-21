const reportService = require('../services/reportService');
const { Company } = require('../models'); // Needed to potentially get company name

/**
 * Handles the request to generate an AI-powered report.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const generateReport = async (req, res, next) => {
  console.log('[Report Controller] --- generateReport START ---'); 
  try {
    // 1. Extract parameters (companyId from user, date range from body/query)
    // Corrected: Use req.dbUser which is populated by the authorize middleware
    const companyId = req.dbUser?.companyId;
    const { startDate, endDate } = req.body; // Or req.query, decide on API design

    console.log(`[Report Controller] User ID: ${req.dbUser?.id}, Company ID from dbUser: ${companyId}`); // Add detailed log

    if (!companyId) {
      return res.status(403).json({ message: 'User does not belong to a company.' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required.' });
    }

    // Validate date format if necessary
    console.log(`[Report Controller] Dates: Start=${startDate}, End=${endDate}`);

    // 2. Fetch aggregated data using the service
    console.log('[Report Controller] Calling reportService.getAggregatedReportData...');
    const aggregatedData = await reportService.getAggregatedReportData(
      companyId,
      new Date(startDate),
      new Date(endDate)
    );
    console.log('[Report Controller] Aggregated data received from service.');
    // console.log('[Report Controller] Aggregated Data:', JSON.stringify(aggregatedData, null, 2)); // Log data (optional, can be large)


    // 3. Generate the report summary using the AI service
    console.log('[Report Controller] Calling reportService.generateReportWithAI...');
    const reportSummary = await reportService.generateReportWithAI(aggregatedData);
    console.log('[Report Controller] Report summary received from AI service.');

    // 4. Return the summary and potentially the raw aggregated data
    console.log('[Report Controller] Sending response...');
    res.status(200).json({
      summary: reportSummary,
      data: aggregatedData, // Include raw data for frontend charts
      startDate,
      endDate,
    });
    console.log('[Report Controller] --- generateReport END ---');
  } catch (error) {
    console.error('[Report Controller] --- generateReport ERROR ---:', error);
    next(error); // Pass error to the global error handler
  }
};

module.exports = {
  generateReport,
};

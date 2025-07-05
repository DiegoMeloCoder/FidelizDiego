const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, authorize, checkSubscription } = require('../middleware/auth'); 

const router = express.Router();

// POST /api/v1/reports/generate - Generate AI Report (Admin with active subscription)
router.post(
  '/generate',
  authenticate,       // Ensure user is logged in
  authorize(['Admin']), // Ensure user has the 'Admin' role
  checkSubscription({ allowPending: true }),  // Allow pending subscriptions for report generation
  reportController.generateReport
);

module.exports = router;

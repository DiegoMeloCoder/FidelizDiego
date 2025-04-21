const express = require('express');
const engagementController = require('../controllers/engagementController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and authorize Admin OR Manager
router.use(authenticate, authorize(['Admin', 'Manager']));

// GET /api/v1/engagement/scores - Fetch engagement scores for a company
// Admin gets their own company. Manager can optionally specify companyId via query param.
router.get('/scores', engagementController.getEngagementScores);

module.exports = router;

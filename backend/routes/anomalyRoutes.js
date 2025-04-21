const express = require('express');
const anomalyController = require('../controllers/anomalyController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and Manager authorization to all routes in this file
router.use(authenticate, authorize(['Manager']));

// GET /api/v1/anomalies - Fetch anomalies (with optional query params for filtering/pagination)
router.get('/', anomalyController.getAnomalies);

// PATCH /api/v1/anomalies/:anomalyId/status - Update anomaly status
router.patch('/:anomalyId/status', anomalyController.updateAnomalyStatus);

module.exports = router;

const express = require('express');
const historyController = require('../controllers/historyController');
const {
  authenticate,
  authorize,
  checkSubscription,
} = require('../middleware/auth');

const router = express.Router();

// --- Sub-Router para Admin ---
const adminRouter = express.Router();
adminRouter.use(
  authenticate,
  authorize('Admin'),
  checkSubscription({ allowPending: true })
);
adminRouter.get('/points', historyController.getPointAssignmentHistory);
adminRouter.get('/redemptions', historyController.getRedemptionHistoryAdmin);
// Montamos el sub-router
router.use('/admin', adminRouter);

// --- Sub-Router para Employee ---
const employeeRouter = express.Router();
employeeRouter.use(
  authenticate,
  authorize('Employee'),
  checkSubscription({ allowPending: true })
);
employeeRouter.get('/points', historyController.getMyPointHistory);
employeeRouter.get('/redemptions', historyController.getMyRedemptionHistory);
// Montamos el sub-router
router.use('/employee', employeeRouter);

// --- Rutas con Múltiples Roles o Roles Únicos ---
router.get(
  '/ranking',
  authenticate,
  authorize(['Admin', 'Employee']),
  checkSubscription({ allowPending: true }),
  historyController.getRanking
);
router.get(
  '/manager/redemptions/global',
  authenticate,
  authorize('Manager'),
  historyController.getManagerGlobalRedemptionHistory
);

module.exports = router;

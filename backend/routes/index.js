const express = require('express');
const router = express.Router();

// Importar todos los manejadores de rutas
const authRoutes = require('./authRoutes');
const companyRoutes = require('./companyRoutes');
const adminUserRoutes = require('./adminUserRoutes');
const employeeUserRoutes = require('./employeeUserRoutes');
const rewardRoutes = require('./rewardRoutes');
const rewardRequestRoutes = require('./rewardRequestRoutes');
const justificationRoutes = require('./justificationRoutes');
const pointRoutes = require('./pointRoutes');
const redemptionRoutes = require('./redemptionRoutes');
const historyRoutes = require('./historyRoutes');
const statsRoutes = require('./statsRoutes');
const uploadRoutes = require('./uploadRoutes');
const reportRoutes = require('./reportRoutes');
const anomalyRoutes = require('./anomalyRoutes');
const engagementRoutes = require('./engagementRoutes');

// Montar todas las rutas modulares
// Por qué: Cada módulo gestiona sus propias sub-rutas (ej. /auth/login, /auth/me)
router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/admins', adminUserRoutes);
router.use('/employees', employeeUserRoutes);

// Nota: Mantenemos este orden por ahora, pero la recomendación de rediseñar esta ruta para evitar ambigüedad sigue vigente.
router.use('/rewards/requests', rewardRequestRoutes);
router.use('/rewards', rewardRoutes);

router.use('/justifications', justificationRoutes);
router.use('/points', pointRoutes);
router.use('/redemptions', redemptionRoutes);
router.use('/history', historyRoutes);
router.use('/stats', statsRoutes);
router.use('/uploads', uploadRoutes);
router.use('/reports', reportRoutes);
router.use('/anomalies', anomalyRoutes);
router.use('/engagement', engagementRoutes);

// TODO: Añadir aquí futuras rutas (ej. /ranking)
module.exports = router;

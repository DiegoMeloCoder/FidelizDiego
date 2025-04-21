const path = require('path');
// Load environment variables from root .env file for the running application
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('[Server Start] Root .env loaded for server.');

const express = require('express');
const cors = require('cors');
const cron = require('node-cron'); // Import node-cron
const anomalyDetectionService = require('./services/anomalyDetectionService'); // Import the service

const app = express();
const PORT = process.env.PORT || 5000; // Puerto para el backend

// Middleware

// Configuración CORS
const corsOptions = {
  // Usar la variable de entorno para el origen permitido en producción/staging
  // Permitir todos los orígenes en desarrollo si CORS_ORIGIN no está definido
  origin: process.env.CORS_ORIGIN || '*', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Permite cookies/headers de autorización
  optionsSuccessStatus: 204 // Para navegadores antiguos
};
console.log(`[CORS] Configured origin: ${corsOptions.origin}`); // Log para depuración
app.use(cors(corsOptions)); 

app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Backend de Fideliz funcionando!');
});

// Importar Rutas
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const employeeUserRoutes = require('./routes/employeeUserRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const justificationRoutes = require('./routes/justificationRoutes');
const pointRoutes = require('./routes/pointRoutes');
const redemptionRoutes = require('./routes/redemptionRoutes');
const historyRoutes = require('./routes/historyRoutes');
const statsRoutes = require('./routes/statsRoutes'); // Importar rutas de estadísticas
const uploadRoutes = require('./routes/uploadRoutes'); // Importar rutas de carga
const reportRoutes = require('./routes/reportRoutes'); // Importar rutas de reportes
const anomalyRoutes = require('./routes/anomalyRoutes'); // Importar rutas de anomalías
const engagementRoutes = require('./routes/engagementRoutes'); // Importar rutas de engagement
const rewardRequestRoutes = require('./routes/rewardRequestRoutes'); // Importar rutas de solicitud de recompensas
// TODO: Importar otras rutas (ranking, etc.)

// Usar Rutas
const API_PREFIX = '/api/v1'; // Prefijo para todas las rutas API v1

app.use(`${API_PREFIX}/auth`, authRoutes); // Rutas de autenticación (ej. /api/v1/auth/me)
app.use(`${API_PREFIX}/companies`, companyRoutes); // Rutas de compañías (solo Manager)
app.use(`${API_PREFIX}/admins`, adminUserRoutes); // Rutas para gestionar Admins (solo Manager)
app.use(`${API_PREFIX}/employees`, employeeUserRoutes); // Rutas para gestionar Employees (solo Admin)
// Registrar rutas de solicitudes ANTES que las rutas generales de recompensas
app.use(`${API_PREFIX}/rewards/requests`, rewardRequestRoutes); // Rutas para solicitud de recompensas (Employee)
app.use(`${API_PREFIX}/rewards`, rewardRoutes); // Rutas para gestionar Rewards (Admin y Employee)
app.use(`${API_PREFIX}/justifications`, justificationRoutes); // Rutas para gestionar Justificaciones (solo Admin)
app.use(`${API_PREFIX}/points`, pointRoutes); // Rutas para asignar puntos (solo Admin)
app.use(`${API_PREFIX}/redemptions`, redemptionRoutes); // Rutas para canjear recompensas (solo Employee)
app.use(`${API_PREFIX}/history`, historyRoutes); // Rutas para historiales (Admin/Employee)
app.use(`${API_PREFIX}/stats`, statsRoutes); // Rutas para estadísticas
app.use(`${API_PREFIX}/uploads`, uploadRoutes); // Rutas para carga de archivos
app.use(`${API_PREFIX}/reports`, reportRoutes); // Rutas para reportes (Admin)
app.use(`${API_PREFIX}/anomalies`, anomalyRoutes); // Rutas para anomalías (Manager)
app.use(`${API_PREFIX}/engagement`, engagementRoutes); // Rutas para engagement scores (Admin/Manager)
// La ruta de requests ya se registró arriba
// TODO: Usar otras rutas (ranking)
// ...etc

// Manejo de errores básico (opcional, se puede mejorar)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);

  // --- REMOVED TEMPORARY DB Sync ---

  // --- Schedule Anomaly Detection Job ---
  // Run daily at 2:00 AM server time ('0 2 * * *')
  // See https://crontab.guru/ for cron syntax help
  cron.schedule('0 2 * * *', async () => {
    console.log('[Cron Job] Running daily anomaly detection check...'); // Reverted log
    // --- Reverted to check PREVIOUS day ---
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0); // Start of yesterday

    const checkEndTime = new Date(yesterday);
    checkEndTime.setDate(yesterday.getDate() + 1); // Start of today (exclusive end)
    // --- End Reversion ---

    try {
      // Pass the original start and end times (yesterday to start of today)
      const anomalies = await anomalyDetectionService.checkAnomalies(yesterday, checkEndTime);
      if (anomalies.length > 0) {
        console.warn('[Cron Job - Anomaly Detection] Potential anomalies found:', JSON.stringify(anomalies, null, 2));
        // TODO: Implement alerting mechanism (e.g., email admin, log to separate file/service, save to DB)
      } else {
        console.log('[Cron Job - Anomaly Detection] No anomalies detected.');
      }
    } catch (error) {
      console.error('[Cron Job - Anomaly Detection] Error executing check:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/Bogota" // Optional: Specify timezone if server time differs from desired run time zone
  });

  console.log('[Cron Job] Anomaly detection job scheduled to run daily at 2:00 AM.'); // Reverted log message

});

module.exports = app; // Exportar para posibles pruebas

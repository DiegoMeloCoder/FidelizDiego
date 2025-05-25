const path = require('path');
// Load environment variables from root .env file for the running application
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('[Server Start] Root .env loaded for server.');

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const anomalyDetectionService = require('./services/anomalyDetectionService');
const apiRoutes = require('./routes/index'); // <-- 1. IMPORTACIÓN CENTRALIZADA
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000; // Puerto para el backend

// --- MIDDLEWARE ---

// Configuración de CORS más segura
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : []; // URL de frontend
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:5173'); // O el puerto de tu frontend
}
const corsOptions = {
  origin: (origin, callback) => {
    // Permite solicitudes sin 'origin' (como las de Postman o apps móviles) o si el origen está en la lista blanca
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(
        new AppError(`El origen ${origin} no está permitido por CORS.`, 403)
      );
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Permite cookies/headers de autorización
  optionsSuccessStatus: 204, // Para navegadores antiguos
};
console.log(`[CORS] Configured for origins: ${allowedOrigins.join(', ')}`);
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' })); // Para parsear JSON, con límite de payload
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Para parsear form-data

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Backend de Fideliz funcionando!');
});

// --- RUTAS ---
const API_PREFIX = '/api/v1';
app.use(API_PREFIX, apiRoutes); // <-- 2. USO DEL ENRUTADOR PRINCIPAL

// Manejo de rutas no encontradas (404)
// Se activa para cualquier ruta que no haya sido manejada por el enrutador anterior.
app.all('/*splat', (req, res, next) => {
  next(
    new AppError(
      `No se puede encontrar la ruta ${req.originalUrl} en este servidor.`,
      404
    )
  );
});

// --- MANEJO DE ERRORES GLOBAL ---
app.use(globalErrorHandler); // <-- 3. USO DEL NUEVO MANEJADOR DE ERRORES

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
  console.log(`Entorno actual: ${process.env.NODE_ENV || 'development'}`);

  // --- TAREAS PROGRAMADAS (CRON JOBS) ---
  cron.schedule(
    '0 2 * * *',
    async () => {
      console.log('[Cron Job] Ejecutando verificación diaria de anomalías...');

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const checkEndTime = new Date(yesterday);
      checkEndTime.setDate(yesterday.getDate() + 1);

      try {
        const anomalies = await anomalyDetectionService.checkAnomalies(
          yesterday,
          checkEndTime
        );
        if (anomalies.length > 0) {
          console.warn(
            '[Cron Job] Se encontraron posibles anomalías:',
            JSON.stringify(anomalies, null, 2)
          );
          // TODO: Implementar mecanismo de alerta (ej. email, guardar en BD).
        } else {
          console.log('[Cron Job] No se detectaron anomalías.');
        }
      } catch (error) {
        console.error(
          '[Cron Job] Error ejecutando la verificación de anomalías:',
          error
        );
      }
    },
    {
      scheduled: true,
      timezone: 'America/Bogota',
    }
  );
  console.log(
    '[Cron Job] Tarea de detección de anomalías programada para las 2:00 AM (America/Bogota).'
  );
});

module.exports = app; // Exportar para posibles pruebas

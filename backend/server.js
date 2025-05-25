const path = require('path');
// Load environment variables from root .env file for the running application
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('[Server Start] Root .env loaded for server.');

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/index'); // IMPORTACIÓN CENTRALIZADA
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorHandler');
const { scheduleAnomalyDetection } = require('./jobs/anomalyDetector'); // IMPORTAR EL SCHEDULER

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
app.use((req, res, next) => {
  next(
    new AppError(
      `No se puede encontrar la ruta ${req.originalUrl} en este servidor.`,
      404
    )
  );
});

// --- MANEJO DE ERRORES GLOBAL ---
app.use(globalErrorHandler); // USO DEL NUEVO MANEJADOR DE ERRORES

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
  console.log(`Entorno actual: ${process.env.NODE_ENV || 'development'}`);

  // --- INICIAR TAREAS PROGRAMADAS ---
  scheduleAnomalyDetection(); // <-- 2. EJECUTAR LA FUNCIÓN
});

module.exports = app; // Exportar para posibles pruebas

const path = require('path'); // Necesitamos path para resolver la ruta
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Especificar ruta al .env de la raíz
console.log('[Server Start] DB_PASSWORD from .env:', process.env.DB_PASSWORD ? 'Loaded (length: ' + process.env.DB_PASSWORD.length + ')' : 'NOT LOADED or empty'); // Log para verificar carga
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000; // Puerto para el backend

// Middleware
app.use(cors()); // Habilitar CORS para permitir peticiones desde el frontend
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
// TODO: Importar otras rutas (ranking, etc.)

// Usar Rutas
const API_PREFIX = '/api/v1'; // Prefijo para todas las rutas API v1

app.use(`${API_PREFIX}/auth`, authRoutes); // Rutas de autenticación (ej. /api/v1/auth/me)
app.use(`${API_PREFIX}/companies`, companyRoutes); // Rutas de compañías (solo Manager)
app.use(`${API_PREFIX}/admins`, adminUserRoutes); // Rutas para gestionar Admins (solo Manager)
app.use(`${API_PREFIX}/employees`, employeeUserRoutes); // Rutas para gestionar Employees (solo Admin)
app.use(`${API_PREFIX}/rewards`, rewardRoutes); // Rutas para gestionar Rewards (Admin y Employee)
app.use(`${API_PREFIX}/justifications`, justificationRoutes); // Rutas para gestionar Justificaciones (solo Admin)
app.use(`${API_PREFIX}/points`, pointRoutes); // Rutas para asignar puntos (solo Admin)
app.use(`${API_PREFIX}/redemptions`, redemptionRoutes); // Rutas para canjear recompensas (solo Employee)
app.use(`${API_PREFIX}/history`, historyRoutes); // Rutas para historiales (Admin/Employee)
app.use(`${API_PREFIX}/stats`, statsRoutes); // Rutas para estadísticas
// TODO: Usar otras rutas (ranking)
// ...etc

// Manejo de errores básico (opcional, se puede mejorar)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});

module.exports = app; // Exportar para posibles pruebas

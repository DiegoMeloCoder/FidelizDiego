const path = require('path'); // Need path for resolving
// Load .env from root specifically for sequelize-cli usage
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
console.log('[Database Config] Root .env loaded for CLI.');

// dotenv ya se carga en server.js, no es necesario aquí.

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '', // Revert to simpler fallback, dotenv should load it now
    database: process.env.DB_NAME || 'fideliz_dev',
    // Usar 'postgres' como host por defecto si DB_HOST no está definido,
    // ya que es el nombre del servicio en docker-compose.yml.
    // Si corres el backend fuera de Docker (con npm run dev), usará 127.0.0.1 por defecto.
    // Si necesitas conectarte a otro host, define DB_HOST en tu .env
    host: process.env.DB_HOST || '127.0.0.1', // Revertido a 127.0.0.1 por defecto
    dialect: 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10), // Asegura que el puerto sea un número entero
  },
  test: {
    username: process.env.DB_USER_TEST || 'postgres',
    password: process.env.DB_PASSWORD_TEST || '', // Cambiado a string vacío por defecto
    database: process.env.DB_NAME_TEST || 'fideliz_test',
    host: process.env.DB_HOST_TEST || '127.0.0.1',
    dialect: 'postgres',
    port: parseInt(process.env.DB_PORT_TEST || '5432', 10),
  },
  production: {
    username: process.env.DB_USER_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST_PROD,
    dialect: 'postgres',
    port: parseInt(process.env.DB_PORT_PROD || '5432', 10),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Ajustar según la configuración SSL requerida
      },
    },
    // Considerar añadir configuración de pool para producción
    // pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  },
};

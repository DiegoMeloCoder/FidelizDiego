const admin = require('firebase-admin');
const path = require('path');

// Cargar dotenv para asegurarnos de que GOOGLE_APPLICATION_CREDENTIALS esté disponible desde el .env de la raíz
// Hacemos esto aquí también por si este módulo se carga antes que server.js en algún flujo
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


// Necesitas descargar el archivo JSON de la clave de cuenta de servicio
// desde tu consola de Firebase:
// Proyecto -> Configuración del proyecto -> Cuentas de servicio -> Generar nueva clave privada
// Guarda ese archivo JSON de forma segura (NO lo subas a Git)
// Priorizar la variable que contiene el JSON completo (ideal para PaaS como Render)
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
// Variable con la ruta al archivo (útil para desarrollo local)
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let initialized = false;

if (serviceAccountJson) {
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Opcional: Especifica el databaseURL si usas Realtime Database
      // databaseURL: "https://<TU_PROYECTO>.firebaseio.com"
    });
    console.log('[Firebase Admin] SDK inicializado correctamente usando JSON desde variable de entorno.');
    initialized = true;
  } catch (error) {
    console.error('[Firebase Admin] Error inicializando SDK desde FIREBASE_SERVICE_ACCOUNT_JSON:', error);
    console.error('[Firebase Admin] Verifica que el contenido de la variable sea un JSON válido.');
    // No salimos aquí, intentaremos con la ruta del archivo como fallback
  }
}

// Si no se inicializó con el JSON, intentar con la ruta del archivo
if (!initialized && serviceAccountPath) {
  try {
    // Resolver la ruta del archivo JSON relativa a la raíz del proyecto
    const absolutePath = path.resolve(__dirname, '../../', serviceAccountPath);
    console.log(`[Firebase Admin] Intentando inicializar con credenciales desde archivo: ${absolutePath}`);

    admin.initializeApp({
      credential: admin.credential.cert(absolutePath),
      // Opcional: Especifica el databaseURL si usas Realtime Database
      // databaseURL: "https://<TU_PROYECTO>.firebaseio.com"
    });
    console.log('[Firebase Admin] SDK inicializado correctamente usando archivo de credenciales desde ruta.');
    initialized = true;
  } catch (error) {
    console.error('[Firebase Admin] Error inicializando SDK desde GOOGLE_APPLICATION_CREDENTIALS:', error);
    console.error(`[Firebase Admin] Verifica que la ruta '${serviceAccountPath}' sea correcta y el archivo JSON sea válido.`);
    // Considera salir de la aplicación si Firebase Admin es esencial y ambos métodos fallaron
    // process.exit(1);
  }
}

// Si después de ambos intentos no se inicializó, mostrar error final
if (!initialized) {
  console.error('Error Crítico: No se pudo inicializar Firebase Admin SDK.');
  console.error('Asegúrate de definir FIREBASE_SERVICE_ACCOUNT_JSON (con el contenido JSON) o GOOGLE_APPLICATION_CREDENTIALS (con la ruta al archivo) en tus variables de entorno.');
  // Considera salir si es esencial
  // process.exit(1);
}

module.exports = admin;

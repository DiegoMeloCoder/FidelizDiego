const admin = require('firebase-admin');
const path = require('path');

// Cargar dotenv para asegurarnos de que GOOGLE_APPLICATION_CREDENTIALS esté disponible desde el .env de la raíz
// Hacemos esto aquí también por si este módulo se carga antes que server.js en algún flujo
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


// Necesitas descargar el archivo JSON de la clave de cuenta de servicio
// desde tu consola de Firebase:
// Proyecto -> Configuración del proyecto -> Cuentas de servicio -> Generar nueva clave privada
// Guarda ese archivo JSON de forma segura (NO lo subas a Git)
// y define la ruta en la variable de entorno GOOGLE_APPLICATION_CREDENTIALS en tu archivo .env

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath) {
  console.error('Error: La variable de entorno GOOGLE_APPLICATION_CREDENTIALS no está definida.');
  console.error('Asegúrate de que esté en tu archivo .env en la raíz del proyecto y apunte al archivo JSON de credenciales de Firebase.');
  // Considera salir si es esencial
  // process.exit(1);
} else {
  try {
    // Resolver la ruta del archivo JSON relativa a la raíz del proyecto
    const absolutePath = path.resolve(__dirname, '../../', serviceAccountPath);
    console.log(`[Firebase Admin] Intentando inicializar con credenciales desde: ${absolutePath}`);

    admin.initializeApp({
      credential: admin.credential.cert(absolutePath),
      // Opcional: Especifica el databaseURL si usas Realtime Database
      // databaseURL: "https://<TU_PROYECTO>.firebaseio.com"
    });
    console.log('[Firebase Admin] SDK inicializado correctamente usando archivo de credenciales.');
  } catch (error) {
    console.error('[Firebase Admin] Error inicializando SDK:', error);
    console.error(`[Firebase Admin] Verifica que la ruta '${serviceAccountPath}' en GOOGLE_APPLICATION_CREDENTIALS sea correcta y el archivo JSON sea válido.`);
    // Considera salir de la aplicación si Firebase Admin es esencial
    // process.exit(1);
  } // <--- Llave de cierre del catch añadida aquí
}

module.exports = admin;

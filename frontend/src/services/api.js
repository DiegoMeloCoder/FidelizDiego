import axios from "axios";
import { auth } from "../firebase/config"; // Importar la instancia de auth de Firebase

// La URL base de la API se obtiene desde las variables de entorno de Vite.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- INTERCEPTORES ---

// 1. Interceptor de Solicitud: Añade el token de autenticación a cada solicitud.
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken(); // Obtiene el token JWT de Firebase.
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Error al obtener el token ID de Firebase:", error);
        // Si no podemos obtener un token, la solicitud no debe continuar.
        // Rechazamos la promesa para detener la solicitud antes de que se envíe sin autorización.
        return Promise.reject(error);
      }
    }
    return config;
  },
  (error) => {
    // Maneja errores que ocurren al configurar la solicitud.
    return Promise.reject(error);
  }
);

// 2. Interceptor de Respuesta: Centraliza el manejo de errores de la API.
apiClient.interceptors.response.use(
  // Si la respuesta es exitosa (status 2xx), simplemente la devuelve.
  (response) => response,

  // Si la respuesta es un error (status no es 2xx), lo procesa aquí.
  (error) => {
    // El trabajo de este interceptor es NORMALIZAR el error, no ejecutar lógica de negocio (como redirecciones).
    // La decisión de qué hacer con un error 401 (ej. desloguear) le corresponde a la capa que consume la API (como AuthContext).

    if (error.response) {
      // El servidor respondió con un error (404, 401, 500, etc.).
      const { status, data } = error.response;
      console.error(`Error de API. Status: ${status}`, data);
      // Rechazamos la promesa con un objeto de error estructurado y limpio.
      return Promise.reject({
        status,
        message: data?.message || error.message, // Usa el mensaje del backend si está disponible.
        data,
      });
    }

    if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta (ej. servidor caído, sin red).
      console.error("No se recibió respuesta del servidor:", error.request);
      return Promise.reject({
        status: null, // No hay status si no hay respuesta.
        message:
          "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.",
      });
    }

    // Ocurrió un error en la configuración de la solicitud de Axios.
    return Promise.reject(error);
  }
);

// --- FUNCIONES REUTILIZABLES ---

/**
 * REFACTORIZACIÓN: Función genérica para subir un archivo de imagen.
 * @param {File} file - El objeto de archivo a subir.
 * @param {string} endpoint - El endpoint específico de la API para la subida (ej. '/uploads/images/rewards').
 * @param {string} fieldName - El nombre del campo que espera el backend (multer) (ej. 'rewardImage').
 * @returns {Promise<object>} La data de la respuesta (ej. { imageUrl: '...' }).
 */
const uploadImage = async (file, endpoint, fieldName = "image") => {
  if (!file) {
    throw new Error("No se proporcionó ningún archivo para subir.");
  }

  const formData = new FormData();
  formData.append(fieldName, file);

  try {
    const response = await apiClient.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.imageUrl;
  } catch (error) {
    // Re-lanzamos el error que ya fue procesado y normalizado por nuestro interceptor.
    // De esta forma, el componente que llama a esta función recibe un objeto de error consistente.
    console.error(`Error al subir imagen al endpoint ${endpoint}:`, error);
    throw error;
  }
};

// Ahora exportamos funciones específicas que usan la genérica. Esto es limpio y DRY.
export const uploadRewardImage = (file) =>
  uploadImage(file, "/uploads/images/rewards", "rewardImage");
export const uploadCompanyLogo = (file) =>
  uploadImage(file, "/uploads/images/logos", "companyLogo");
export const uploadGlobalRewardImage = (file) =>
  uploadImage(file, "/uploads/images/rewards/global", "rewardImage");

export default apiClient;

import axios from 'axios';
import { auth } from '../firebase/config'; // Importar la instancia de auth de Firebase

// Obtener la URL base de la API desde las variables de entorno de Vite
// Asegúrate de tener VITE_API_BASE_URL definida en tu archivo .env (o .env.development) en la raíz de /frontend
// Ejemplo: VITE_API_BASE_URL=http://localhost:5000/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'; // Fallback por si no está definida

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a cada solicitud
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser; // Obtener el usuario actual de Firebase Auth
    if (user) {
      try {
        const token = await user.getIdToken(); // Obtener el token ID actual
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token añadido a la cabecera Authorization');
      } catch (error) {
        console.error('Error al obtener el token ID de Firebase:', error);
        // Podrías manejar el error aquí, por ejemplo, redirigiendo al login
        // o cancelando la solicitud. Por ahora, solo lo logueamos.
        // return Promise.reject(error); // Descomentar si quieres cancelar la solicitud en caso de error de token
      }
    } else {
      console.warn('No hay usuario logueado, solicitud sin token.');
      // Eliminar cabecera si no hay usuario (para rutas públicas si las hubiera)
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    // Manejar errores de la configuración de la solicitud
    console.error('Error en interceptor de solicitud Axios:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta (opcional pero recomendado)
apiClient.interceptors.response.use(
  (response) => {
    // Cualquier código de estado que este dentro del rango de 2xx causa la ejecución de esta función
    return response;
  },
  (error) => {
    // Cualquier código de estado fuera del rango de 2xx causa la ejecución de esta función
    console.error('Error en la respuesta de la API:', error.response || error.message);

    if (error.response) {
      // La solicitud se hizo y el servidor respondió con un código de estado
      // que cae fuera del rango de 2xx
      const { status, data } = error.response;
      console.error(`Status: ${status}, Data:`, data);

      // Manejar errores específicos como 401 (No autorizado) o 403 (Prohibido)
      if (status === 401) {
        // Podría ser token inválido o expirado.
        // Considerar desloguear al usuario o intentar refrescar el token si tuvieras esa lógica.
        console.error('Error 401: No autorizado. Redirigir a login o manejar deslogueo.');
        // Ejemplo: window.location.href = '/login'; (si no usas React Router para esto)
      } else if (status === 403) {
        // Permisos insuficientes
        console.error('Error 403: Acceso prohibido.');
      }
      // Podrías devolver un objeto de error más estructurado si lo prefieres
      return Promise.reject({ status, message: data?.message || error.message, data });

    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
      return Promise.reject({ message: 'No se pudo conectar con el servidor.' });
    } else {
      // Algo sucedió al configurar la solicitud que provocó un error
      console.error('Error al configurar la solicitud Axios:', error.message);
    }

    return Promise.reject(error);
  }
);

// Function to upload reward image
export const uploadRewardImage = async (file) => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const formData = new FormData();
  // Ensure the key matches the one expected by multer middleware on the backend (.single('rewardImage'))
  formData.append('rewardImage', file);

  try {
    // Make the POST request to the upload endpoint
    // Important: Set Content-Type to multipart/form-data for file uploads
    // The Authorization header will be added automatically by the interceptor
    const response = await apiClient.post('/uploads/images/rewards', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Return the image URL from the response
    return response.data.imageUrl;
  } catch (error) {
    console.error('Error uploading reward image:', error);
    // Re-throw a more specific error message if possible
    // Use the error object structure returned by the interceptor if available
    throw new Error(error.message || 'Failed to upload image.');
  }
};

// Function to upload company logo
export const uploadCompanyLogo = async (file) => {
  if (!file) {
    throw new Error('No file provided for logo upload.');
  }

  const formData = new FormData();
  // Ensure the key matches the one expected by multer middleware on the backend (.single('companyLogo'))
  formData.append('companyLogo', file);

  try {
    // Make the POST request to the logo upload endpoint
    const response = await apiClient.post('/uploads/images/logos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Return the image URL from the response
    return response.data.imageUrl;
  } catch (error) {
    console.error('Error uploading company logo:', error);
    throw new Error(error.message || 'Failed to upload logo.');
  }
};


export default apiClient;

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

/**
 * Componente para proteger rutas basadas en el estado de autenticación y rol del usuario.
 * @param {object} props
 * @param {string[]} [props.allowedRoles] - Array de roles permitidos para acceder. Si no se provee, solo verifica autenticación.
 * @param {React.ReactNode} [props.children] - Componente hijo a renderizar (alternativa a <Outlet />).
 */
function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, userData, loading } = useAuth();

  // --- 1. Estado de Carga ---
  // Mientras el AuthContext está determinando el estado del usuario, mostramos un loader.
  // Esto es crucial para evitar redirecciones incorrectas antes de tener el estado final.
  if (loading) {
    // Aquí podrías renderizar un componente Spinner global para una mejor UX.
    return <div>Cargando...</div>;
  }

  // --- 2. Verificación de Autenticación COMPLETA ---
  // Un usuario está completamente autenticado solo si:
  // a) Existe un 'currentUser' (logueado en Firebase).
  // b) Existe un 'userData' (su perfil fue cargado exitosamente desde nuestro backend).
  // Si alguna de las dos falta, lo consideramos no logueado en nuestra plataforma.
  if (!currentUser || !userData) {
    console.log(
      "ProtectedRoute: No hay currentUser o userData. Redirigiendo a /login."
    );
    return <Navigate to="/login" replace />;
  }

  // --- 3. Verificación de Rol (Autorización) ---
  // Esta lógica solo se ejecuta si estamos seguros de que 'userData' no es null.
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userData.role)) {
      // El usuario está logueado pero no tiene el rol correcto para esta ruta.
      console.log(userData.data.user.role)
      console.warn(
        `Acceso denegado para el rol '${
          userData.role
        }'. Se requiere uno de: ${allowedRoles.join(", ")}`
      );
      // Lo ideal a futuro es redirigir a una página de "No Autorizado".
      // Por ahora, redirigir a /login es una opción segura.
      return <Navigate to="/login" replace />;
    }
  }

  // --- 4. Acceso Concedido ---
  // Si todas las verificaciones anteriores pasaron, el usuario puede acceder al contenido.
  return children ? children : <Outlet />;
}

export default ProtectedRoute;

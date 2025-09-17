import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Obtener el estado de autenticación del contexto
  const { currentUser, loading: authLoading } = useAuth();

  // useEffect para manejar la redirección si el usuario ya está logueado
  useEffect(() => {
    // Solo actuar después de que el AuthContext haya verificado la sesión
    if (!authLoading && currentUser) {
      // Si hay un usuario, no debería estar aquí. Redirigir.
      navigate("/post-login-redirect", { replace: true });
    }
  }, [currentUser, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El useEffect de arriba se encargará de la redirección cuando currentUser cambie
    } catch (err) {
      console.error("Firebase Login Error:", err);
      switch (err.code) {
        case "auth/invalid-email":
          setError("Formato de correo inválido.");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Correo o contraseña incorrectos.");
          break;
        default:
          setError("No se pudo iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
    authLoading,
  };
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/post-login-redirect");
    } catch (err) {
      console.error("Error de inicio de sesión en Firebase:", err);
      switch (err.code) {
        case "auth/invalid-email":
          setError("El formato del correo electrónico es inválido.");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("El correo o la contraseña son incorrectos.");
          break;
        default:
          setError("No se pudo iniciar sesión. Por favor, inténtalo de nuevo.");
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
  };
}

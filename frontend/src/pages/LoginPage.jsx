import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext.jsx";
import Button from "../components/ui/Button"; // Import Button
import Input from "../components/ui/Input"; // Import Input
import fidelizTextLogo from "../assets/logos/TEXTOFIDELIZ.png"; // Corrected import path
import loginVisual from "../assets/logos/login-visual.png"; // Corrected relative path

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const { currentUser } = useAuth(); // No longer needed directly here for redirect

  const handleSubmit = async (e) => {
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
      // Navigate to the intermediate redirect route instead of root
      navigate("/post-login-redirect");
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

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Column - Visual (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-landing-primary items-center justify-center p-12 relative overflow-hidden">
        {/* Refined background elements */}
        <div className="absolute -bottom-1/4 -left-1/4 w-3/4 h-3/4 bg-landing-accent/20 rounded-full opacity-60 blur-2xl"></div>
        <div className="absolute -top-1/3 -right-1/3 w-full h-full bg-landing-primary-light/10 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute top-10 left-10 w-1/2 h-1/2 bg-white/5 rounded-full opacity-30 blur-lg"></div>
        
        <img 
          src={loginVisual} 
          alt="Fideliz Platform Visual" 
          className="max-w-lg w-full object-contain relative z-10" // Slightly increased max-w
        />
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block">
              <img
                className="h-10 w-auto" // Slightly larger logo
                src={fidelizTextLogo}
                alt="Logo de Fideliz"
              />
            </Link>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl space-y-6"> {/* More padding, larger radius, stronger shadow */}
            <h1 className="text-3xl font-bold text-center text-gray-900"> {/* Larger title */}
              Iniciar Sesión
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="mt-1"
                />
              </div>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>} {/* Centered error */}
              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  variant="landing"
                  className="w-full justify-center py-3 text-base" // Larger padding and text
                  size="lg" 
                >
                  {loading ? "Ingresando..." : "Ingresar"}
                </Button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <Link to="/">
                <Button
                  type="button"
                  variant="landing-outline"
                  className="w-full justify-center py-3 text-base" // Larger padding and text
                >
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

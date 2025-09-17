import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import fidelizTextLogo from "../../assets/logos/TEXTOFIDELIZ.png";

/**
 * Componente de UI para el formulario de inicio de sesión.
 * Recibe todo el estado y los manejadores como props.
 */
export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  onSubmit,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-block">
          <img
            className="h-10 w-auto"
            src={fidelizTextLogo}
            alt="Logo de Fideliz"
          />
        </Link>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-900">
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
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div>
            <Button
              type="submit"
              disabled={loading}
              variant="landing"
              className="w-full justify-center py-3 text-base"
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
              className="w-full justify-center py-3 text-base"
            >
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

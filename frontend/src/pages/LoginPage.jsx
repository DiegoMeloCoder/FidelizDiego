import { useLogin } from "../hooks/useLogin";
import { LoginForm } from "../components/auth/LoginForm";
import loginVisual from "../assets/logos/login-visual.png";

function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
  } = useLogin();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden lg:flex lg:w-1/2 bg-landing-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -bottom-1/4 -left-1/4 w-3/4 h-3/4 bg-landing-accent/20 rounded-full opacity-60 blur-2xl"></div>
        <div className="absolute -top-1/3 -right-1/3 w-full h-full bg-landing-primary-light/10 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute top-10 left-10 w-1/2 h-1/2 bg-white/5 rounded-full opacity-30 blur-lg"></div>
        <img
          src={loginVisual}
          alt="Visual de la plataforma Fideliz"
          className="max-w-lg w-full object-contain relative z-10"
        />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8">
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          error={error}
          loading={loading}
          onSubmit={handleLogin}
        />
      </div>
    </div>
  );
}

export default LoginPage;

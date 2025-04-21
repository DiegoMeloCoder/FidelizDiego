import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/ui/Button'; // Import Button
import Input from '../components/ui/Input';   // Import Input
import fidelizTextLogo from '../assets/logos/TEXTOFIDELIZ.png'; // Corrected import path


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const { currentUser } = useAuth(); // No longer needed directly here for redirect

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigate to the intermediate redirect route instead of root
      navigate('/post-login-redirect');
    } catch (err) {
      console.error("Firebase Login Error:", err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Invalid email format.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password.');
          break;
        default:
          setError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Use a light gray background consistent with landing page sections
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
       {/* Logo */}
       <div className="mb-8">
         <Link to="/">
            {/* Use img tag with imported logo */}
            <img className="h-10 w-auto mx-auto" src={fidelizTextLogo} alt="Fideliz Logo" />
         </Link>
       </div>

      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl"> {/* Increased shadow */}
        <h1 className="text-2xl font-bold text-center text-gray-900">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            {/* Use Input component */}
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1" // Keep margin if needed
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            {/* Use Input component */}
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="mt-1" // Keep margin if needed
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            {/* Use Button component with landing variant */}
            <Button
              type="submit"
              disabled={loading}
              variant="landing" // Use the new landing variant
              className="w-full justify-center"
              size="lg" // Make button slightly larger
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </div>
        </form>
         {/* Back to Home Button */}
         <div className="mt-6 text-center">
            <Link to="/">
              <Button
                type="button"
                variant="landing-outline" // Use outline variant
                className="w-full justify-center"
              >
                Volver al Inicio
              </Button>
            </Link>
          </div>
      </div>
    </div>
  );
}

export default LoginPage;

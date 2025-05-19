import { useState } from 'react'; // Import useState
import { Link } from 'react-router-dom';
import fidelizTextLogo from '../../assets/logos/TEXTOFIDELIZ.png'; // Import text logo
import fidelizLogo from '../../assets/logos/LOGOFIDELIZ.png'; // Import text logo

// Placeholder for Menu icon (e.g., Heroicons)
const MenuIcon = () => (
  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

// Placeholder for Close icon (e.g., Heroicons)
const CloseIcon = () => (
  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const meetingPath = '/agendar-reunion'; // Updated to internal path
  const demoPath = '/demo'; // Updated to internal path

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className='flex items-center gap-1'>
              <img className="w-8 h-auto self-center" src={fidelizLogo} alt="Fideliz Logo" />
              <img className="h-6 w-auto" src={fidelizTextLogo} alt="Fideliz Logo" /> {/* Increased height further */}
            </Link>
          </div>

          {/* Navigation Links (Optional - can add #links later) */}
          <div className="hidden md:flex space-x-8">
            {/* Example: <a href="#features" className="text-gray-600 hover:text-landing-primary px-3 py-2 rounded-md text-sm font-medium">Características</a> */}
          </div>

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-600 hover:text-landing-primary px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              Ingresar
            </Link>
            <Link
              to={meetingPath} // Changed from <a> to <Link>
              className="bg-landing-primary text-white hover:bg-landing-primary-dark px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              Agendar Reunión
            </Link>
            <Link
              to={demoPath}
              className="text-landing-primary border border-landing-primary hover:bg-landing-primary hover:text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              Ver Demo
            </Link>
          </div>

           {/* Mobile menu button */}
           <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-landing-primary"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {/* Mobile Navigation Links Here (if any) */}
          {/* Example: <a href="#features" className="text-gray-600 hover:bg-gray-50 hover:text-landing-primary block px-3 py-2 rounded-md text-base font-medium">Características</a> */}
        </div>
        {/* Mobile Action Buttons */}
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="px-5 space-y-3">
             <Link
              to={demoPath}
              className="block w-full text-center text-landing-primary border border-landing-primary hover:bg-landing-primary hover:text-white px-4 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out"
            >
              Ver Demo
            </Link>
            <Link
              to={meetingPath} // Changed from <a> to <Link>
              className="block w-full text-center bg-landing-primary text-white hover:bg-landing-primary-dark px-4 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out"
            >
              Agendar Reunión
            </Link>
             <Link
              to="/login"
              className="block w-full text-center text-gray-600 hover:bg-gray-50 hover:text-landing-primary px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default LandingNavbar;

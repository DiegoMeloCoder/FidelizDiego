import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import fidelizTextLogo from '../../assets/logos/TEXTOFIDELIZ.png'; // Import text logo

// Placeholder for social media icons
const SocialIcon = ({ platform }) => (
  <a href="#" className="text-gray-400 hover:text-gray-500">
    <span className="sr-only">{platform}</span>
    {/* Replace with actual SVG icons later */}
    <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
      {platform.substring(0, 1)}
    </div>
  </a>
);

function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:flex-row md:items-center md:space-x-4 md:order-1"> {/* Adjusted layout */}
             <img className="h-6 w-auto mb-2 md:mb-0" src={fidelizTextLogo} alt="Fideliz Logo" /> {/* Use img tag, smaller */}
             <p className="text-center text-base text-gray-400"> {/* Removed mt-1 */}
                &copy; {currentYear} Fideliz. Todos los derechos reservados.
             </p>
          </div>

          {/* Links and Social */}
          <div className="mt-8 md:mt-0 md:order-2 flex flex-wrap justify-center items-center gap-x-6 gap-y-4"> {/* Added flex-wrap and gap-y for better wrapping */}
             <Link to="/politica-de-privacidad" className="text-base text-gray-500 hover:text-gray-900">
                Política de Privacidad
             </Link>
             <Link to="/terminos-y-condiciones" className="text-base text-gray-500 hover:text-gray-900">
                Términos y Condiciones
             </Link>
             {/* Add Social Icons */}
             <div className="flex space-x-4">
                <SocialIcon platform="Facebook" />
                <SocialIcon platform="Instagram" />
                <SocialIcon platform="LinkedIn" />
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;

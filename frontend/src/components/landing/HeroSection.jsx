
import React from 'react';
import { Link } from 'react-router-dom';

// Placeholder for the main visual element (image or illustration)
const HeroVisual = () => (
  <div className="bg-gradient-to-br from-landing-primary-light to-landing-primary rounded-lg shadow-lg w-full h-64 md:h-80 flex items-center justify-center text-white text-2xl">
    [Hero Visual Placeholder]
  </div>
);

function HeroSection() {
  // Placeholder URL for Calendly or contact form
  const meetingUrl = '#'; // Replace with actual URL later
  // Placeholder URL/path for Demo page/modal
  const demoPath = '/#'; // Replace with actual path or logic later

  return (
    // Added subtle gradient background, adjusted padding
    <section className="bg-gradient-to-b from-white to-green-50 py-16 sm:py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid layout for larger screens, stacks on smaller screens */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center"> {/* Increased gap */}
          {/* Text Content */}
          {/* Order changed for mobile: Text appears first */}
          <div className="lg:col-span-6 text-center lg:text-left">
             {/* Adjusted text sizes for responsiveness */}
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-5xl lg:text-6xl">
              <span className="block xl:inline">[AI] Fideliza a tu Equipo,</span>{' '}
              <span className="block text-landing-primary xl:inline">Impulsa tu Empresa</span>
            </h1>
             {/* Adjusted text sizes and margins */}
            <p className="mt-4 text-lg text-gray-500 sm:mt-5 sm:text-xl md:mt-6 lg:mx-0">
              [AI] Reduce la rotación y aumenta la motivación con Fideliz. Conecta a tus empleados con beneficios exclusivos y recompensas internas, todo gestionado fácilmente con IA.
            </p>
            {/* Call to Action Buttons - Adjusted spacing and layout for mobile */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3 sm:gap-4">
              <div className="rounded-md shadow w-full sm:w-auto">
                <a
                  href={meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  // Adjusted padding and text size for buttons
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-landing-primary hover:bg-landing-primary-dark md:text-lg transition duration-150 ease-in-out"
                >
                  Agendar Reunión
                </a>
              </div>
              <div className="rounded-md shadow w-full sm:w-auto">
                <Link
                  to={demoPath}
                  // Adjusted padding and text size for buttons
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-landing-primary bg-white hover:bg-gray-50 md:text-lg transition duration-150 ease-in-out"
                >
                  Ver Demo
                </Link>
              </div>
            </div>
          </div>

          {/* Visual Element - Order changed for mobile: Visual appears second */}
          {/* Adjusted margin top for spacing */}
          <div className="mt-10 lg:mt-0 lg:col-span-6">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

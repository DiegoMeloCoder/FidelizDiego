
import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../../assets/logos/landinghombre.png'; // Import the image

function HeroSection() {
  const meetingPath = '/agendar-reunion'; // Updated to internal path
  const demoPath = '/demo'; // Updated to internal path

  return (
    // Added subtle gradient background, adjusted padding, and animation class
    // TODO: Implement true scroll-reveal with Intersection Observer for better performance and UX
    <section className="bg-gradient-to-b from-white to-green-50 py-16 sm:py-20 md:py-24 animate-fadeInUp">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid layout for larger screens, stacks on smaller screens */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center"> {/* Increased gap from 12 to 16 */}
          {/* Text Content */}
          {/* Order changed for mobile: Text appears first */}
          <div className="lg:col-span-6 text-center lg:text-left">
             {/* Adjusted text sizes for responsiveness */}
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-5xl lg:text-6xl">
              <span className="block xl:inline">Fideliza a tu Equipo,</span>{' '}
              <span className="block text-landing-primary xl:inline">Impulsa tu Empresa</span>
            </h1>
             {/* Adjusted text sizes and margins */}
            <p className="mt-4 text-xl text-gray-600 sm:text-2xl md:mt-6 lg:mx-0 leading-relaxed"> {/* Increased size, changed color, added leading-relaxed */}
              Reduce la rotación y aumenta la motivación con Fideliz. Conecta a tus empleados con beneficios exclusivos y recompensas internas, todo gestionado fácilmente con IA.
            </p>
            {/* Call to Action Buttons - Adjusted spacing and layout for mobile */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3 sm:gap-4">
              <div className="rounded-md shadow w-full sm:w-auto">
                <Link
                  to={meetingPath} // Changed from <a> to <Link>
                  // Adjusted padding and text size for buttons
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-landing-primary hover:bg-landing-primary-dark md:text-lg transition duration-150 ease-in-out"
                >
                  Agendar Reunión
                </Link>
              </div>
              <div className="rounded-md shadow w-full sm:w-auto">
                <Link
                  to={demoPath} // Path already correct, just ensuring consistency
                  // Adjusted padding and text size for buttons
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-landing-primary bg-white hover:bg-gray-50 md:text-lg transition duration-150 ease-in-out"
                >
                  Ver Demo
                </Link>
              </div>
            </div>
          </div>

          {/* Visual Element - Order changed for mobile: Visual appears second */}
          {/* Adjusted margin top for spacing and image styling */}
          <div className="mt-10 lg:mt-0 lg:col-span-6 flex justify-center lg:justify-end">
            <img 
              src={heroImage} 
              alt="Persona interactuando con la plataforma Fideliz" 
              className="object-contain w-full max-w-md lg:max-w-full h-auto" // Removed rounded-lg shadow-xl, changed object-cover to object-contain
              style={{ maxHeight: '500px' }} // Optional: constrain height
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

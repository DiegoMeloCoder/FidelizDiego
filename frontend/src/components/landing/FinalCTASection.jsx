import React from 'react';
import { Link } from 'react-router-dom';

function FinalCTASection() {
  const meetingPath = '/agendar-reunion'; // Updated to internal path
  const demoPath = '/demo'; // Updated to internal path

  return (
    // Added animation and delay
    // TODO: Implement true scroll-reveal with Intersection Observer for better performance and UX
    <section className="bg-landing-primary animate-fadeInUp" style={{ animationDelay: '1.0s' }}>
       {/* Adjusted padding */}
      <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
         {/* Adjusted text sizes */}
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
          <span className="block">¿Listo para transformar la fidelización en tu empresa?</span> {/* Removed [AI] prefix */}
        </h2>
         {/* Adjusted text size and color - Use white for high contrast */}
        <p className="mt-4 text-xl text-white sm:text-2xl leading-relaxed"> {/* Increased size, ensured leading-relaxed */}
          Descubre cómo Fideliz puede ayudarte a reducir la rotación, aumentar la motivación y construir un equipo más comprometido. {/* Removed [AI] prefix */}
        </p>
         {/* Adjusted button layout for mobile */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <div className="inline-flex rounded-md shadow w-full sm:w-auto">
            <Link
              to={meetingPath} // Changed from <a> to <Link>
              // Ensure button takes full width on mobile
              className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-landing-primary bg-white hover:bg-gray-100 transition duration-150 ease-in-out"
            >
              Agendar Reunión
            </Link>
          </div>
          <div className="inline-flex rounded-md shadow w-full sm:w-auto">
            <Link
              to={demoPath} // Path already correct, just ensuring consistency
              // Ensure button takes full width on mobile
              className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-landing-primary-dark hover:bg-black/75 transition duration-150 ease-in-out" // Example using dark variant for contrast
            >
              Ver Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTASection;

import React from 'react';
import { Link } from 'react-router-dom';

function FinalCTASection() {
  // Placeholder URL for Calendly or contact form
  const meetingUrl = '#'; // Replace with actual URL later
  // Placeholder URL/path for Demo page/modal
  const demoPath = '/#'; // Replace with actual path or logic later

  return (
    <section className="bg-landing-primary">
       {/* Adjusted padding */}
      <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
         {/* Adjusted text sizes */}
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
          <span className="block">[AI] ¿Listo para transformar la fidelización en tu empresa?</span>
        </h2>
         {/* Adjusted text size and color - Use white for high contrast */}
        <p className="mt-4 text-lg leading-6 text-white"> {/* Changed text color to white */}
          [AI] Descubre cómo Fideliz puede ayudarte a reducir la rotación, aumentar la motivación y construir un equipo más comprometido.
        </p>
         {/* Adjusted button layout for mobile */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <div className="inline-flex rounded-md shadow w-full sm:w-auto">
             <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              // Ensure button takes full width on mobile
              className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-landing-primary bg-white hover:bg-gray-50 transition duration-150 ease-in-out"
            >
              Agendar Reunión
            </a>
          </div>
          <div className="inline-flex rounded-md shadow w-full sm:w-auto">
            <Link
              to={demoPath}
              // Ensure button takes full width on mobile
              className="w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-landing-primary-dark hover:bg-opacity-75 transition duration-150 ease-in-out" // Example using dark variant for contrast
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

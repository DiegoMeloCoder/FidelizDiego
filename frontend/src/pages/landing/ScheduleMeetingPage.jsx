import React, { useEffect } from 'react'; // Import useEffect
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingFooter from '../../components/landing/LandingFooter';
import manager1 from '../../assets/logos/manager1.png';
import manager2 from '../../assets/logos/manager2.png'; // Assuming manger2.png is manager2.png
import manager3 from '../../assets/logos/manager3.png';

const CreatorProfile = ({ imgSrc, name, title }) => (
  <div className="flex flex-col items-center text-center mb-6">
    <img src={imgSrc} alt={name} className="w-24 h-24 rounded-full object-cover mb-2 shadow-md" />
    <h3 className="font-semibold text-gray-800">{name}</h3>
    <p className="text-sm text-gray-600">{title}</p>
  </div>
);

function ScheduleMeetingPage() {
  const calendlyUrl = "https://calendly.com/dlxstudios29";
  const creators = [
    { name: "Creador 1", title: "Co-fundador", imgSrc: manager1 },
    { name: "Creador 2", title: "Co-fundador", imgSrc: manager2 },
    { name: "Creador 3", title: "Co-fundador", imgSrc: manager3 },
  ];

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      // Note: Calendly's widget might have its own cleanup or might not need this.
      // If issues arise, check Calendly docs for specific cleanup instructions.
      const existingScript = document.querySelector(`script[src="${script.src}"]`);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      // Calendly might also add other elements or styles that need cleanup.
      // For example, it might create iframes or divs outside the target div.
      // This basic cleanup only removes the script itself.
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            {/* Left Sidebar */}
            <aside className="lg:col-span-4 xl:col-span-3 mb-10 lg:mb-0">
              <div className="bg-white p-6 rounded-lg shadow-lg sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center lg:text-left">
                  Agenda con nuestro equipo
                </h2>
                {creators.map(creator => (
                  <CreatorProfile key={creator.name} {...creator} />
                ))}
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Selecciona un horario disponible con cualquiera de nuestros especialistas.
                </p>
              </div>
            </aside>

            {/* Right Content - Calendly Embed */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-landing-primary mb-2 text-center">
                  Selecciona Fecha y Hora para tu Reunión
                </h1>
                <p className="text-gray-600 mb-6 text-center">
                  Utiliza el calendario a continuación para encontrar un horario que te convenga.
                </p>
                {/* Calendly inline widget - updated to use Calendly's recommended embed */}
                <div 
                  className="calendly-inline-widget w-full" 
                  data-url="https://calendly.com/dlxstudios29?background_color=f9faf7&primary_color=69c702" // Updated with new colors
                  style={{ minWidth: '320px', height: '700px' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

export default ScheduleMeetingPage;

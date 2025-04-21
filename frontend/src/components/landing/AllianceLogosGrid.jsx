import React from 'react';

// Import the actual logo image (adjust path as needed)
import alkostoLogo from '../../assets/logos/alkosto.png'; // Example import
import coacrematLogo from '../../assets/logos/coacremat.png';
// Placeholder for a single logo (remains unchanged for logos without images)
const LogoPlaceholder = ({ name }) => (
  <div className="col-span-1 flex justify-center items-center py-8 px-8 bg-gray-100 rounded-lg">
    <div className="h-12 w-24 bg-gray-300 flex items-center justify-center text-gray-500 text-sm">
      {name}
    </div>
  </div>
);

function AllianceLogosGrid() {
  // Updated logos array with objects: name and src (image path or null)
  const logos = [
    { name: 'Alkosto', src: alkostoLogo }, // Use imported logo
    { name: 'Coacremat', src: coacrematLogo },      // Placeholder
    { name: 'Udenar', src: null },         // Placeholder
    { name: 'Empresa B', src: null },      // Placeholder
    { name: 'Empresa C', src: null },      // Placeholder
    { name: 'Empresa D', src: null },      // Placeholder
  ];

  return (
    // Adjusted padding
    <section className="bg-gray-50 py-16 sm:py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         {/* Adjusted text sizes and margins */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            Empresas que ya potencian sus equipos con Fideliz
          </h2>
          <p className="mt-4 text-lg text-gray-500 sm:text-xl">
            Únete a compañías líderes que confían en nuestra plataforma para mejorar la retención y motivación.
          </p>
        </div>

        {/* Marquee Container */}
        {/* Define keyframes and animation directly using arbitrary values */}
        {/* Note: Adjust duration (e.g., animate-[scroll_40s_linear_infinite]) to control speed */}
        <div className="mt-8 relative w-full overflow-hidden bg-gray-50 py-4
                       before:absolute before:left-0 before:top-0 before:z-[2] before:h-full before:w-[100px] before:bg-[linear-gradient(to_right,theme(colors.gray.50)_0%,rgba(249,250,251,0)_100%)] before:content-['']
                       after:absolute after:right-0 after:top-0 after:z-[2] after:h-full after:w-[100px] after:bg-[linear-gradient(to_left,theme(colors.gray.50)_0%,rgba(249,250,251,0)_100%)] after:content-['']">
          <div
            className="flex w-max animate-[scroll_30s_linear_infinite]" // Removed hover:[animation-play-state:paused]
            style={{
              // Define keyframes inline (Tailwind doesn't support @keyframes directly in arbitrary values yet)
              // We'll rely on the animate-[scroll...] utility which assumes @keyframes scroll exists
              // We need to add the @keyframes to the global CSS (e.g., index.css) or use a plugin.
              // For now, let's assume the keyframes will be added globally.
            }}
          >
            {/* Render logos twice for seamless loop */}
            {/* Render logos twice for seamless loop */}
            {[...logos, ...logos].map((logo, index) => (
              <div key={`${logo.name}-${index}`} className="flex-shrink-0 px-4 sm:px-6 flex items-center justify-center h-28"> {/* Ensure consistent height */}
                {logo.src ? (
                  // Render actual image if src exists
                  <img
                    src={logo.src}
                    alt={`${logo.name} logo`}
                    className="max-h-12 w-auto object-contain" // Adjust styling as needed
                  />
                ) : (
                  // Render placeholder if src is null
                  <LogoPlaceholder name={logo.name} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AllianceLogosGrid;

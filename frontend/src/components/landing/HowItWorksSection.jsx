import React from 'react';

// Placeholder for feature visual (icon, illustration, screenshot)
const FeatureVisual = ({ bgColor = 'bg-landing-primary-light' }) => (
  <div className={`rounded-lg shadow-md w-full h-48 sm:h-56 ${bgColor} flex items-center justify-center text-gray-600`}>
    [Feature Visual Placeholder]
  </div>
);

// Placeholder for a single feature item
// TODO: Extract to FeatureItem.jsx later if needed
const FeatureItem = ({ title, description, visualSide = 'left' }) => (
  // Stacks visual above text on mobile, uses grid for larger screens
  <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center"> {/* Increased gap */}
    {/* Visual - Order adjusted based on visualSide for large screens */}
    <div className={`mt-6 lg:mt-0 ${visualSide === 'left' ? 'lg:col-span-5' : 'lg:col-span-5 lg:col-start-8 lg:order-last'}`}>
      <FeatureVisual />
    </div>
    {/* Text - Correctly positioned based on visualSide for large screens */}
    {/* Adjusted text sizes and margins */}
    {/* If visual is left, text starts at col 6. If visual is right, text starts implicitly at col 1. */}
    <div className={`mt-6 lg:mt-0 ${visualSide === 'left' ? 'lg:col-span-7 lg:col-start-6' : 'lg:col-span-7'}`}>
      <h3 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl">{title}</h3>
      <p className="mt-3 text-lg text-gray-500 sm:mt-4">{description}</p>
      {/* Optional: Add specific bullet points or links */}
    </div>
  </div>
);


function HowItWorksSection() {
  return (
    // Adjusted padding
    <section className="bg-white py-16 sm:py-20 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         {/* Adjusted text sizes and margins */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            [AI] Una Plataforma Intuitiva con Beneficios Reales
          </h2>
          <p className="mt-4 text-lg text-gray-500 sm:text-xl">
            Descubre cómo Fideliz simplifica la gestión y potencia la motivación.
          </p>
        </div>

         {/* Increased spacing between items */}
        <div className="space-y-16 lg:space-y-24">
          {/* Feature 1: Alianzas Estratégicas */}
          <FeatureItem
            title="[AI] Alianzas Estratégicas Exclusivas"
            description="[AI] Accede a un catálogo diverso de beneficios externos (bienestar, viajes, entretenimiento y más) negociados para ofrecer el máximo valor a tus empleados."
            visualSide="left"
          />

          {/* Feature 2: Gestión Simplificada */}
          <FeatureItem
            title="[AI] Gestión Simplificada para Administradores"
            description="[AI] Asigna puntos, gestiona recompensas internas y monitorea el engagement desde una plataforma centralizada e intuitiva. ¡Menos tiempo administrando, más tiempo motivando!"
            visualSide="right"
            // visual={<FeatureVisual bgColor="bg-blue-100" />} // Example different bg
          />

          {/* Feature 3: Experiencia Empleado Fluida */}
          <FeatureItem
            title="[AI] Experiencia Atractiva para Empleados"
            description="[AI] Tus colaboradores pueden consultar fácilmente sus puntos, explorar el catálogo de recompensas (internas y externas) y canjear sus beneficios favoritos desde cualquier dispositivo."
            visualSide="left"
             // visual={<FeatureVisual bgColor="bg-green-100" />} // Example different bg
          />

           {/* Feature 4: Inteligencia Artificial */}
           <FeatureItem
            title="[AI] Insights con Inteligencia Artificial"
            description="[AI] Obtén reportes automáticos, detecta tendencias y recibe sugerencias inteligentes para optimizar tu programa de fidelización y entender mejor a tu equipo."
            visualSide="right"
             // visual={<FeatureVisual bgColor="bg-purple-100" />} // Example different bg
          />
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;

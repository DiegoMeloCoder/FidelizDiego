import React from 'react';
import beneficiosImage from '../../assets/logos/beneficios.png'; // Import the new image
import administradoresImage from '../../assets/logos/administradores.png'; // Import the new image
import empleadofelizImage from '../../assets/logos/empleadofeliz.png'; // Import the new image
import ayudaiaImage from '../../assets/logos/ayudaia.png'; // Import the new image
// Updated FeatureVisual to use an image placeholder or a specific image
const FeatureVisual = ({ seed, specificImage, altText = "Ilustración de característica de Fideliz" }) => {
  // Use specificImage if provided, otherwise use picsum.photos with a seed
  const imageUrl = specificImage || `https://picsum.photos/seed/${seed}/500/350`;
  return (
    <div className="overflow-hidden aspect-w-16 aspect-h-9 lg:aspect-none lg:w-full lg:h-80"> {/* Removed rounded-lg shadow-xl */}
      <img 
        src={imageUrl} 
        alt={altText} 
        className="object-contain w-full h-full" /* Changed object-cover to object-contain */
      />
    </div>
  );
};

// Placeholder for a single feature item
// TODO: Extract to FeatureItem.jsx later if needed
const FeatureItem = ({ title, description, visualSide = 'left', imageSrc, imageAlt }) => (
  // Stacks visual above text on mobile, uses grid for larger screens
  <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center"> {/* Increased gap from 12 to 16 */}
    {/* Visual - Order adjusted based on visualSide for large screens */}
    <div className={`mt-6 lg:mt-0 ${visualSide === 'left' ? 'lg:col-span-5' : 'lg:col-span-5 lg:col-start-8 lg:order-last'}`}>
      <FeatureVisual seed={title.substring(0, 10)} specificImage={imageSrc} altText={imageAlt} /> {/* Pass a seed, specificImage, and altText */}
    </div>
    {/* Text - Correctly positioned based on visualSide for large screens */}
    {/* Adjusted text sizes and margins */}
    {/* If visual is left, text starts at col 6. If visual is right, text starts implicitly at col 1. */}
    <div className={`relative mt-6 lg:mt-0 ${visualSide === 'left' ? 'lg:col-span-7 lg:col-start-6' : 'lg:col-span-7'}`}>
      {/* Added a decorative background element */}
      <div className="absolute inset-0 bg-landing-primary/5 rounded-xl transform -rotate-1 lg:-rotate-2 hidden md:block"></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg md:bg-transparent md:p-0 md:shadow-none"> {/* On md+, make bg transparent to see decorative one */}
        <h3 className="text-2xl font-bold text-landing-primary tracking-tight sm:text-3xl">{title}</h3> {/* Changed text color to landing-primary */}
        <p className="mt-3 text-lg text-gray-600 sm:text-xl leading-relaxed">{description}</p> {/* Increased sm text size, changed color to gray-600 for better contrast on light bg if decorative element is subtle */}
        {/* Optional: Add specific bullet points or links */}
      </div>
    </div>
  </div>
);


function HowItWorksSection() {
  return (
    // Adjusted padding and added animation
    // TODO: Implement true scroll-reveal with Intersection Observer for better performance and UX
    <section className="bg-white py-16 sm:py-20 md:py-24 overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.4s' }}> {/* Added delay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         {/* Adjusted text sizes and margins */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-3xl font-extrabold text-landing-primary sm:text-4xl lg:text-5xl tracking-tight"> {/* Changed text color to landing-primary */}
            [AI] Una Plataforma Intuitiva con Beneficios Reales
          </h2>
          <p className="mt-4 text-xl text-gray-600 sm:text-2xl leading-relaxed"> {/* Increased text size, changed color to gray-600 */}
            Descubre cómo Fideliz simplifica la gestión y potencia la motivación.
          </p>
        </div>

         {/* Increased spacing between items */}
        <div className="space-y-16 lg:space-y-24">
          {/* Feature 1: Alianzas Estratégicas */}
          <FeatureItem
            title="Alianzas Estratégicas Exclusivas"
            description="Accede a un catálogo diverso de beneficios externos (bienestar, viajes, entretenimiento y más) negociados para ofrecer el máximo valor a tus empleados."
            visualSide="left"
            imageSrc={beneficiosImage}
            imageAlt="Ilustración de diversos beneficios y alianzas estratégicas"
          />

          {/* Feature 2: Gestión Simplificada */}
          <FeatureItem
            title="Gestión Simplificada para Administradores"
            description="Asigna puntos, gestiona recompensas internas y monitorea el engagement desde una plataforma centralizada e intuitiva. ¡Menos tiempo administrando, más tiempo motivando!"
            visualSide="right"
            imageSrc={administradoresImage} // Placeholder for admin image
            imageAlt="Ilustración de la gestión simplificada para administradores"
            // visual={<FeatureVisual bgColor="bg-blue-100" />} // Example different bg
          />

          {/* Feature 3: Experiencia Empleado Fluida */}
          <FeatureItem
            title="Experiencia Atractiva para Empleados"
            description="Tus colaboradores pueden consultar fácilmente sus puntos, explorar el catálogo de recompensas (internas y externas) y canjear sus beneficios favoritos desde cualquier dispositivo."
            visualSide="left"
            imageSrc={empleadofelizImage} // Placeholder for employee image
            imageAlt="Ilustración de un empleado feliz utilizando la plataforma"
             // visual={<FeatureVisual bgColor="bg-green-100" />} // Example different bg
          />

           {/* Feature 4: Inteligencia Artificial */}
           <FeatureItem
            title="Insights con Inteligencia Artificial"
            description="Obtén reportes automáticos, detecta tendencias y recibe sugerencias inteligentes para optimizar tu programa de fidelización y entender mejor a tu equipo."
            visualSide="right"
            imageSrc={ayudaiaImage} // Placeholder for AI help image
            imageAlt="Ilustración de inteligencia artificial ayudando en la gestión"
             // visual={<FeatureVisual bgColor="bg-purple-100" />} // Example different bg
          />
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;

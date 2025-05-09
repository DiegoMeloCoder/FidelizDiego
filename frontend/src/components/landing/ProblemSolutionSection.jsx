import React from 'react';
import empresaRotaImage from '../../assets/logos/empresarota.png'; // Import the new image

function ProblemSolutionSection() {
  return (
    // Adjusted padding for responsiveness and added animation
    // TODO: Implement true scroll-reveal with Intersection Observer for better performance and UX
    <section className="bg-gray-50 py-16 sm:py-20 md:py-24 animate-fadeInUp" style={{ animationDelay: '0.2s' }}> {/* Added delay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          {/* Text Content - Spans 7 columns on large screens */}
          <div className="relative lg:col-span-7 text-center lg:text-left"> {/* Added relative positioning */}
            {/* Added a decorative background element */}
            <div className="absolute inset-0 bg-landing-accent/10 rounded-xl transform rotate-1 lg:rotate-2 hidden md:block -z-10"></div> {/* Using accent color, adjust rotation if needed */}
            <div className="relative bg-gray-50 p-6 rounded-lg shadow-lg md:bg-transparent md:p-0 md:shadow-none"> {/* On md+, make bg transparent */}
              {/* Adjusted heading size for responsiveness */}
              <h2 className="text-3xl font-extrabold text-landing-primary sm:text-4xl lg:text-5xl tracking-tight"> {/* Changed text color to landing-primary */}
              ¿Cansado de perder talento valioso?
            </h2>
            {/* Adjusted paragraph size and margin for responsiveness */}
            <p className="mt-4 text-xl text-gray-600 sm:text-2xl leading-relaxed"> {/* Increased size, changed color */}
              La rotación de personal cuesta mucho más que un salario. Impacta la moral, la productividad y los resultados finales.
            </p>
            {/* Adjusted margin for responsiveness */}
              <div className="mt-6 sm:mt-8">
                {/* Adjusted paragraph size for responsiveness */}
                <p className="text-xl text-gray-600 sm:text-2xl leading-relaxed"> {/* Increased size, changed color */}
                  Fideliz es la solución diseñada para <span className="font-semibold text-landing-primary">fortalecer la lealtad</span> de tu equipo invirtiendo en su bienestar y reconocimiento a través de beneficios que realmente valoran. Transforma la retención de un gasto a una <span className="font-semibold text-landing-primary">inversión estratégica</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Image - Spans 5 columns on large screens */}
          <div className="mt-10 lg:mt-0 lg:col-span-5 flex justify-center lg:justify-end">
            <img 
              src={empresaRotaImage} 
              alt="Ilustración sobre la pérdida de talento en empresas" 
              className="object-contain w-full max-w-md lg:max-w-lg h-auto" // Removed rounded-lg shadow-xl
              style={{ maxHeight: '400px' }} // Constrain height if needed
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemSolutionSection;

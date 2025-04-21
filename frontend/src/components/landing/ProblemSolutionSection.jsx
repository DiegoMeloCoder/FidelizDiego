import React from 'react';

function ProblemSolutionSection() {
  return (
    // Adjusted padding for responsiveness
    <section className="bg-gray-50 py-16 sm:py-20 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
         {/* Adjusted heading size for responsiveness */}
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
          [AI] ¿Cansado de perder talento valioso?
        </h2>
         {/* Adjusted paragraph size and margin for responsiveness */}
        <p className="mt-4 text-lg text-gray-500 sm:text-xl">
          La rotación de personal cuesta mucho más que un salario. Impacta la moral, la productividad y los resultados finales.
        </p>
         {/* Adjusted margin for responsiveness */}
        <div className="mt-6 sm:mt-8">
           {/* Adjusted paragraph size for responsiveness */}
          <p className="text-lg text-gray-700 sm:text-xl">
            Fideliz es la solución diseñada para <span className="font-semibold text-landing-primary">fortalecer la lealtad</span> de tu equipo invirtiendo en su bienestar y reconocimiento a través de beneficios que realmente valoran. Transforma la retención de un gasto a una <span className="font-semibold text-landing-primary">inversión estratégica</span>.
          </p>
          {/* Optional: Add a small visual element or icon here */}
        </div>
      </div>
    </section>
  );
}

export default ProblemSolutionSection;

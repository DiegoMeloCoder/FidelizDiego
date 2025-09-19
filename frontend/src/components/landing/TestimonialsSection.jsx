import React, { useCallback, useEffect, useState } from 'react'; // Import hooks
import useEmblaCarousel from 'embla-carousel-react'; // Import Embla hook

// Placeholder for star rating
const StarRating = ({ rating = 5 }) => (
  <div className="flex text-yellow-400">
    {[...Array(rating)].map((_, i) => (
      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
    ))}
    {[...Array(5 - rating)].map((_, i) => (
       <svg key={i+rating} className="w-5 h-5 fill-current text-gray-300" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
    ))}
  </div>
);

// Placeholder for a single testimonial card
// TODO: Extract to TestimonialCard.jsx later if needed
const TestimonialCard = ({ quote, name, title, company, rating }) => (
  // Added transition and hover effect, including scale
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-102"> {/* Added h-full for consistent height in carousel and hover:scale-102 */}
    <div className="shrink-0">
      <StarRating rating={rating} />
    </div>
    <blockquote className="mt-4 grow">
      <p className="text-lg text-gray-700 leading-relaxed">"{quote}"</p> {/* Added leading-relaxed */}
    </blockquote>
    <footer className="mt-6">
      {/* Placeholder for avatar/logo */}
      {/* <div className="flex items-center"> ... </div> */}
      <p className="text-base font-semibold text-gray-900">{name}</p>
      <p className="text-sm text-gray-500">{title}, {company}</p>
    </footer>
  </div>
);

// Placeholder icons for carousel buttons
const PrevIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const NextIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;


function TestimonialsSection() {
  // Initialize Embla Carousel
  // Show 1 slide on mobile, 2 on tablet, 3 on desktop by default
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  // Update button states when carousel settles or reinitializes
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(); // Set initial state
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      // Clean up listeners when component unmounts
      if (emblaApi) {
        emblaApi.off('select', onSelect);
        emblaApi.off('reInit', onSelect);
      }
    };
  }, [emblaApi, onSelect]);


  // Expanded placeholder testimonial data (6 total)
  const testimonials = [
    {
      quote: "[AI] Fideliz ha transformado nuestra forma de reconocer a los empleados. Es fácil de usar y los beneficios son realmente valorados.",
      name: "Ana García",
      title: "Gerente de RRHH",
      company: "Innovatech Solutions",
      rating: 5,
    },
    {
      quote: "[AI] La variedad de recompensas y la facilidad de canje han aumentado significativamente la motivación de nuestro equipo.",
      name: "Carlos Rodríguez",
      title: "Director de Operaciones",
      company: "Logística Global",
      rating: 5,
    },
    {
      quote: "[AI] Implementar Fideliz fue rápido y el soporte excelente. Vemos un impacto positivo en la retención.",
      name: "Sofía Martínez",
      title: "CEO",
      company: "Creativos Digitales",
      rating: 4,
    },
    {
      quote: "[AI] La integración con nuestras herramientas internas fue sorprendentemente sencilla.",
      name: "David López",
      title: "CTO",
      company: "Tech Forward Inc.",
      rating: 5,
    },
     {
      quote: "[AI] Excelente plataforma para gestionar beneficios flexibles y reconocer a nuestro personal.",
      name: "Laura Fernández",
      title: "Directora de Talento",
      company: "Servicios Eficaces",
      rating: 5,
    },
     {
      quote: "[AI] Los reportes de IA nos dan una visión clara del impacto del programa. ¡Muy útil!",
      name: "Miguel Ángel",
      title: "Gerente General",
      company: "Consultores Asociados",
      rating: 4,
    },
  ];

  return (
    // Adjusted padding and added animation
    // TODO: Implement true scroll-reveal with Intersection Observer for better performance and UX
    <section className="bg-white py-16 sm:py-20 md:py-24 relative animate-fadeInUp" style={{ animationDelay: '0.6s' }}> {/* Added animation, delay and relative positioning for buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         {/* Adjusted text sizes and margins */}
        <div className="text-center mb-12 md:mb-16"> {/* Reduced bottom margin */}
          <h2 className="text-3xl font-extrabold text-landing-primary sm:text-4xl lg:text-5xl tracking-tight"> {/* Changed text color */}
            ¿Qué dicen nuestros clientes?
          </h2>
          <p className="mt-4 text-xl text-gray-600 sm:text-2xl leading-relaxed"> {/* Increased size, changed color */}
            Historias reales de empresas que han mejorado su cultura y resultados con Fideliz.
          </p>
        </div>

        {/* Embla Carousel Structure */}
        <div className="overflow-hidden" ref={emblaRef}>
          {/* Container */}
          <div className="flex -ml-4"> {/* Negative margin to counteract padding on slides */}
            {testimonials.map((testimonial, index) => (
              // Slide - Ensure cards have consistent height for better visual alignment in carousel
              <div key={index} className="shrink-0 w-full sm:w-1/2 lg:w-1/3 pl-4 flex"> {/* Adjust width and add flex for h-full on card */}
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center px-2 sm:px-0 transform -translate-y-1/2 pointer-events-none">
           <button
             onClick={scrollPrev}
             disabled={prevBtnDisabled}
             className="pointer-events-auto bg-white rounded-full p-2 shadow-md hover:bg-gray-100 disabled:opacity/50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-landing-primary focus:ring-offset-2 transition"
             aria-label="Previous testimonial"
           >
             <PrevIcon />
           </button>
           <button
             onClick={scrollNext}
             disabled={nextBtnDisabled}
             className="pointer-events-auto bg-white rounded-full p-2 shadow-md hover:bg-gray-100 disabled:opacity/50 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-landing-primary focus:ring-offset-2 transition"
             aria-label="Next testimonial"
           >
             <NextIcon />
           </button>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;

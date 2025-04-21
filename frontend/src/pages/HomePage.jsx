import React from 'react';
// No need for react-helmet-async in React 19+

// Import actual landing page components
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import ProblemSolutionSection from '../components/landing/ProblemSolutionSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import AllianceLogosGrid from '../components/landing/AllianceLogosGrid';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FinalCTASection from '../components/landing/FinalCTASection';
import LandingFooter from '../components/landing/LandingFooter';

function HomePage() {
  return (
    <div>
      {/* Built-in React 19+ support for head tags */}
      <title>Fideliz - Retén Talento y Motiva a tu Equipo</title>
      <meta name="description" content="Plataforma de beneficios y recompensas para empleados. Reduce la rotación y aumenta la motivación con Fideliz." />

      <LandingNavbar />
      <main>
        <HeroSection />
        <ProblemSolutionSection />
        <HowItWorksSection />
        <AllianceLogosGrid />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}

export default HomePage;

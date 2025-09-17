import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingFooter from '../../components/landing/LandingFooter';
import ReactPlayer from 'react-player/youtube';

function ViewDemoPage() {
  const youtubeVideoUrl = "https://www.youtube.com/watch?v=Zcb8yPEItwA";

  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-landing-primary sm:text-5xl tracking-tight">
            ¡Mira cómo funciona Fideliz!
          </h1>
          <p className="mt-4 text-xl text-gray-600 sm:text-2xl leading-relaxed">
            Descubre el poder de nuestra plataforma en este breve video.
          </p>

          {/* Responsive video container using padding-top trick for aspect ratio */}
          <div className="mt-10 relative rounded-lg shadow-xl overflow-hidden" style={{ paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
            <ReactPlayer
              className="absolute top-0 left-0 w-full h-full" // Added classes for absolute positioning and full size
              url={youtubeVideoUrl}
              width="100%" // These might be redundant with className but often good for ReactPlayer
              height="100%" // These might be redundant with className but often good for ReactPlayer
              controls={true}
              playing={false} 
              // light={true} // Keeping light mode off for now to ensure basic embed works
            />
          </div>
          
          <p className="mt-8 text-gray-500">
            ¿Preguntas? No dudes en <a href="/agendar-reunion" className="text-landing-primary hover:underline">agendar una reunión</a> con nosotros.
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

export default ViewDemoPage;

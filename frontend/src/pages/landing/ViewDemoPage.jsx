import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingFooter from "../../components/landing/LandingFooter";
import ReactPlayer from "react-player/youtube";
import { Link } from "react-router-dom";

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

          <div
            className="mt-10 relative rounded-lg shadow-xl overflow-hidden"
            style={{ paddingTop: "56.25%" }}
          >
            <ReactPlayer
              className="absolute top-0 left-0 w-full h-full"
              url={youtubeVideoUrl}
              width="100%"
              height="100%"
              controls={true}
              playing={false}
              light={true}
            />
          </div>

          <p className="mt-8 text-gray-500">
            ¿Preguntas? No dudes en{" "}
            <Link
              to="/agendar-reunion"
              className="text-landing-primary hover:underline font-semibold"
            >
              agendar una reunión
            </Link>{" "}
            con nosotros.
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

export default ViewDemoPage;

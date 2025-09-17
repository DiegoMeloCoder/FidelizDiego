import { useScript } from "../../hooks/useScript";
import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingFooter from "../../components/landing/LandingFooter";
import CreatorProfile from "../../components/landing/CreatorProfile";
import Spinner from "../../components/ui/Spinner";
import manager1 from "../../assets/logos/manager1.png";
import manager2 from "../../assets/logos/manager2.png";
import manager3 from "../../assets/logos/manager3.png";

const creators = [
  { name: "Creador 1", title: "Co-fundador", imgSrc: manager1 },
  { name: "Creador 2", title: "Co-fundador", imgSrc: manager2 },
  { name: "Creador 3", title: "Co-fundador", imgSrc: manager3 },
];

function ScheduleMeetingPage() {
  // Usar el hook para cargar el script de Calendly
  const { loading: calendlyLoading, error: calendlyError } = useScript(
    "https://assets.calendly.com/assets/external/widget.js"
  );

  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            <aside className="lg:col-span-4 xl:col-span-3 mb-10 lg:mb-0">
              <div className="bg-white p-6 rounded-lg shadow-lg sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center lg:text-left">
                  Agenda con nuestro equipo
                </h2>
                {creators.map((creator) => (
                  <CreatorProfile key={creator.name} {...creator} />
                ))}
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Selecciona un horario disponible con cualquiera de nuestros
                  especialistas.
                </p>
              </div>
            </aside>

            <div className="lg:col-span-8 xl:col-span-9">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-landing-primary mb-2 text-center">
                  Selecciona Fecha y Hora para tu Reunión
                </h1>
                <p className="text-gray-600 mb-6 text-center">
                  Utiliza el calendario a continuación para encontrar un horario
                  que te convenga.
                </p>

                {calendlyLoading && (
                  <div
                    className="flex justify-center items-center"
                    style={{ minHeight: "700px" }}
                  >
                    <Spinner />
                  </div>
                )}
                {calendlyError && (
                  <div className="text-center text-red-600">
                    No se pudo cargar el calendario. Por favor, recarga la
                    página.
                  </div>
                )}
                {/* El div de Calendly se renderiza siempre, y el script lo llenará cuando esté listo */}
                <div
                  className="calendly-inline-widget w-full"
                  data-url="https://calendly.com/dlxstudios29?background_color=f9faf7&primary_color=69c702"
                  style={{
                    minWidth: "320px",
                    height: "700px",
                    display: calendlyLoading ? "none" : "block",
                  }}
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

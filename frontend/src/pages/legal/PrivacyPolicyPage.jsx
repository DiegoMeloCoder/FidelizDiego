import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingFooter from "../../components/landing/LandingFooter";

function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl font-extrabold text-landing-primary mb-8 text-center tracking-tight">
            Política de Privacidad
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              <strong>Última actualización:</strong> 16 de Septiembre de 2025
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
              1. Introducción
            </h2>
            <p className="mb-4">
              Fideliz ("nosotros", "nuestro", o "la Plataforma") se compromete a
              proteger su privacidad. Esta Política de Privacidad explica cómo
              recopilamos, usamos, divulgamos y salvaguardamos su información
              cuando utiliza nuestra plataforma SaaS. Lea atentamente esta
              política de privacidad. Si no está de acuerdo con los términos de
              esta política de privacidad, no acceda a la plataforma.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
              2. Recopilación de su Información
            </h2>
            <p className="mb-4">
              Podemos recopilar información sobre usted de varias maneras. La
              información que podemos recopilar en la Plataforma incluye:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>
                <strong>Datos Personales:</strong> Información de identificación
                personal, como su nombre, dirección de correo electrónico,
                nombre de la empresa y cargo, que usted nos proporciona
                voluntariamente cuando se registra en la Plataforma o cuando
                elige participar en diversas actividades relacionadas con la
                Plataforma.
              </li>
              <li>
                <strong>Datos de Uso:</strong> Información que nuestro servidor
                recopila automáticamente cuando accede a la Plataforma, como su
                dirección IP, tipo de navegador, sistema operativo, tiempos de
                acceso y las páginas que ha visto directamente antes y después
                de acceder a la Plataforma.
              </li>
              <li>
                <strong>Datos de la Empresa:</strong> Información relacionada
                con la empresa que representa, como datos de empleados (nombres,
                correos electrónicos) que usted carga para la gestión de puntos
                y recompensas. Usted es responsable de obtener el consentimiento
                necesario para proporcionar dichos datos.
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
              3. Uso de su Información
            </h2>
            <p className="mb-4">
              Tener información precisa sobre usted nos permite brindarle una
              experiencia fluida, eficiente y personalizada. Específicamente,
              podemos usar la información recopilada sobre usted a través de la
              Plataforma para:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Crear y administrar su cuenta.</li>
              <li>
                Proporcionar y gestionar los servicios de la Plataforma,
                incluyendo la asignación de puntos y el canje de recompensas.
              </li>
              <li>
                Mejorar la eficiencia y el funcionamiento de la Plataforma.
              </li>
              <li>Comunicarnos con usted sobre su cuenta o los servicios.</li>
              <li>Prevenir actividades fraudulentas y mejorar la seguridad.</li>
              <li>Cumplir con las obligaciones legales y regulatorias.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
              4. Divulgación de su Información
            </h2>
            <p className="mb-4">
              No compartiremos, venderemos, alquilaremos ni intercambiaremos su
              información personal con terceros sin su consentimiento, excepto
              como se describe en esta Política de Privacidad o cuando lo exija
              la ley.
            </p>
            <p className="mb-4">
              Podemos compartir información con proveedores de servicios
              externos que realizan servicios para nosotros o en nuestro nombre,
              incluido el procesamiento de pagos, análisis de datos, entrega de
              correo electrónico, servicios de alojamiento, servicio al cliente
              y asistencia de marketing.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
              5. Seguridad de su Información
            </h2>
            <p className="mb-4">
              Utilizamos medidas de seguridad administrativas, técnicas y
              físicas para ayudar a proteger su información personal. Si bien
              hemos tomado medidas razonables para proteger la información
              personal que nos proporciona, tenga en cuenta que ninguna medida
              de seguridad es perfecta o impenetrable, y no se puede garantizar
              ningún método de transmisión de datos contra cualquier
              intercepción u otro tipo de uso indebido.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
              6. Derechos de Privacidad
            </h2>
            <p className="mb-4">
              Dependiendo de su jurisdicción, puede tener ciertos derechos con
              respecto a su información personal, como el derecho a acceder,
              corregir o eliminar sus datos personales. Para ejercer estos
              derechos, contáctenos utilizando la información de contacto
              proporcionada a continuación.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
              7. Cambios a esta Política de Privacidad
            </h2>
            <p className="mb-4">
              Podemos actualizar esta Política de Privacidad de vez en cuando.
              Le notificaremos cualquier cambio publicando la nueva Política de
              Privacidad en esta página. Se le aconseja que revise esta Política
              de Privacidad periódicamente para detectar cualquier cambio.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
              8. Contacto
            </h2>
            <p>
              Si tiene preguntas o comentarios sobre esta Política de
              Privacidad, contáctenos en <strong>soporte@fideliz.com</strong>.
            </p>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

export default PrivacyPolicyPage;

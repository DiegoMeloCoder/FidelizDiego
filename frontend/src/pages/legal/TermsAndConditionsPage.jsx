import React from 'react';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingFooter from '../../components/landing/LandingFooter';

function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNavbar />
      <main className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl font-extrabold text-landing-primary mb-8 text-center tracking-tight">
            Términos y Condiciones
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4"><strong>Última actualización:</strong> 9 de Mayo de 2025</p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">1. Introducción</h2>
            <p className="mb-4">
              Bienvenido a FidelizDiego ("nosotros", "nuestro", o "la Plataforma"). Estos términos y condiciones rigen su uso de nuestra plataforma SaaS de fidelización y engagement de empleados. Al acceder o utilizar nuestra Plataforma, usted acepta estar sujeto a estos Términos. Si no está de acuerdo con alguna parte de los términos, no podrá acceder a la Plataforma.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">2. Uso de la Plataforma</h2>
            <p className="mb-4">
              Usted se compromete a utilizar la Plataforma solo para fines lícitos y de acuerdo con estos Términos. Usted es responsable de asegurar que su uso de la Plataforma cumpla con todas las leyes y regulaciones aplicables.
            </p>
            <p className="mb-4">
              Se le concede una licencia limitada, no exclusiva, intransferible y revocable para utilizar la Plataforma para sus fines comerciales internos de acuerdo con el plan de suscripción adquirido.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">3. Cuentas de Usuario</h2>
            <p className="mb-4">
              Para acceder a ciertas funciones de la Plataforma, es posible que deba registrarse para obtener una cuenta. Usted es responsable de mantener la confidencialidad de la información de su cuenta, incluidas sus contraseñas, y de todas las actividades que ocurran bajo su cuenta.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">4. Propiedad Intelectual</h2>
            <p className="mb-4">
              La Plataforma y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de FidelizDiego y sus licenciantes. La Plataforma está protegida por derechos de autor, marcas registradas y otras leyes tanto de [País de Jurisdicción] como de países extranjeros.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">5. Contenido Generado por el Usuario</h2>
            <p className="mb-4">
              Si usted publica, carga, introduce, proporciona o envía cualquier dato o contenido a la Plataforma, usted conserva la propiedad de dicho contenido, pero nos otorga una licencia mundial, libre de regalías, no exclusiva para usar, reproducir, modificar, adaptar, publicar, traducir, crear trabajos derivados, distribuir y mostrar dicho contenido en relación con la operación y promoción de la Plataforma.
            </p>
            
            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">6. Limitación de Responsabilidad</h2>
            <p className="mb-4">
              En ningún caso FidelizDiego, ni sus directores, empleados, socios, agentes, proveedores o afiliados, serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo sin limitación, pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de (i) su acceso o uso o incapacidad para acceder o usar la Plataforma; (ii) cualquier conducta o contenido de cualquier tercero en la Plataforma; (iii) cualquier contenido obtenido de la Plataforma; y (iv) el acceso no autorizado, uso o alteración de sus transmisiones o contenido, ya sea basado en garantía, contrato, agravio (incluyendo negligencia) o cualquier otra teoría legal, ya sea que hayamos sido informados o no de la posibilidad de tales daños.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">7. Modificaciones a los Términos</h2>
            <p className="mb-4">
              Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que entren en vigor los nuevos términos. Lo que constituye un cambio material se determinará a nuestra sola discreción.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">8. Ley Aplicable</h2>
            <p className="mb-4">
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de [País de Jurisdicción], sin tener en cuenta sus disposiciones sobre conflicto de leyes.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">9. Contacto</h2>
            <p>
              Si tiene alguna pregunta sobre estos Términos, por favor contáctenos en [su email de contacto o página de contacto].
            </p>
            <p className="mt-8 text-sm text-gray-500">
              <em>Este es un borrador generado automáticamente y debe ser revisado y adaptado por un profesional legal para asegurar su adecuación y cumplimiento con las leyes aplicables.</em>
            </p>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

export default TermsAndConditionsPage;

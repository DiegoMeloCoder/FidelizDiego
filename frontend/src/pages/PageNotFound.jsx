import Button from "../components/ui/Button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

function NotFoundPage() {
  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-12">
      <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        404 - Página no encontrada
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Button onClick={goBack} variant="primary">
        Volver a la página anterior
      </Button>
    </div>
  );
}

export default NotFoundPage;

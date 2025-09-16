import Swal from "sweetalert2";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

/**
 * Un componente autocontenido para la sección de generación de reportes con IA.
 * @param {object} props
 * @param {object} props.dates - Objeto con { startDate, endDate }.
 * @param {function} props.onDatesChange - Función para manejar el cambio de fechas.
 * @param {function} props.onGenerate - Función para iniciar la generación del reporte.
 * @param {boolean} props.isGenerating - Indica si un reporte se está generando.
 * @param {string} props.error - Mensaje de error a mostrar.
 * @param {object} props.report - El reporte generado.
 */
export function ReportGenerator({
  dates,
  onDatesChange,
  onGenerate,
  isGenerating,
  error,
  report,
}) {
  const handleDateChange = (e) => {
    onDatesChange((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleExportReport = () => {
    // Placeholder for future functionality
    Swal.fire({
      icon: "info",
      title: "Funcionalidad en Desarrollo",
      text: "La funcionalidad para exportar el reporte a PDF aún no está implementada.",
      confirmButtonText: "Entendido",
    });
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-200 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
        <DocumentChartBarIcon className="h-6 w-6 mr-2 text-brand-primary" />
        Generar Reporte con IA
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label
            htmlFor="report-start-date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Fecha de Inicio
          </label>
          <Input
            id="report-start-date"
            name="startDate"
            type="date"
            value={dates.startDate}
            onChange={handleDateChange}
            className="w-full"
            disabled={isGenerating}
          />
        </div>
        <div>
          <label
            htmlFor="report-end-date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Fecha de Fin
          </label>
          <Input
            id="report-end-date"
            name="endDate"
            type="date"
            value={dates.endDate}
            onChange={handleDateChange}
            className="w-full"
            disabled={isGenerating}
          />
        </div>
        <Button
          onClick={onGenerate}
          variant="primary"
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <Spinner size="sm" color="text-white" className="mr-2" />
          ) : (
            <DocumentChartBarIcon className="h-5 w-5 mr-1.5" />
          )}
          {isGenerating ? "Generando..." : "Generar Reporte"}
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {report && !isGenerating && (
        <div className="mt-4 border-t border-gray-200 pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Reporte del {report.data.period?.startDate} al{" "}
              {report.data.period?.endDate}
            </h3>
            <Button onClick={handleExportReport} variant="secondary" size="sm">
              <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
              Exportar PDF
            </Button>
          </div>

          <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded border border-gray-200">
            {report.summary.split("\n").map((line, index) => (
              <p
                key={index}
                className={line.startsWith("**") ? "font-semibold" : ""}
              >
                {line.replace(/\*\*/g, "")}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useAdminPointsHistory } from "../../../hooks/useAdminPointsHistory";
import Spinner from "../../../components/ui/Spinner";
import Alert from "../../../components/ui/Alert";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

// Función auxiliar para formatear la fecha, específica para esta vista.
const formatDate = (date) => {
  if (!date) return "N/A";
  return date.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

function PointsHistoryAdmin() {
  const { history, loading, error } = useAdminPointsHistory();

  // Clases de Tailwind para la tabla.
  const thStyle =
    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <DocumentTextIcon className="h-7 w-7 mr-2 text-indigo-600" />
        Historial de Asignación de Puntos
      </h1>

      {error && <Alert type="error">{error}</Alert>}

      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={thStyle}>Fecha</th>
                <th className={thStyle}>Empleado</th>
                <th className={thStyle}>Cantidad</th>
                <th className={thStyle}>Justificación</th>
                <th className={thStyle}>Asignado Por (Admin)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className={`${tdStyle} text-center text-gray-500 py-6`}
                  >
                    No se encontró historial de asignación de puntos para esta
                    empresa.
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className={`${tdStyle} text-gray-500`}>
                      {formatDate(entry.fechaAsignacion)}
                    </td>
                    <td className={`${tdStyle} font-medium text-gray-900`}>
                      {entry.employee?.nombre || (
                        <span className="text-gray-400 italic">
                          {entry.employee?.email || "N/A"}
                        </span>
                      )}
                    </td>
                    <td
                      className={`${tdStyle} font-semibold ${
                        entry.cantidad >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {entry.cantidad > 0 ? "+" : ""}
                      {entry.cantidad}
                    </td>
                    <td className={`${tdStyle} text-gray-700`}>
                      {entry.justificacionTexto || (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </td>
                    <td className={`${tdStyle} text-gray-500`}>
                      {entry.admin?.nombre || entry.admin?.email || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PointsHistoryAdmin;

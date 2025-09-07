import { useEmployeeHistory } from "../../../hooks/useEmployeeHistory";
import Spinner from "../../../components/ui/Spinner";
import Alert from "../../../components/ui/Alert";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

// Helper function to format dates, keeping it within the component as it's specific to this view.
const formatDate = (date) => {
  if (!date) return "N/A";
  return date.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

function HistoryEmployee() {
  const { history, loading, error } = useEmployeeHistory();

  const thStyle =
    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <ClipboardDocumentListIcon className="h-7 w-7 mr-2 text-sky-600" />
        Historial de Mis Puntos
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
                <th className={thStyle}>Descripción</th>
                <th className={`${thStyle} text-right pr-6`}>
                  Cambio de Puntos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className={`${tdStyle} text-center text-gray-500 py-6`}
                  >
                    No se encontró historial de puntos.
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className={`${tdStyle} text-gray-500`}>
                      {formatDate(entry.date)}
                    </td>
                    <td className={`${tdStyle} text-gray-800`}>
                      {entry.description}
                    </td>
                    <td
                      className={`${tdStyle} text-right font-semibold pr-6 ${
                        entry.amount >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {entry.amount > 0 ? "+" : ""}
                      {entry.amount}
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

export default HistoryEmployee;

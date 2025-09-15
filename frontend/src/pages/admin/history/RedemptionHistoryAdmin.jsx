import { useAdminRedemptionHistory } from "../../../hooks/useAdminRedemptionHistory";
import Spinner from "../../../components/ui/Spinner";
import Alert from "../../../components/ui/Alert";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

// Función auxiliar para formatear la fecha, específica para esta vista.
const formatDate = (date) => {
  if (!date) return "N/A";
  return date.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

function RedemptionHistoryAdmin() {
  const { history, loading, error } = useAdminRedemptionHistory();

  const thStyle =
    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <ArchiveBoxIcon className="h-7 w-7 mr-2 text-orange-600" />
        Historial de Canjes de la Empresa
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
                <th className={thStyle}>Recompensa Canjeada</th>
                <th className={`${thStyle} text-right pr-6`}>
                  Costo en Puntos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className={`${tdStyle} text-center text-gray-500 py-6`}
                  >
                    No se encontró historial de canjes para esta empresa.
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className={`${tdStyle} text-gray-500`}>
                      {formatDate(entry.fechaCanje)}
                    </td>
                    <td className={`${tdStyle} font-medium text-gray-900`}>
                      {entry.employee?.nombre || (
                        <span className="text-gray-400 italic">
                          {entry.employee?.email || "N/A"}
                        </span>
                      )}
                    </td>
                    <td className={`${tdStyle} text-gray-700`}>
                      {entry.reward?.nombre || (
                        <span className="text-gray-400 italic">
                          Recompensa Desconocida
                        </span>
                      )}
                    </td>
                    <td
                      className={`${tdStyle} text-right font-semibold pr-6 text-red-600`}
                    >
                      -{entry.puntosCosto}
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

export default RedemptionHistoryAdmin;

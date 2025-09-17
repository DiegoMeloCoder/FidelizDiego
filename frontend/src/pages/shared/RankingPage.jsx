import { useRanking } from "../../hooks/useRanking";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import { ChartBarIcon, StarIcon } from "@heroicons/react/24/outline";

function RankingPage() {
  const { ranking, loading, error, limitCount, currentUser } = useRanking();

  const thStyle =
    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <ChartBarIcon className="h-7 w-7 mr-2 text-amber-600" />
        Ranking de Empleados (Top {limitCount})
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
                <th className={`${thStyle} w-20 text-center`}>Posición</th>
                <th className={thStyle}>Nombre</th>
                <th className={`${thStyle} text-right pr-6`}>Puntos</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ranking.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className={`${tdStyle} text-center text-gray-500 py-6`}
                  >
                    No se encontraron empleados para el ranking.
                  </td>
                </tr>
              ) : (
                ranking.map((employee) => (
                  <tr
                    key={employee.id}
                    className={`transition-colors duration-150 ${
                      currentUser?.uid === employee.id
                        ? "bg-indigo-100 hover:bg-indigo-200 font-semibold"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td
                      className={`${tdStyle} text-center font-bold ${
                        currentUser?.uid === employee.id
                          ? "text-indigo-700"
                          : "text-gray-700"
                      }`}
                    >
                      {employee.rank}
                    </td>
                    <td
                      className={`${tdStyle} ${
                        currentUser?.uid === employee.id
                          ? "text-indigo-900"
                          : "text-gray-900"
                      }`}
                    >
                      {employee.nombre || (
                        <span className="text-gray-400 italic">
                          {employee.email}
                        </span>
                      )}
                      {currentUser?.uid === employee.id && (
                        <span className="ml-2 text-xs text-indigo-500">
                          (Tú)
                        </span>
                      )}
                    </td>
                    <td
                      className={`${tdStyle} text-right font-bold pr-6 ${
                        currentUser?.uid === employee.id
                          ? "text-indigo-700"
                          : "text-indigo-600"
                      } flex items-center justify-end`}
                    >
                      <StarIcon
                        className={`h-4 w-4 mr-1 ${
                          currentUser?.uid === employee.id
                            ? "text-yellow-500"
                            : "text-yellow-400"
                        }`}
                      />
                      {employee.points ?? 0}
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

export default RankingPage;

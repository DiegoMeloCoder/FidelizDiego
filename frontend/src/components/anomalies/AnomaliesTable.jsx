import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { EyeIcon, XCircleIcon } from "@heroicons/react/24/outline";

/**
 * Helper function to format an ISO date string into a locale-specific string.
 * @param {string} isoString - The ISO date string to format.
 * @returns {string} The formatted date and time.
 */
const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  try {
    return new Date(isoString).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    console.error(e);
    return "Invalid Date";
  }
};

/**
 * Helper function to get the appropriate Tailwind CSS classes for an anomaly status badge.
 * @param {string} status - The status of the anomaly ('New', 'Reviewed', 'Dismissed').
 * @returns {string} The corresponding CSS classes.
 */
const getStatusBadgeClass = (status) => {
  const statusClasses = {
    New: "bg-blue-100 text-blue-800",
    Reviewed: "bg-yellow-100 text-yellow-800",
    Dismissed: "bg-gray-100 text-gray-800",
  };
  return statusClasses[status] || "bg-gray-100 text-gray-800";
};

/**
 * A component responsible for displaying a table of anomalies.
 * @param {object[]} anomalies - The array of anomaly objects to display.
 * @param {function} onStatusUpdate - A function to call when updating an anomaly's status.
 * @param {number|null} updatingId - The ID of the anomaly currently being updated, to show a spinner.
 */
export function AnomaliesTable({ anomalies, onStatusUpdate, updatingId }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {anomalies.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-10 text-gray-500">
                No anomalies found matching the criteria.
              </td>
            </tr>
          ) : (
            anomalies.map((anomaly) => (
              <tr key={anomaly.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(anomaly.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {anomaly.type}
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-500 max-w-md truncate"
                  title={anomaly.details}
                >
                  {anomaly.details}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {anomaly.company?.nombre || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                      anomaly.status
                    )}`}
                  >
                    {anomaly.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {anomaly.status === "New" && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onStatusUpdate(anomaly.id, "Reviewed")}
                        disabled={updatingId === anomaly.id}
                        title="Mark as Reviewed"
                      >
                        {updatingId === anomaly.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onStatusUpdate(anomaly.id, "Dismissed")}
                        disabled={updatingId === anomaly.id}
                        title="Dismiss"
                      >
                        {updatingId === anomaly.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <XCircleIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                  {anomaly.status === "Reviewed" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onStatusUpdate(anomaly.id, "Dismissed")}
                      disabled={updatingId === anomaly.id}
                      title="Dismiss"
                    >
                      {updatingId === anomaly.id ? (
                        <Spinner size="sm" />
                      ) : (
                        <XCircleIcon className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AnomaliesTable;

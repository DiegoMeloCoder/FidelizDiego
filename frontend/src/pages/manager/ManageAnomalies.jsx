import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/api";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"; // Icons

// Helper to format date/time
const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";
  try {
    return new Date(isoString).toLocaleString();
  } catch (e) {
    return "Invalid Date";
  }
};

// Helper for status badge styling
const getStatusBadgeClass = (status) => {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-800";
    case "Reviewed":
      return "bg-yellow-100 text-yellow-800";
    case "Dismissed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function ManageAnomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [filters, setFilters] = useState({ status: "New", companyId: "" }); // Default to 'New' status
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which anomaly status is being updated

  // TODO: Fetch list of companies for filtering if needed

  const fetchAnomalies = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      const limit = 25;
      const offset = (page - 1) * limit;

      const params = { limit, offset, ...filters };
      // Remove empty filters
      if (!params.status) delete params.status;
      if (!params.companyId) delete params.companyId;

      try {
        const response = await apiClient.get("/anomalies", { params });
        setAnomalies(response.data.data.anomalies);
        setPagination({
          totalItems: response.data.data.totalItems,
          totalPages: response.data.data.totalPages,
          currentPage: response.data.data.currentPage,
        });
      } catch (err) {
        console.error("Error fetching anomalies:", err);
        setError(
          err.response?.data?.data.message ||
            err.message ||
            "Failed to load anomalies."
        );
        setAnomalies([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    },
    [filters]
  ); // Re-fetch when filters change

  useEffect(() => {
    fetchAnomalies(1); // Fetch first page on initial load or filter change
  }, [fetchAnomalies]);

  const handleStatusUpdate = async (anomalyId, newStatus) => {
    setUpdatingStatus(anomalyId);
    setError("");
    try {
      await apiClient.patch(`/anomalies/${anomalyId}/status`, {
        status: newStatus,
      });
      // Refresh the list to show updated status
      fetchAnomalies(pagination.currentPage);
    } catch (err) {
      console.error(`Error updating status for anomaly ${anomalyId}:`, err);
      setError(
        err.response?.data?.data.message ||
          err.message ||
          "Failed to update status."
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAnomalies(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <ExclamationTriangleIcon className="h-7 w-7 mr-2 text-red-600" />
        Manage Anomalies
      </h1>

      {/* Filters */}
      <div className="p-4 bg-gray-50 rounded-md border border-gray-200 flex flex-wrap gap-4 items-end">
        <div>
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status-filter"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>
        {/* TODO: Add Company Filter Dropdown if needed */}
        {/* <div>
             <label htmlFor="company-filter">Company</label>
             <select id="company-filter" name="companyId" value={filters.companyId} onChange={handleFilterChange}>...</select>
         </div> */}
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center p-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Timestamp
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Company
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {anomalies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    No anomalies found matching criteria.
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
                            size="xs"
                            variant="secondary"
                            onClick={() =>
                              handleStatusUpdate(anomaly.id, "Reviewed")
                            }
                            disabled={updatingStatus === anomaly.id}
                            title="Mark as Reviewed"
                          >
                            {updatingStatus === anomaly.id ? (
                              <Spinner size="xs" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="xs"
                            variant="danger-outline"
                            onClick={() =>
                              handleStatusUpdate(anomaly.id, "Dismissed")
                            }
                            disabled={updatingStatus === anomaly.id}
                            title="Dismiss"
                          >
                            {updatingStatus === anomaly.id ? (
                              <Spinner size="xs" />
                            ) : (
                              <XCircleIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                      {anomaly.status === "Reviewed" && (
                        <Button
                          size="xs"
                          variant="danger-outline"
                          onClick={() =>
                            handleStatusUpdate(anomaly.id, "Dismissed")
                          }
                          disabled={updatingStatus === anomaly.id}
                          title="Dismiss"
                        >
                          {updatingStatus === anomaly.id ? (
                            <Spinner size="xs" />
                          ) : (
                            <XCircleIcon className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {/* No actions for Dismissed */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {/* Corrected: Add braces */}
                      {(pagination.currentPage - 1) * 25 + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {/* Corrected: Add braces */}
                      {Math.min(
                        pagination.currentPage * 25,
                        pagination.totalItems
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{pagination.totalItems}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-l-md"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    {/* Consider adding page number buttons if needed */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-r-md"
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ManageAnomalies;

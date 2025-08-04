import { useState } from "react";
import { useManageAnomalies } from "../../hooks/useManageAnomalies";
import { AnomaliesFilters } from "../../components/anomalies/AnomaliesFilters";
import { AnomaliesTable } from "../../components/anomalies/AnomaliesTable";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

// A simple, reusable pagination component.
// It can be moved to its own file in 'src/components/ui/' if used elsewhere.
function Pagination({ pagination, onPageChange }) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 bg-white rounded-b-lg shadow">
      <div>
        <p className="text-sm text-gray-700">
          Page <span className="font-medium">{pagination.currentPage}</span> of{" "}
          <span className="font-medium">{pagination.totalPages}</span>
        </p>
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          variant="secondary"
          size="sm"
        >
          Previous
        </Button>
        <Button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          variant="secondary"
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function ManageAnomalies() {
  // Use our custom hook to get all state and logic.
  // The component itself doesn't know how the data is fetched or updated.
  const {
    anomalies,
    pagination,
    filters,
    loading,
    error,
    updateAnomalyStatus,
    handleFilterChange,
    handlePageChange,
  } = useManageAnomalies();

  // Local UI state to track which specific row is currently being updated.
  const [updatingId, setUpdatingId] = useState(null);

  /**
   * Handles the click on a status update button.
   * It sets the loading state for a specific row and calls the update logic from the hook.
   */
  const handleStatusUpdate = async (anomalyId, newStatus) => {
    setUpdatingId(anomalyId);
    try {
      await updateAnomalyStatus(anomalyId, newStatus);
      // Success is handled by the list automatically refreshing.
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to update status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <ExclamationTriangleIcon className="h-7 w-7 mr-2 text-red-600" />
        Manage Anomalies
      </h1>

      <AnomaliesFilters filters={filters} onFilterChange={handleFilterChange} />

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center p-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <AnomaliesTable
            anomalies={anomalies}
            onStatusUpdate={handleStatusUpdate}
            updatingId={updatingId}
          />
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}

export default ManageAnomalies;

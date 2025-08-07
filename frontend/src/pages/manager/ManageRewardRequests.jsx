import { useManageRewardRequests } from "../../hooks/useManageRewardRequests";
import { RewardRequestsFilters } from "../../components/reward_requests/RewardRequestsFilters";
import { RewardRequestsTable } from "../../components/reward_requests/RewardRequestsTable";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import { InboxArrowDownIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

function ManageRewardRequests() {
  const {
    requests,
    companies,
    loading,
    error,
    success,
    filters,
    setFilters,
    updateRequestStatus,
    isManager,
  } = useManageRewardRequests();

  /**
   * Maneja la actualización del estado de una solicitud desde la UI.
   * Llama a la lógica del hook y muestra un feedback al usuario en caso de error.
   */
  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await updateRequestStatus(requestId, newStatus);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message || "No se pudo actualizar el estado de la solicitud.",
        icon: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <InboxArrowDownIcon className="h-7 w-7 mr-2 text-cyan-600" />
        Manage Reward Requests
      </h1>

      <RewardRequestsFilters
        filters={filters}
        onFilterChange={setFilters}
        companies={companies}
        isManager={isManager}
      />

      <div className="h-10">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <RewardRequestsTable
          requests={requests}
          onStatusUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
}

export default ManageRewardRequests;

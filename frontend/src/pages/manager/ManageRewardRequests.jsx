import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/api";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button"; // Para botones de acción si se añaden
import {
  InboxArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline"; // Icons

// Mapeo de estados a colores y texto (ejemplo)
const statusStyles = {
  new: "bg-blue-100 text-blue-800",
  reviewed: "bg-yellow-100 text-yellow-800",
  planned: "bg-purple-100 text-purple-800",
  implemented: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};
const statusOptions = ["new", "reviewed", "planned", "implemented", "rejected"];

function ManageRewardRequests() {
  const { userData } = useAuth(); // Para rol, aunque la ruta ya protege
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // TODO: Añadir estado y lógica para filtros (compañía, estado) si es necesario

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      // TODO: Añadir query params para filtros si se implementan
      const response = await apiClient.get("/rewards/requests");
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching reward requests:", err);
      setError(
        err.response?.data?.message || "Failed to load reward requests."
      );
    } finally {
      setLoading(false);
    }
  }, []); // TODO: Añadir dependencias de filtros si se implementan

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // TODO: Implementar función handleUpdateStatus(requestId, newStatus)
  const handleUpdateStatus = async (requestId, newStatus) => {
    console.log(`TODO: Update request ${requestId} to status ${newStatus}`);
    // Lógica para llamar a PATCH /api/v1/rewards/requests/:id
    // Actualizar estado local 'requests' o volver a llamar fetchRequests()
    setSuccessMessage(
      `Status for request ${requestId} updated to ${newStatus} (simulated).`
    );
    setTimeout(() => setSuccessMessage(""), 3000); // Clear message
  };

  // Define Tailwind classes for table cells
  const thStyle =
    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <InboxArrowDownIcon className="h-7 w-7 mr-2 text-cyan-600" />
        Manage Reward Requests
      </h1>

      {/* TODO: Añadir filtros aquí */}

      {error && <Alert type="error">{error}</Alert>}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={thStyle}>Requested Item</th>
                <th className={thStyle}>Additional Notes</th>
                <th className={thStyle}>Employee</th>
                <th className={thStyle}>Company</th>
                <th className={thStyle}>Date</th>
                <th className={thStyle}>Status</th>
                {/* <th className={thStyle}>Actions</th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`${tdStyle} text-center text-gray-500 py-6`}
                  >
                    No reward requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className={`${tdStyle} font-medium text-gray-900`}>
                      {req.requestedItem}
                    </td>
                    <td
                      className={`${tdStyle} text-gray-600 max-w-xs truncate`}
                      title={req.additionalNotes || ""}
                    >
                      {req.additionalNotes || (
                        <span className="text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td
                      className={`${tdStyle} text-gray-700`}
                      title={req.user?.email || "N/A"}
                    >
                      {req.user?.nombre || req.user?.email || "Unknown User"}
                    </td>
                    <td className={`${tdStyle} text-gray-700`}>
                      {req.company?.nombre || `ID: ${req.companyId}`}
                    </td>
                    <td className={`${tdStyle} text-gray-500`}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className={tdStyle}>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          statusStyles[req.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    {/* TODO: Add Actions column with buttons/dropdown to change status */}
                    {/* <td className={`${tdStyle} text-right`}>
                       <Button size="sm" onClick={() => handleUpdateStatus(req.id, 'reviewed')}>Mark Reviewed</Button>
                    </td> */}
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

export default ManageRewardRequests;

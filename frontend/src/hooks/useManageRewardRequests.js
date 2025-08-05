import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function useManageRewardRequests() {
  const { userData } = useAuth();

  // --- Estado de los Datos ---
  const [requests, setRequests] = useState([]);
  const [companies, setCompanies] = useState([]); // For Manager filter

  // --- Estados de Carga y Feedback ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- Estado de los Filtros ---
  const [filters, setFilters] = useState({ status: "new", companyId: "" });

  // --- Lógica de Feedback ---
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4000);
  }, []);

  // --- Lógica de Obtención de Datos ---
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Build query params from filters
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.companyId) params.companyId = filters.companyId;

      const response = await apiClient.get("/rewards/requests", { params });
      setRequests(response.data.data.requests || []);

      // If the user is a Manager, also fetch the list of companies for the filter dropdown
      if (userData?.role === "Manager" && companies.length === 0) {
        const companyResponse = await apiClient.get("/companies");
        setCompanies(companyResponse.data.data.companies || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load reward requests.");
    } finally {
      setLoading(false);
    }
  }, [filters, userData?.role, companies.length]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // --- Lógica de Mutación de Datos ---
  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const response = await apiClient.patch(`/rewards/requests/${requestId}`, {
        status: newStatus,
      });
      const updatedRequest = response.data.data.request;

      // Update the local state optimistically for a better UX
      setRequests((prev) =>
        prev.map((req) => (req.id === updatedRequest.id ? updatedRequest : req))
      );
      setSuccess(`Request status updated to "${newStatus}".`);
      clearMessages();
    } catch (err) {
      console.error(`Error updating request ${requestId}:`, err);
      // Re-throw the error so the component can display it
      throw err;
    }
  };

  return {
    requests,
    companies,
    loading,
    error,
    success,
    filters,
    setFilters,
    updateRequestStatus,
    isManager: userData?.role === "Manager",
  };
}

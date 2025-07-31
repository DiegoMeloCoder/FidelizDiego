import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";

export function useManageAnomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({ status: "New" }); // Default to 'New'

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnomalies = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      const limit = 25;
      const offset = (page - 1) * limit;

      const params = { limit, offset };
      // Add filters to params only if they have a value
      if (filters.status) params.status = filters.status;
      if (filters.companyId) params.companyId = filters.companyId;

      try {
        const response = await apiClient.get("/anomalies", { params });
        const data = response.data.data;
        setAnomalies(data.anomalies || []);
        setPagination({
          totalItems: data.totalItems,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
        });
      } catch (err) {
        setError(err.message || "Failed to load anomalies.");
        setAnomalies([]);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  ); // Re-run fetch logic when filters change

  // Fetch data on initial load and whenever filters change
  useEffect(() => {
    fetchAnomalies(1); // Reset to page 1 when filters change
  }, [fetchAnomalies]);

  const updateAnomalyStatus = async (anomalyId, newStatus) => {
    try {
      await apiClient.patch(`/anomalies/${anomalyId}/status`, {
        status: newStatus,
      });
      // Refresh the current page to show the update
      fetchAnomalies(pagination.currentPage);
    } catch (err) {
      // Let the component handle displaying the error via Swal or Alert
      console.error(`Error updating status for anomaly ${anomalyId}:`, err);
      throw err; // Re-throw the error so the component knows it failed
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAnomalies(newPage);
    }
  };

  return {
    anomalies,
    pagination,
    filters,
    loading,
    error,
    updateAnomalyStatus,
    handleFilterChange,
    handlePageChange,
  };
}

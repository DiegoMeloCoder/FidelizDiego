import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/api";

export function useGlobalRedemptionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get(
        "/history/manager/redemptions/global"
      );
      // Aseguramos que siempre sea un array
      setHistory(response.data.data.history || []);
    } catch (err) {
      setError(err.message || "Failed to load global redemption history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error };
}

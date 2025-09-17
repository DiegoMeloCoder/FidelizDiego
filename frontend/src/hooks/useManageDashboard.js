import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";

export function useManagerDashboard() {
  // --- Estados de Datos ---
  const [stats, setStats] = useState({
    companyStats: { total: 0, active: 0, inactive: 0, pending_payment: 0 },
    adminCount: 0,
  });
  const [companies, setCompanies] = useState([]);
  const [extraStats, setExtraStats] = useState({
    commonInterest: { mostCommonInterest: null, count: 0 },
    topRequests: [],
  });

  // --- Estados de UI ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [errorExtra, setErrorExtra] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("global");

  // --- Lógica de Obtención de Datos ---
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Obtener estadísticas principales y la lista de compañías concurrentemente
      const [statsRes, companiesRes] = await Promise.all([
        apiClient.get("/stats/manager"),
        apiClient.get("/companies"),
      ]);
      setStats(statsRes.data.data.stats);
      setCompanies(companiesRes.data.data.companies || []);
    } catch (err) {
      console.error("Error fetching initial manager data:", err);
      setError(err.message || "Failed to load initial dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Efecto para obtener las estadísticas filtradas cuando cambia la selección
  useEffect(() => {
    const fetchExtraStats = async () => {
      setLoadingExtra(true);
      setErrorExtra("");
      const companyQueryParam =
        selectedCompanyId !== "global" ? `?companyId=${selectedCompanyId}` : "";

      try {
        const [interestRes, requestsRes] = await Promise.all([
          apiClient.get(`/stats/company/common-interest${companyQueryParam}`),
          apiClient.get(
            `/stats/company/top-reward-requests${companyQueryParam}`
          ),
        ]);
        setExtraStats({
          commonInterest: interestRes.data.data,
          topRequests: requestsRes.data.data.requests,
        });
      } catch (err) {
        console.error("Error fetching extra manager stats:", err);
        setErrorExtra(err.message || "Failed to load additional stats.");
      } finally {
        setLoadingExtra(false);
      }
    };
    // No ejecutar esta llamada hasta que los datos iniciales (compañías) hayan cargado
    if (!loading) {
      fetchExtraStats();
    }
  }, [selectedCompanyId, loading]);

  // --- Manejadores de Eventos ---
  const handleFilterChange = (event) => {
    setSelectedCompanyId(event.target.value);
  };

  return {
    stats,
    companies,
    extraStats,
    loading,
    error,
    loadingExtra,
    errorExtra,
    selectedCompanyId,
    handleFilterChange,
  };
}

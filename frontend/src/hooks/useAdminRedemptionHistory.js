import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function useAdminRedemptionHistory() {
  const { userData } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    // Solo intentar obtener datos si tenemos la información del admin y su compañía.
    if (!userData?.company?.id) {
      if (userData) {
        setError(
          "La información de la empresa del administrador no está disponible."
        );
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/history/admin/redemptions");

      // Procesar y normalizar los datos recibidos de la API.
      const list = (response.data.data.history || []).map((entry) => ({
        ...entry,
        // Asegurarse de que la fecha sea un objeto Date para formateo consistente.
        fechaCanje: entry.fechaCanje ? new Date(entry.fechaCanje) : null,
      }));

      setHistory(list);
    } catch (err) {
      console.error("Error al obtener el historial de canjes (Admin):", err);
      setError(err.message || "No se pudo cargar el historial de canjes.");
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error };
}

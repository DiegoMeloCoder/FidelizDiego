import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function useAdminPointsHistory() {
  const { userData } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    // Solo intentar obtener datos si tenemos la información del admin y su compañía.
    if (!userData?.company?.id) {
      // Si userData está cargado pero no tiene companyId, es un estado de error.
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
      const response = await apiClient.get("/history/admin/points");

      // Procesar y normalizar los datos recibidos de la API.
      const list = (response.data.data.history || []).map((entry) => ({
        ...entry,
        // Asegurarse de que la fecha sea un objeto Date para formateo consistente.
        fechaAsignacion: entry.fechaAsignacion
          ? new Date(entry.fechaAsignacion)
          : null,
      }));

      setHistory(list);
    } catch (err) {
      console.error("Error al obtener el historial de puntos:", err);
      setError(
        err.message || "No se pudo cargar el historial de asignación de puntos."
      );
    } finally {
      setLoading(false);
    }
  }, [userData]); // El hook depende del objeto userData completo.

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error };
}

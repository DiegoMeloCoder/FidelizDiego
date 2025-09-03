import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function useEmployeeHistory() {
  const { currentUser } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    if (!currentUser) {
      setError("Usuario no ha iniciado sesión.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Obtener ambos historiales al mismo tiempo para eficiencia
      const [assignedResponse, redeemedResponse] = await Promise.all([
        apiClient.get("/history/employee/points"),
        apiClient.get("/history/employee/redemptions"),
      ]);

      // Procesar y normalizar el historial de puntos asignados
      const assignedList = (assignedResponse.data.data.history || []).map(
        (entry) => ({
          id: `assign-${entry.id}`,
          type: "assignment",
          date: entry.fechaAsignacion ? new Date(entry.fechaAsignacion) : null,
          amount: entry.cantidad,
          description: `Puntos asignados por ${
            entry.admin?.nombre || "Admin"
          } (${entry.justificacionTexto})`,
        })
      );

      // Procesar y normalizar el historial de canjes
      const redeemedList = (redeemedResponse.data.data.history || []).map(
        (entry) => ({
          id: `redeem-${entry.id}`,
          type: "redemption",
          date: entry.fechaCanje ? new Date(entry.fechaCanje) : null,
          amount: -entry.puntosCosto,
          description: `Canjeado: ${
            entry.reward?.nombre || "Recompensa desconocida"
          }`,
        })
      );

      // Combinar y ordenar la lista final
      const combinedList = [...assignedList, ...redeemedList];
      combinedList.sort(
        (a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)
      );

      setHistory(combinedList);
    } catch (err) {
      console.error("Error al obtener el historial del empleado:", err);
      setError(err.message || "No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, fetchHistory };
}

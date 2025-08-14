import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function useManageJustifications() {
  const { userData } = useAuth();

  // --- Estado de los Datos ---
  const [justifications, setJustifications] = useState([]);

  // --- Estados de Carga y Feedback ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- Lógica de Feedback ---
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4000);
  }, []);

  // --- Lógica de Obtención de Datos ---
  const fetchJustifications = useCallback(async () => {
    if (!userData?.company?.id) return; // Don't fetch if admin has no company

    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/justifications");
      setJustifications(response.data.data.justifications || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las justificaciones.");
    } finally {
      setLoading(false);
    }
  }, [userData?.company?.id]);

  useEffect(() => {
    fetchJustifications();
  }, [fetchJustifications]);

  // --- Lógica de Mutación de Datos (CRUD) ---
  const addJustification = async (justificationData) => {
    const response = await apiClient.post("/justifications", justificationData);
    const addedJustification = response.data.data.justification;
    // Refetch the list to get the correct sorting from the server
    fetchJustifications();
    setSuccess(
      `Justificación "${addedJustification.textoJustificacion}" agregada exitosamente.`
    );
    clearMessages();
  };

  const updateJustification = async (justificationId, updateData) => {
    const response = await apiClient.put(
      `/justifications/${justificationId}`,
      updateData
    );
    const updatedJustification = response.data.data.justification;
    setJustifications((prev) =>
      prev.map((j) =>
        j.id === updatedJustification.id ? updatedJustification : j
      )
    );
    setSuccess("Justificación actualizada exitosamente.");
    clearMessages();
  };

  const toggleJustificationStatus = async (justification) => {
    const response = await apiClient.patch(
      `/justifications/${justification.id}/toggle-status`
    );
    const updatedJustification = response.data.data.justification;
    setJustifications((prev) =>
      prev.map((j) =>
        j.id === updatedJustification.id ? updatedJustification : j
      )
    );
    setSuccess(response.data.message);
    clearMessages();
  };

  return {
    justifications,
    loading,
    error,
    success,
    addJustification,
    updateJustification,
    toggleJustificationStatus,
    adminCompanyId: userData?.company?.id,
  };
}

import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";

export function useManageAdmins() {
  // --- Estado de los Datos ---
  const [admins, setAdmins] = useState([]);
  const [companies, setCompanies] = useState([]);

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
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Ejecutar ambas llamadas en paralelo para mayor eficiencia
      const [adminsResponse, companiesResponse] = await Promise.all([
        apiClient.get("/admins"),
        apiClient.get("/companies"),
      ]);

      const adminList = adminsResponse.data.data.admins || [];
      const companyList = companiesResponse.data.data.companies || [];

      setAdmins(adminList);
      setCompanies(companyList);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Lógica de Mutación de Datos (CRUD) ---
  const addAdmin = async (adminData) => {
    const response = await apiClient.post("/admins", adminData);
    const addedAdmin = response.data.data.user;
    setAdmins((prev) =>
      [...prev, addedAdmin].sort((a, b) =>
        (a.nombre || "").localeCompare(b.nombre || "")
      )
    );
    setSuccess(`Admin "${addedAdmin.nombre}" created successfully.`);
    clearMessages();
  };

  const updateAdmin = async (adminId, updateData) => {
    const response = await apiClient.put(`/admins/${adminId}`, updateData);
    const updatedAdmin = response.data.data.user;
    setAdmins((prev) =>
      prev.map((admin) => (admin.id === updatedAdmin.id ? updatedAdmin : admin))
    );
    setSuccess(`Admin "${updatedAdmin.nombre}" updated successfully.`);
    clearMessages();
  };

  const toggleAdminStatus = async (admin) => {
    const response = await apiClient.patch(`/admins/${admin.id}/toggle-status`);
    const updatedAdmin = response.data.data.admin;
    setAdmins((prev) =>
      prev.map((adm) => (adm.id === updatedAdmin.id ? updatedAdmin : adm))
    );
    setSuccess(response.data.message);
    clearMessages();
  };

  return {
    admins,
    companies,
    loading,
    error,
    success,
    addAdmin,
    updateAdmin,
    toggleAdminStatus,
  };
}

import { useState, useEffect, useCallback } from "react";
import apiClient, { uploadCompanyLogo } from "../services/api";

export function useManageCompanies() {
  // --- Estado principal de los datos ---
  const [companies, setCompanies] = useState([]);
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
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/companies");
      setCompanies(response.data.data.companies || []);
    } catch (err) {
      setError(err.message || "Failed to load companies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // --- Lógica de Creación ---
  const addCompany = async (companyData, logoFile) => {
    let uploadedLogoUrl = null;
    if (logoFile) {
      try {
        const uploadResponse = await uploadCompanyLogo(logoFile);
        uploadedLogoUrl = uploadResponse.imageUrl;
      } catch (uploadError) {
        throw new AppError(`Logo upload failed: ${uploadError.message}`, 400);
      }
    }

    const payload = {
      ...companyData,
      logoUrl: uploadedLogoUrl,
    };

    const response = await apiClient.post("/companies", payload);
    const addedCompany = response.data.data.company;
    setCompanies((prev) =>
      [...prev, addedCompany].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    setSuccess(`Company "${addedCompany.nombre}" added successfully.`);
    clearMessages();
  };

  // --- Lógica de Actualización ---
  const updateCompany = async (companyId, updateData, logoFile, removeLogo) => {
    let logoUrlPayload;
    if (logoFile) {
      try {
        const uploadResponse = await uploadCompanyLogo(logoFile);
        logoUrlPayload = uploadResponse.imageUrl;
      } catch (uploadError) {
        throw new AppError(`Logo upload failed: ${uploadError.message}`, 400);
      }
    } else if (removeLogo) {
      logoUrlPayload = null;
    }

    const payload = { ...updateData };
    if (logoUrlPayload !== undefined) {
      payload.logoUrl = logoUrlPayload;
    }

    const response = await apiClient.put(`/companies/${companyId}`, payload);
    const updatedCompany = response.data.data.company;
    setCompanies((prev) =>
      prev.map((c) => (c.id === updatedCompany.id ? updatedCompany : c))
    );
    setSuccess(`Company "${updatedCompany.nombre}" updated successfully.`);
    clearMessages();
  };

  // --- Lógica de Cambio de Estado ---
  const toggleCompanyStatus = async (company) => {
    const response = await apiClient.patch(
      `/companies/${company.id}/toggle-status`
    );
    const updatedCompany = response.data.data.company;
    setCompanies((prev) =>
      prev.map((c) => (c.id === updatedCompany.id ? updatedCompany : c))
    );
    setSuccess(response.data.message);
    clearMessages();
  };

  // El hook devuelve el estado y las funciones que el componente necesita
  return {
    companies,
    loading,
    error,
    success,
    fetchCompanies,
    addCompany,
    updateCompany,
    toggleCompanyStatus,
  };
}

// Helper para AppError
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

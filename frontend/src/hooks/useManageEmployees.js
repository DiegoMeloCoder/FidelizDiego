import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";
import Swal from "sweetalert2";

// Helper para AppError si no lo tienes en el frontend
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function useManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [engagementScores, setEngagementScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingScores, setLoadingScores] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4000);
  }, []);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const empResponse = await apiClient.get("/employees");
      const empList = empResponse.data.data.employees || [];
      setEmployees(empList);

      if (empList.length > 0) {
        setLoadingScores(true);
        try {
          const scoreResponse = await apiClient.get("/engagement/scores");
          const scoreMap = (scoreResponse.data || []).reduce(
            (acc, scoreData) => {
              acc[scoreData.employeeId] = scoreData.engagementScore;
              return acc;
            },
            {}
          );
          setEngagementScores(scoreMap);
        } catch (scoreErr) {
          console.error("Error al obtener puntajes de engagement:", scoreErr);
        } finally {
          setLoadingScores(false);
        }
      }
    } catch (err) {
      setError(err.message || "No se pudieron cargar los empleados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const addEmployee = async (employeeData) => {
    const response = await apiClient.post("/employees", employeeData);
    const addedEmployee = response.data.data.user;
    setEmployees((prev) =>
      [...prev, addedEmployee].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    setSuccess(`Empleado "${addedEmployee.nombre}" agregado exitosamente.`);
    clearMessages();
  };

  const updateEmployee = async (employeeId, updateData) => {
    const response = await apiClient.put(
      `/employees/${employeeId}`,
      updateData
    );
    const updatedEmployee = response.data.data.user;
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
    );
    setSuccess(
      `Empleado "${updatedEmployee.nombre}" actualizado exitosamente.`
    );
    clearMessages();
  };

  const toggleEmployeeStatus = async (employee) => {
    const response = await apiClient.patch(
      `/employees/${employee.id}/toggle-status`
    );
    const updatedEmployee = response.data.data.employee;
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
    );
    setSuccess(response.data.message);
    clearMessages();
  };

  const bulkUploadEmployees = async (employeesToUpload) => {
    const response = await apiClient.post(
      "/employees/bulk-upload",
      employeesToUpload
    );
    const backendResults = response.data.data;
    fetchEmployees(); // Recargar la lista completa para reflejar todos los cambios
    return backendResults;
  };

  return {
    employees,
    engagementScores,
    loading,
    loadingScores,
    error,
    success,
    addEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    bulkUploadEmployees,
  };
}

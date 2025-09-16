import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";

// Helper para obtener el rango de fechas del último mes
const getLastMonthRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  startDate.setDate(1);
  endDate.setDate(0);
  const formatDate = (date) => date.toISOString().split("T")[0];
  return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
};

export function useAdminDashboard() {
  const { userData, authLoading } = useAuth();

  // --- Estados del Dashboard (Estadísticas y UI) ---
  const [stats, setStats] = useState({ employeeCount: 0, rewardCount: 0 });
  const [commonInterest, setCommonInterest] = useState({
    mostCommonInterest: null,
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Estados del Modal de Asignación ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    employees: [],
    justifications: [],
  });
  const [loadingModalData, setLoadingModalData] = useState(false);

  // --- Estados del Generador de Reportes ---
  const [reportDates, setReportDates] = useState(getLastMonthRange());
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [generatedReport, setGeneratedReport] = useState(null);

  // --- Lógica para Obtener Datos del Dashboard ---
  const fetchDashboardData = useCallback(async () => {
    if (!userData?.company?.id) {
      if (userData)
        setError(
          "La información de la empresa no está disponible para cargar el panel."
        );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [statsRes, interestRes] = await Promise.all([
        apiClient.get("/stats/admin"),
        apiClient.get("/stats/company/common-interest"),
      ]);
      setStats(statsRes.data.data.stats);
      setCommonInterest(interestRes.data.data);
    } catch (err) {
      console.error("Error al obtener los datos del dashboard:", err);
      setError(err.message || "No se pudieron cargar los datos del panel.");
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading, fetchDashboardData]);

  // --- Lógica para el Modal de Asignación de Puntos ---
  const openAssignPointsModal = useCallback(async () => {
    setIsModalOpen(true);
    setLoadingModalData(true);
    try {
      const [empRes, justRes] = await Promise.all([
        apiClient.get("/employees"),
        apiClient.get("/justifications"),
      ]);
      setModalData({
        employees: empRes.data.data.employees.filter((e) => e.isActive),
        justifications: justRes.data.data.justifications.filter(
          (j) => j.estaActiva
        ),
      });
    } catch (err) {
      // Usar Swal para un error crítico dentro del modal
      Swal.fire(
        "Error",
        "No se pudieron cargar los datos necesarios para asignar puntos.",
        "error"
      );
      setIsModalOpen(false); // Cerrar el modal si los datos no se pueden cargar
    } finally {
      setLoadingModalData(false);
    }
  }, []);

  const closeAssignPointsModal = () => setIsModalOpen(false);

  // --- Lógica para el Generador de Reportes ---
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReportError("");
    setGeneratedReport(null);
    try {
      const response = await apiClient.post("/reports/generate", {
        startDate: reportDates.startDate,
        endDate: reportDates.endDate,
      });
      setGeneratedReport(response.data);
    } catch (err) {
      setReportError(err.message || "No se pudo generar el reporte.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // --- Retornar un objeto limpio con el estado y los manejadores ---
  return {
    // Datos y estados del Dashboard
    stats,
    commonInterest,
    loading: loading || authLoading,
    error,
    companyName: userData?.company?.nombre,

    // Propiedades y manejadores del Modal
    isModalOpen,
    openAssignPointsModal,
    closeAssignPointsModal,
    modalData,
    loadingModalData,

    // Propiedades y manejadores del Reporte
    reportDates,
    setReportDates,
    isGeneratingReport,
    reportError,
    generatedReport,
    handleGenerateReport,
  };
}

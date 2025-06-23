import { useState, useEffect } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2
import { useAuth } from "../../contexts/AuthContext.jsx";
// Firestore imports removed
import apiClient from "../../services/api"; // Import API client
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
// Added HeartIcon for common interest
import {
  UsersIcon,
  GiftIcon,
  PlusCircleIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

// Helper function to get default dates (e.g., last month)
const getLastMonthRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  startDate.setDate(1); // Start from the 1st of last month
  endDate.setDate(0); // End on the last day of last month

  // Format as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split("T")[0];
  return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
};

function AdminDashboard() {
  const { currentUser, userData, loading: authLoading } = useAuth(); // userData now contains company info { id, nombre, status }
  // const [companyName, setCompanyName] = useState(''); // No longer needed, use userData.company.nombre
  // const [loadingCompany, setLoadingCompany] = useState(true); // No longer needed
  const [stats, setStats] = useState({ employeeCount: 0, rewardCount: 0 }); // Initialize with 0 or null
  const [loadingStats, setLoadingStats] = useState(true); // Start loading stats
  const [statsError, setStatsError] = useState("");
  const [commonInterest, setCommonInterest] = useState({
    mostCommonInterest: null,
    count: 0,
  }); // State for common interest
  const [loadingInterest, setLoadingInterest] = useState(true); // Loading state for interest
  const [interestError, setInterestError] = useState(""); // Error state for interest

  // State for Assign Points Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [justifications, setJustifications] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedJustificationId, setSelectedJustificationId] = useState("");
  const [pointsToAssign, setPointsToAssign] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [loadingModalData, setLoadingModalData] = useState(false);
  const [pointsSuggestion, setPointsSuggestion] = useState(""); // State for suggestion text
  const [loadingSuggestion, setLoadingSuggestion] = useState(false); // State for suggestion loading
  const [generatedMessages, setGeneratedMessages] = useState([]); // State for AI message suggestions
  const [loadingMessageGen, setLoadingMessageGen] = useState(false); // State for message generation loading
  const [messageGenError, setMessageGenError] = useState(""); // State for message generation error
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null); // Track which message index was copied

  // State for AI Report Generation
  const defaultDates = getLastMonthRange();
  const [reportStartDate, setReportStartDate] = useState(
    defaultDates.startDate
  );
  const [reportEndDate, setReportEndDate] = useState(defaultDates.endDate);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [generatedReport, setGeneratedReport] = useState(null); // { summary: '...', data: {...} }

  // Fetch company name - Removed, now comes from userData.company.nombre

  // Fetch stats - Ahora usa la API
  useEffect(() => {
    const fetchStats = async () => {
      if (userData?.company?.id) {
        setLoadingStats(true); // Set loading true before fetch
        setStatsError("");
        try {
          const response = await apiClient.get("/stats/admin");
          setStats(response.data); // Guardar los datos recibidos (employeeCount, rewardCount)
        } catch (error) {
          console.error("Error fetching dashboard stats:", error);
          setStatsError(
            error.message || "No se pudieron cargar las estadísticas."
          );
          setStats({ employeeCount: "Err", rewardCount: "Err" });
        } finally {
          setLoadingStats(false);
        }
      } else {
        setLoadingStats(false);
        if (!authLoading) {
          setStatsError(
            "Los datos de la empresa del usuario no están disponibles para cargar estadísticas."
          );
          setInterestError(
            "Los datos de la empresa del usuario no están disponibles para cargar intereses."
          );
        }
      }
    };

    const fetchCommonInterest = async () => {
      if (userData?.company?.id) {
        setLoadingInterest(true);
        setInterestError("");
        try {
          const response = await apiClient.get(
            "/stats/company/common-interest"
          );
          setCommonInterest(response.data);
        } catch (error) {
          console.error("Error fetching common interest:", error);
          setInterestError(
            error.message || "No se pudo cargar el interés principal."
          );
          setCommonInterest({ mostCommonInterest: "Err", count: 0 });
        } finally {
          setLoadingInterest(false);
        }
      } else {
        setLoadingInterest(false);
        if (!authLoading) {
          setInterestError(
            "Los datos de la empresa del usuario no están disponibles para cargar intereses."
          );
        }
      }
    };

    // Fetch stats and common interest only if userData is available and not authLoading
    if (userData && !authLoading) {
      fetchStats();
      fetchCommonInterest();
    } else if (!authLoading && !userData) {
      // Handle case where user data failed to load in AuthContext
      setLoadingStats(false);
      setLoadingInterest(false);
      setStatsError(
        "Los datos del usuario no están disponibles para cargar estadísticas."
      );
      setInterestError(
        "Los datos del usuario no están disponibles para cargar intereses."
      );
    }
    // If authLoading is true, we wait for userData
  }, [userData, authLoading]); // Depender de userData y authLoading

  // Fetch employees and justifications when modal is opened
  useEffect(() => {
    const fetchModalData = async () => {
      if (isModalOpen && userData?.company?.id) {
        setLoadingModalData(true);
        setAssignError("");
        setEmployees([]);
        setJustifications([]);
        try {
          const empResponse = await apiClient.get("/employees");
          const activeEmpList = empResponse.data.data.employees.filter(
            (emp) => emp.isActive !== false
          );
          setEmployees(activeEmpList);
          if (activeEmpList.length > 0)
            setSelectedEmployeeId(activeEmpList[0].id);

          const justResponse = await apiClient.get("/justifications");
          // Filter only active justifications for selection
          const activeJustList = justResponse.data.data.justifications.filter(
            (jus) => jus.estaActiva !== false
          );
          setJustifications(activeJustList);
          if (activeJustList.length > 0)
            setSelectedJustificationId(activeJustList[0].id);
        } catch (err) {
          console.error("Error fetching modal data:", err);
          setAssignError(
            err.message || "No se pudieron cargar los datos para el modal."
          );
        } finally {
          setLoadingModalData(false);
        }
      }
    };
    fetchModalData();
    // Reset suggestion when modal opens
    if (isModalOpen) {
      setPointsSuggestion("");
    }
  }, [isModalOpen, userData?.company?.id]);

  // Fetch points suggestion when justification changes
  useEffect(() => {
    const fetchSuggestion = async () => {
      if (selectedJustificationId && isModalOpen) {
        // Only fetch if modal is open and justification selected
        setLoadingSuggestion(true);
        setPointsSuggestion("");
        try {
          const response = await apiClient.get(
            `/points/suggestions/justification/${selectedJustificationId}`
          );
          if (response.data?.data.suggestion) {
            // Check if suggestion data exists
            setPointsSuggestion(response.data.data.message); // Set the suggestion text
          } else {
            setPointsSuggestion("");
          }
        } catch (error) {
          console.error("Error fetching points suggestion:", error);
          setPointsSuggestion("");
        } finally {
          setLoadingSuggestion(false);
        }
      } else {
        setPointsSuggestion("");
      }
    };

    fetchSuggestion();
  }, [selectedJustificationId, isModalOpen]);

  // Handle Assign Points Submission
  const handleAssignPoints = async (e) => {
    e.preventDefault();
    const points = parseInt(pointsToAssign, 10);
    if (
      !selectedEmployeeId ||
      !selectedJustificationId ||
      isNaN(points) ||
      points === 0
    ) {
      setAssignError(
        "Por favor selecciona un empleado, una justificación y escribe una cantidad válida de puntos."
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor selecciona un empleado, una justificación y escribe una cantidad válida de puntos.",
        confirmButtonText: "OK",
      });
      return;
    }
    setAssigning(true);
    setAssignError("");
    try {
      // Call backend API to assign points
      const response = await apiClient.post("/points/assign", {
        empleadoId: selectedEmployeeId,
        cantidad: points,
        justificacionId: parseInt(selectedJustificationId), // Ensure ID is integer
      });

      // Optionally update local state or show success based on response
      const assignedData = response.data.data;
      const employeeName =
        employees.find((e) => e.id === selectedEmployeeId)?.nombre ||
        "empleado";
      Swal.fire({
        icon: "success",
        title: "¡Puntos Asignados!",
        text: `Se asignaron exitosamente ${assignedData.assignment.cantidad} puntos a ${employeeName}. Nuevo saldo: ${assignedData.employeeNewBalance}`,
        confirmButtonText: "OK",
      });
      closeModal();
    } catch (err) {
      console.error("Error assigning points:", err);
      setAssignError(err.message || "No se pudieron asignar los puntos.");
    } finally {
      setAssigning(false);
    }
  };

  // Handle AI Report Generation
  const handleGenerateReport = async () => {
    if (!reportStartDate || !reportEndDate) {
      setReportError("Por favor selecciona ambas fechas: inicio y fin.");
      return;
    }
    setIsGeneratingReport(true);
    setReportError("");
    setGeneratedReport(null); // Clear previous report

    try {
      const response = await apiClient.post("/reports/generate", {
        startDate: reportStartDate,
        endDate: reportEndDate,
      });
      setGeneratedReport(response.data); // Store { summary, data, startDate, endDate }
    } catch (err) {
      console.error("Error generating AI report:", err);
      setReportError(
        err.response?.data?.message ||
          err.message ||
          "No se pudo generar el reporte."
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Handle PDF Export
  const handleExportReport = () => {
    Swal.fire({
      icon: "info",
      title: "Funcionalidad en Progreso",
      text: "La funcionalidad de exportar a PDF aún no está implementada.",
      confirmButtonText: "OK",
    });
    // Use generatedReport.summary and generatedReport.data
    // Library like html2pdf.js or jsPDF could be used here
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployeeId("");
    setSelectedJustificationId("");
    setPointsToAssign("");
    setAssignError("");
    setPointsSuggestion(""); // Clear suggestion on close
    setLoadingSuggestion(false); // Reset loading state
    setGeneratedMessages([]); // Clear generated messages on close
    setMessageGenError(""); // Clear message gen error on close
    setCopiedMessageIndex(null); // Clear copied index on close
  };

  // Handle Copy Message
  const handleCopyMessage = (text, index) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedMessageIndex(index);
        setTimeout(() => setCopiedMessageIndex(null), 1500); // Clear after 1.5 seconds
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        // Optionally show an error alert to the user
      });
  };

  // Handle AI Recognition Message Generation
  const handleGenerateMessage = async () => {
    const employee = employees.find((e) => e.id === selectedEmployeeId);
    const justification = justifications.find(
      (j) => j.id === parseInt(selectedJustificationId)
    );
    const points = parseInt(pointsToAssign);

    if (!employee || !justification || isNaN(points) || points === 0) {
      setMessageGenError(
        "Por favor selecciona un empleado, una justificación y escribe una cantidad válida de puntos antes de generar un mensaje."
      );
      setGeneratedMessages([]);
      return;
    }

    setLoadingMessageGen(true);
    setMessageGenError("");
    setGeneratedMessages([]);

    try {
      const response = await apiClient.post("/points/generate-message", {
        employeeName: employee.nombre || employee.email, // Use name or email
        justificationText: justification.textoJustificacion,
        points: points,
      });
      setGeneratedMessages(response.data.suggestions || []);
    } catch (err) {
      console.error("Error generating recognition message:", err);
      setMessageGenError(
        err.response?.data?.message ||
          err.message ||
          "No se pudo generar el mensaje."
      );
      setGeneratedMessages([]);
    } finally {
      setLoadingMessageGen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* Apply brand-secondary to page title */}
          <h1 className="text-3xl font-bold text-brand-secondary">
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-1">
            {/* Display company name from userData */}
            {userData?.company?.nombre ||
              (userData ? "Sin Empresa Asignada" : <Spinner size="xs" />)}
          </p>
        </div>
        <Button
          onClick={openModal}
          variant="primary"
          className="w-full sm:w-auto inline-flex items-center justify-center"
        >
          <PlusCircleIcon className="h-5 w-5 mr-1.5" />
          Asignar Puntos
        </Button>
      </div>

      {/* Stats Section */}
      {/* Combined Loading/Error state for initial stats */}
      {(loadingStats || loadingInterest) && (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      )}
      {statsError && <Alert type="error">{statsError}</Alert>}
      {interestError && <Alert type="error">{interestError}</Alert>}
      {/* Grid for Stats - Show only when all data is loaded and no errors */}
      {!loadingStats &&
        !statsError &&
        !loadingInterest &&
        !interestError &&
        userData?.company?.id && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {" "}
            {/* Changed to 3 cols */}
            {/* Active Employees Card - Apply brand colors */}
            <div className="bg-white p-5 rounded-lg shadow border border-brand-tertiary flex items-center space-x-4">
              <div className="bg-brand-tertiary p-3 rounded-full">
                {" "}
                {/* Use brand-tertiary for icon bg */}
                <UsersIcon className="h-6 w-6 text-brand-primary" />{" "}
                {/* Use brand-primary for icon color */}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Empleados Activos
                </p>
                <p className="text-2xl font-semibold text-gray-800">
                  {stats.employeeCount}
                </p>
              </div>
            </div>
            {/* Active Rewards Card - Apply brand colors */}
            <div className="bg-white p-5 rounded-lg shadow border border-brand-tertiary flex items-center space-x-4">
              {" "}
              {/* Use brand-tertiary for border */}
              <div className="bg-brand-tertiary p-3 rounded-full">
                {" "}
                {/* Use brand-tertiary for icon bg */}
                <GiftIcon className="h-6 w-6 text-brand-primary" />{" "}
                {/* Use brand-primary for icon color */}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Recompensas Activas
                </p>
                <p className="text-2xl font-semibold text-gray-800">
                  {stats.rewardCount}
                </p>
              </div>
            </div>
            {/* Common Interest Card */}
            <div className="bg-white p-5 rounded-lg shadow border border-brand-tertiary flex items-center space-x-4">
              <div className="bg-brand-tertiary p-3 rounded-full">
                <HeartIcon className="h-6 w-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Interés Principal del Equipo
                </p>
                <p className="text-2xl font-semibold text-gray-800 capitalize">
                  {commonInterest.mostCommonInterest || "N/A"}
                  {commonInterest.count > 0 && (
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      ({commonInterest.count} votos)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* --- AI Report Generation Section --- */}
      <div className="bg-white p-5 rounded-lg shadow border border-gray-200 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <DocumentChartBarIcon className="h-6 w-6 mr-2 text-brand-primary" />
          Generar Reporte con IA
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Date Inputs */}
          <div>
            <label
              htmlFor="report-start-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de Inicio
            </label>
            <Input
              id="report-start-date"
              type="date"
              value={reportStartDate}
              onChange={(e) => setReportStartDate(e.target.value)}
              className="w-full"
              disabled={isGeneratingReport}
            />
          </div>
          <div>
            <label
              htmlFor="report-end-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de Fin
            </label>
            <Input
              id="report-end-date"
              type="date"
              value={reportEndDate}
              onChange={(e) => setReportEndDate(e.target.value)}
              className="w-full"
              disabled={isGeneratingReport}
            />
          </div>
          {/* Generate Button */}
          <Button
            onClick={handleGenerateReport}
            variant="primary"
            disabled={isGeneratingReport || !userData?.company?.id}
            className="w-full inline-flex items-center justify-center"
          >
            {isGeneratingReport ? (
              <Spinner size="sm" color="text-white" className="mr-2" />
            ) : (
              <DocumentChartBarIcon className="h-5 w-5 mr-1.5" />
            )}
            {isGeneratingReport ? "Generando..." : "Generar Reporte"}
          </Button>
        </div>

        {/* Error Display */}
        {reportError && <Alert type="error">{reportError}</Alert>}

        {/* Report Display Area */}
        {generatedReport && !isGeneratingReport && (
          <div className="mt-4 border-t border-gray-200 pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">
                Reporte del {generatedReport.data.period?.startDate} al{" "}
                {generatedReport.data.period?.endDate}
              </h3>
              <Button
                onClick={handleExportReport}
                variant="secondary"
                size="sm"
                className="inline-flex items-center"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
                Exportar PDF
              </Button>
            </div>
            {/* Display AI Summary */}
            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded border border-gray-200">
              {/* Render the summary, handling newlines */}
              {generatedReport.summary.split("\n").map((line, index) => (
                <p
                  key={index}
                  className={line.startsWith("**") ? "font-semibold" : ""}
                >
                  {line.replace(/\*\*/g, "")}{" "}
                  {/* Remove markdown bold for now */}
                </p>
              ))}
            </div>
            {/* TODO: Add Charts using generatedReport.data */}
            {/* <div className="mt-4">
                      <p className="text-sm text-gray-500">(Charts based on report data will be displayed here)</p>
                  </div> */}
          </div>
        )}
      </div>
      {/* --- End AI Report Generation Section --- */}

      {/* Welcome Message (Optional) */}
      {/* <p className="text-gray-600 text-lg">
        Welcome, {currentUser?.email || 'Admin'}! Manage employees and rewards for your company.
      </p> */}

      {/* Assign Points Modal - Refined */}
      {/* Modal para Asignar Puntos */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Asignar Puntos a un Empleado"
      >
        <form onSubmit={handleAssignPoints} className="space-y-4">
          {loadingModalData ? (
            <div className="flex justify-center items-center p-8">
              <Spinner size="md" />
            </div>
          ) : employees.length === 0 ? (
            <Alert type="warning">
              No se encontraron empleados activos para esta empresa.
            </Alert>
          ) : justifications.length === 0 ? (
            <Alert type="warning">
              No se encontraron justificaciones activas. Por favor, agrega o
              activa justificaciones primero.
            </Alert>
          ) : (
            <>
              {/* Seleccionar Empleado */}
              <div>
                <label
                  htmlFor="employee-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Seleccionar Empleado
                </label>
                <select
                  id="employee-select"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre || emp.email}
                    </option>
                  ))}
                </select>
              </div>
              {/* Seleccionar Justificación */}
              <div>
                <label
                  htmlFor="justification-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Seleccionar Justificación
                </label>
                <select
                  id="justification-select"
                  value={selectedJustificationId}
                  onChange={(e) => setSelectedJustificationId(e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  {justifications.map((jus) => (
                    <option key={jus.id} value={jus.id}>
                      {jus.textoJustificacion}
                    </option>
                  ))}
                </select>
                {/* Mostrar Sugerencia */}
                {loadingSuggestion && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Spinner size="xs" className="mr-1" /> Cargando
                    sugerencia...
                  </p>
                )}
                {pointsSuggestion && !loadingSuggestion && (
                  <p className="text-xs text-gray-600 bg-gray-100 p-1.5 rounded mt-1 border border-gray-200">
                    💡 {pointsSuggestion}
                  </p>
                )}
              </div>
              {/* Puntos a Asignar */}
              <div>
                <label
                  htmlFor="points-assign"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Puntos a Asignar (+/-)
                </label>
                <Input
                  id="points-assign"
                  type="number"
                  value={pointsToAssign}
                  onChange={(e) => setPointsToAssign(e.target.value)}
                  placeholder="ej: 50 o -10"
                  required
                  className="mt-0 w-full"
                />
                {/* Botón para Generar Mensaje */}
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateMessage}
                    disabled={
                      loadingMessageGen ||
                      !selectedEmployeeId ||
                      !selectedJustificationId ||
                      !pointsToAssign ||
                      isNaN(parseInt(pointsToAssign))
                    }
                    className="inline-flex items-center"
                  >
                    {loadingMessageGen ? (
                      <Spinner size="xs" className="mr-1.5" />
                    ) : (
                      <SparklesIcon className="h-4 w-4 mr-1.5" />
                    )}
                    {loadingMessageGen
                      ? "Generando..."
                      : "Generar Mensaje (IA)"}
                  </Button>
                </div>
                {/* Mostrar Mensajes Generados */}
                {messageGenError && (
                  <Alert type="error" className="mt-2">
                    {messageGenError}
                  </Alert>
                )}
                {generatedMessages.length > 0 && !loadingMessageGen && (
                  <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-md space-y-2">
                    <p className="text-sm font-medium text-indigo-700 mb-1">
                      Mensajes Sugeridos:
                    </p>
                    <div className="space-y-1.5">
                      {generatedMessages.map((msg, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm text-indigo-800 bg-indigo-100/50 p-2 rounded"
                        >
                          <span>{msg}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => handleCopyMessage(msg, index)}
                            className="ml-2 !p-1 text-indigo-600 hover:bg-indigo-200"
                            title="Copiar mensaje"
                          >
                            {copiedMessageIndex === index ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-indigo-600 pt-1">
                      Haz clic en el ícono para copiar un mensaje.
                    </p>
                  </div>
                )}
              </div>
              {/* Mostrar Error de Asignación */}
              {assignError && <Alert type="error">{assignError}</Alert>}
              {/* Botones de Acción */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  disabled={assigning}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={assigning}
                  className="inline-flex items-center"
                >
                  {assigning ? (
                    <Spinner size="sm" color="text-white" className="mr-2" />
                  ) : (
                    <PlusCircleIcon className="h-5 w-5 mr-1.5" />
                  )}
                  {assigning ? "Asignando..." : "Asignar Puntos"}
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>
      {/* Removed <style jsx> block */}
    </div>
  );
}

export default AdminDashboard;

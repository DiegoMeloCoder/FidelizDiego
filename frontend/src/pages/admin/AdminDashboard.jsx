import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import { DashboardStats } from "../../components/dashboard/DashboardStats";
import { AssignPointsModal } from "../../components/dashboard/AssignPointsModal";
import { ReportGenerator } from "../../components/dashboard/ReportGenerator";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

function AdminDashboard() {
  // El hook ahora maneja toda la lógica compleja y el estado.
  const {
    companyName,
    stats,
    commonInterest,
    loading,
    error,
    isModalOpen,
    openAssignPointsModal,
    closeAssignPointsModal,
    modalData,
    loadingModalData,
    reportData,
    handleDatesChange,
    handleGenerateReport,
  } = useAdminDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-secondary">
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-1">
            {companyName || <Spinner size="xs" />}
          </p>
        </div>
        <Button
          onClick={openAssignPointsModal}
          variant="primary"
          className="w-full sm:w-auto"
        >
          <PlusCircleIcon className="h-5 w-5 mr-1.5" />
          Asignar Puntos
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center p-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <DashboardStats stats={stats} commonInterest={commonInterest} />
      )}

      <ReportGenerator
        dates={reportData.dates}
        onDatesChange={handleDatesChange}
        onGenerate={handleGenerateReport}
        isGenerating={reportData.isGenerating}
        error={reportData.error}
        report={reportData.report}
      />

      <AssignPointsModal
        isOpen={isModalOpen}
        onClose={closeAssignPointsModal}
        employees={modalData.employees}
        justifications={modalData.justifications}
        loadingData={loadingModalData}
      />
    </div>
  );
}

export default AdminDashboard;

import { useManagerDashboard } from "../../hooks/useManagerDashboard";
import {
  ManagerStatsCards,
  EngagementStats,
} from "../../components/dashboard/ManagerDashboard";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";

function ManagerDashboard() {
  const { currentUser } = useAuth();
  const {
    stats,
    companies,
    extraStats,
    loading,
    error,
    loadingExtra,
    errorExtra,
    selectedCompanyId,
    handleFilterChange,
  } = useManagerDashboard();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
      <p className="text-gray-600 text-lg">
        Welcome back, {currentUser?.email || "Manager"}! Overview of the
        platform status.
      </p>

      {loading && (
        <div className="flex justify-center p-10">
          <Spinner size="lg" />
        </div>
      )}
      {error && <Alert type="error">{error}</Alert>}
      {!loading && !error && <ManagerStatsCards stats={stats} />}

      {!loading && !error && (
        <EngagementStats
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          onFilterChange={handleFilterChange}
          extraStats={extraStats}
          loading={loadingExtra}
          error={errorExtra}
        />
      )}
    </div>
  );
}

export default ManagerDashboard;

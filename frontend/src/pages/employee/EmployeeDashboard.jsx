import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  StarIcon,
  GiftIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

function EmployeeDashboard() {
  const { currentUser, userData, loading: authLoading } = useAuth();

  const displayName = userData?.nombre || currentUser?.email || "Employee";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-brand-secondary">
        ¡Bienvenido, {displayName}!
      </h1>

      <div className="bg-brand-primary text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80 uppercase tracking-wider">
            Tu Saldo de Puntos
          </p>
          <p className="text-4xl font-bold mt-1 text-white">
            {authLoading ? (
              <span className="text-2xl animate-pulse">...</span>
            ) : (
              userData?.points ?? 0
            )}
          </p>
        </div>
        <StarIcon className="h-12 w-12 text-yellow-300 opacity-80" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/employee/rewards" className="block group">
          <div className="bg-white p-5 rounded-lg shadow border border-brand-tertiary hover:shadow-md transition-shadow duration-200 flex items-center space-x-4">
            <div className="bg-brand-tertiary p-3 rounded-full">
              <GiftIcon className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 group-hover:text-brand-primary transition-colors duration-200">
                Ver Catálogo de Recompensas
              </p>
              <p className="text-sm text-gray-500">
                Explora y redime las recompensas disponibles.
              </p>
            </div>
          </div>
        </Link>

        <Link to="/employee/history" className="block group">
          <div className="bg-white p-5 rounded-lg shadow border border-brand-tertiary hover:shadow-md transition-shadow duration-200 flex items-center space-x-4">
            <div className="bg-brand-tertiary p-3 rounded-full">
              <ClipboardDocumentListIcon className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 group-hover:text-brand-primary transition-colors duration-200">
                Ver Mi Historial
              </p>
              <p className="text-sm text-gray-500">
                Consulta tu historial de puntos y canjes.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Placeholder for recent activity feed */}
      {/* <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Recent Activity</h2>
         List recent point gains/redemptions here
      </div> */}
    </div>
  );
}

export default EmployeeDashboard;

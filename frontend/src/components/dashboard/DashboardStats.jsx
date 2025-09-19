import { UsersIcon, GiftIcon, HeartIcon } from "@heroicons/react/24/outline";

/**
 * Componente para mostrar las tarjetas de estadísticas del dashboard.
 * Recibe los datos como props y se encarga únicamente de la presentación.
 */
export function DashboardStats({ stats, commonInterest }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div className="bg-white p-5 rounded-lg shadow border border-tertiary flex items-center space-x-4">
        <div className="bg-tertiary p-3 rounded-full">
          <UsersIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Empleados Activos</p>
          <p className="text-2xl font-semibold text-gray-800">
            {stats.employeeCount}
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg shadow border border-tertiary flex items-center space-x-4">
        <div className="bg-tertiary p-3 rounded-full">
          <GiftIcon className="h-6 w-6 text-primary" />
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

      <div className="bg-white p-5 rounded-lg shadow border border-tertiary flex items-center space-x-4">
        <div className="bg-tertiary p-3 rounded-full">
          <HeartIcon className="h-6 w-6 text-primary" />
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
  );
}

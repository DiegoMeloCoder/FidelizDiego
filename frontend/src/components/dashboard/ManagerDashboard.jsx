import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import {
  BuildingOffice2Icon,
  CheckCircleIcon,
  XCircleIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

/**
 * Muestra las tarjetas de estadísticas principales del Manager.
 */
export function ManagerStatsCards({ stats }) {
  const { companyStats } = stats;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <div className="bg-white p-5 rounded-lg shadow border flex items-center space-x-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <BuildingOffice2Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Total Companies</p>
          <p className="text-2xl font-semibold text-gray-800">
            {companyStats.total}
          </p>
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg shadow border flex items-center space-x-4">
        <div className="bg-green-100 p-3 rounded-full">
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Active Companies</p>
          <p className="text-2xl font-semibold text-gray-800">
            {companyStats.active}
          </p>
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg shadow border flex items-center space-x-4">
        <div className="bg-red-100 p-3 rounded-full">
          <XCircleIcon className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">
            Inactive Companies
          </p>
          <p className="text-2xl font-semibold text-gray-800">
            {companyStats.inactive}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Muestra las estadísticas de engagement filtrables.
 */
export function EngagementStats({
  companies,
  selectedCompanyId,
  onFilterChange,
  extraStats,
  loading,
  error,
}) {
  const selectedCompanyName =
    selectedCompanyId === "global"
      ? "Global"
      : companies.find((c) => c.id === parseInt(selectedCompanyId, 10))
          ?.nombre || "Selected Company";

  return (
    <div className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="company-filter"
          className="block text-sm font-medium text-gray-700"
        >
          Filter Stats by Company:
        </label>
        <select
          id="company-filter"
          name="company-filter"
          className="mt-1 block w-full md:w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={selectedCompanyId}
          onChange={onFilterChange}
          disabled={loading}
        >
          <option value="global">All Companies (Global)</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.nombre}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      )}
      {error && <Alert type="error">{error}</Alert>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white p-5 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <HeartIcon className="h-5 w-5 mr-2 text-pink-500" />
              Most Common Interest ({selectedCompanyName})
            </h3>
            {extraStats.commonInterest?.mostCommonInterest ? (
              <p className="text-2xl font-semibold text-gray-800 capitalize">
                {extraStats.commonInterest.mostCommonInterest}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  ({extraStats.commonInterest.count} employees)
                </span>
              </p>
            ) : (
              <p className="text-gray-500 italic">
                No interest data available.
              </p>
            )}
          </div>
          <div className="bg-white p-5 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-cyan-500" />
              Top Reward Requests ({selectedCompanyName})
            </h3>
            {extraStats.topRequests?.length > 0 ? (
              <ul className="space-y-1 text-sm text-gray-700">
                {extraStats.topRequests.map((req, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {index + 1}. {req.requestedItem}
                    </span>
                    <span className="font-medium">{req.count} requests</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No new reward requests.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
// Firestore imports removed
import apiClient from "../../services/api"; // Import API client
import { useAuth } from "../../contexts/AuthContext.jsx";
import Spinner from "../../components/ui/Spinner";
// Added HeartIcon, ChatBubbleLeftRightIcon
import {
  BuildingOffice2Icon,
  CheckCircleIcon,
  XCircleIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

function ManagerDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    companyStats: { total: 0, active: 0, inactive: 0, pending_payment: 0 },
    adminCount: 0,
  });
  const [loading, setLoading] = useState(true); // Loading for main stats
  const [error, setError] = useState(null); // Error for main stats
  const [companies, setCompanies] = useState([]); // State for company list
  const [loadingCompanies, setLoadingCompanies] = useState(true); // Loading for companies
  const [selectedCompanyId, setSelectedCompanyId] = useState("global"); // 'global' or company ID
  // State for new stats (placeholders for now)
  const [commonInterest, setCommonInterest] = useState({
    mostCommonInterest: "N/A",
    count: 0,
  });
  const [topRequests, setTopRequests] = useState([]);
  const [loadingExtraStats, setLoadingExtraStats] = useState(true); // Loading for extra stats
  const [extraStatsError, setExtraStatsError] = useState("");

  // Fetch main stats and company list on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setLoadingCompanies(true);
      setError(null);
      setLoading(true);
      try {
        // Fetch main stats
        const statsResponse = await apiClient.get("/stats/manager");
        setStats(statsResponse.data);
      } catch (err) {
        console.error("Error fetching manager stats:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }

      try {
        // Fetch company list for the filter dropdown
        const companiesResponse = await apiClient.get("/companies"); // Assuming this endpoint exists and returns [{id, nombre}]
        setCompanies(companiesResponse.data.data.companies || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
        // Handle company fetch error separately if needed
        setError((prev) =>
          prev
            ? `${prev}\nFailed to load company list.`
            : "Failed to load company list."
        );
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchInitialData();
  }, []); // Run only on mount

  // Fetch extra stats whenever selectedCompanyId changes
  useEffect(() => {
    const fetchExtraStats = async () => {
      setLoadingExtraStats(true);
      setExtraStatsError("");
      // Construct API URLs based on selection
      const companyQueryParam =
        selectedCompanyId !== "global" && selectedCompanyId
          ? `?companyId=${selectedCompanyId}`
          : "";
      const interestUrl = `/stats/company/common-interest${companyQueryParam}`;
      const requestsUrl = `/stats/company/top-reward-requests${companyQueryParam}`;

      try {
        // Fetch common interest based on selected company (or global)
        const interestResponse = await apiClient.get(interestUrl);
        setCommonInterest(interestResponse.data);

        // Fetch top reward requests based on selected company (or global)
        const requestsResponse = await apiClient.get(requestsUrl);
        setTopRequests(requestsResponse.data);

        // Remove placeholder data setting (already removed)
      } catch (err) {
        console.error("Error fetching extra manager stats:", err);
        setExtraStatsError(err.message || "Failed to load additional stats.");
      } finally {
        setLoadingExtraStats(false);
      }
    };

    // Don't fetch extra stats until companies are loaded (to avoid race conditions if needed)
    if (!loadingCompanies) {
      fetchExtraStats();
    }
    // }, []); // Re-run when selectedCompanyId changes
  }, [selectedCompanyId, loadingCompanies]); // Add dependencies

  // Stats are now directly from the API response
  const { companyStats, adminCount } = stats;
  const totalCompanies = companyStats.total;
  const activeCompanies = companyStats.active;
  const inactiveCompanies = companyStats.inactive;
  // const pendingCompanies = companyStats.pending_payment; // Available if needed

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
      <p className="text-gray-600 text-lg">
        Welcome back, {currentUser?.email || "Manager"}! Overview of the
        platform status.
      </p>

      {loading && (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}

      {/* Main Stats Grid */}
      {loading && (
        <div className="flex justify-center p-10">
          <Spinner />
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      {/* Main Stats Grid (Show when main stats are loaded) */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Total Companies Card */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <BuildingOffice2Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Companies
              </p>
              <p className="text-2xl font-semibold text-gray-800">
                {totalCompanies}
              </p>
            </div>
          </div>

          {/* Active Companies Card */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Companies
              </p>
              <p className="text-2xl font-semibold text-gray-800">
                {activeCompanies}
              </p>
            </div>
          </div>

          {/* Inactive Companies Card */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex items-center space-x-4">
            <div className="bg-red-100 p-3 rounded-full">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Inactive Companies
              </p>
              <p className="text-2xl font-semibold text-gray-800">
                {inactiveCompanies}
              </p>
            </div>
          </div>

          {/* Add more cards if needed, e.g., for pending status */}
        </div>
      )}

      {/* Filter and Extra Stats Section */}
      {!loadingCompanies &&
        !error && ( // Show filter and extra stats once companies are loaded (or failed)
          <div className="mt-6 space-y-4">
            {/* Company Filter Dropdown */}
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
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                disabled={loadingExtraStats} // Disable while loading stats
              >
                <option value="global">All Companies (Global)</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.nombre} (ID: {company.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Extra Stats Grid */}
            {loadingExtraStats && (
              <div className="flex justify-center p-10">
                <Spinner />
              </div>
            )}
            {extraStatsError && <Alert type="error">{extraStatsError}</Alert>}
            {!loadingExtraStats && !extraStatsError && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Common Interest Card */}
                <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <HeartIcon className="h-5 w-5 mr-2 text-pink-500" />
                    {/* Dynamic Title */}
                    Most Common Interest (
                    {selectedCompanyId === "global"
                      ? "Global"
                      : companies.find(
                          (c) => c.id === parseInt(selectedCompanyId)
                        )?.nombre || "Selected Company"}
                    )
                  </h3>
                  {commonInterest.mostCommonInterest ? (
                    <p className="text-2xl font-semibold text-gray-800 capitalize">
                      {commonInterest.mostCommonInterest}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        ({commonInterest.count} employees)
                      </span>
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      No interest data available.
                    </p>
                  )}
                </div>

                {/* Top Reward Requests Card */}
                <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-cyan-500" />
                    {/* Dynamic Title */}
                    Top Reward Requests (
                    {selectedCompanyId === "global"
                      ? "Global"
                      : companies.find(
                          (c) => c.id === parseInt(selectedCompanyId)
                        )?.nombre || "Selected Company"}
                    )
                  </h3>
                  {topRequests.length > 0 ? (
                    <ul className="space-y-1 text-sm text-gray-700">
                      {topRequests.map((req, index) => (
                        <li key={index} className="flex justify-between">
                          {/* Use requestedItem instead of requestText */}
                          <span>
                            {index + 1}. {req.requestedItem}
                          </span>
                          <span className="font-medium">
                            {req.count} requests
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">
                      No new reward requests.
                    </p>
                  )}
                  {/* Optional: Link to full request management page */}
                  {/* <Link to="/manager/reward-requests" className="text-sm text-indigo-600 hover:underline mt-3 block">Manage Requests</Link> */}
                </div>
              </div> // Closing tag for the grid
            )}
          </div> // Closing tag for the Filter and Extra Stats Section
        )}

      {/* Placeholder for future charts or quick actions */}
      {/* <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Quick Actions</h2>
        </div> */}
    </div>
  );
}

export default ManagerDashboard;

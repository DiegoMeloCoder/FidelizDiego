const statusOptions = ["new", "reviewed", "planned", "implemented", "rejected"];

export function RewardRequestsFilters({
  filters,
  onFilterChange,
  companies,
  isManager,
}) {
  const handleChange = (e) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-md border border-gray-200 flex flex-wrap gap-4 items-end">
      <div>
        <label
          htmlFor="status-filter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Filter by Status
        </label>
        <select
          id="status-filter"
          name="status"
          value={filters.status || ""}
          onChange={handleChange}
          className="block w-full sm:w-auto px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm capitalize"
        >
          <option value="">All</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {isManager && (
        <div>
          <label
            htmlFor="company-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filter by Company
          </label>
          <select
            id="company-filter"
            name="companyId"
            value={filters.companyId || ""}
            onChange={handleChange}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

// ======================================================================================

// frontend/src/components/reward_requests/RewardRequestsTable.jsx
import React from "react";

const statusStyles = {
  new: "bg-blue-100 text-blue-800",
  reviewed: "bg-yellow-100 text-yellow-800",
  planned: "bg-purple-100 text-purple-800",
  implemented: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function RewardRequestsTable({ requests, onStatusUpdate }) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Requested Item
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Additional Notes
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Employee
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Company
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                No reward requests found.
              </td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {req.requestedItem}
                </td>
                <td
                  className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate"
                  title={req.additionalNotes || ""}
                >
                  {req.additionalNotes || (
                    <span className="text-gray-400 italic">None</span>
                  )}
                </td>
                <td
                  className="px-4 py-4 whitespace-nowrap text-sm text-gray-700"
                  title={req.user?.email || "N/A"}
                >
                  {req.user?.nombre || req.user?.email || "Unknown User"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                  {req.company?.nombre || `ID: ${req.companyId}`}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <select
                    value={req.status}
                    onChange={(e) => onStatusUpdate(req.id, e.target.value)}
                    className={`capitalize border-none rounded-md text-xs font-medium focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      statusStyles[req.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {Object.keys(statusStyles).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

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

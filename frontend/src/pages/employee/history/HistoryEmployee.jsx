import React, { useState, useEffect } from 'react';
// Firestore imports removed
import apiClient from '../../../services/api'; // Import API client
import { useAuth } from '../../../contexts/AuthContext.jsx';
import Spinner from '../../../components/ui/Spinner';
import Alert from '../../../components/ui/Alert';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'; // Icon

function HistoryEmployee() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      // currentUser is needed for API calls which rely on the token
      if (!currentUser) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        // Fetch both histories concurrently using API client
        const [assignedResponse, redeemedResponse] = await Promise.all([
          apiClient.get('/history/employee/points'),
          apiClient.get('/history/employee/redemptions')
        ]);

        // Process assigned points history
        const assignedList = assignedResponse.data.map(entry => ({
          id: `assign-${entry.id}`, // Create unique key prefix
          type: 'assignment',
          date: entry.fechaAsignacion ? new Date(entry.fechaAsignacion) : null,
          amount: entry.cantidad,
          description: `Points assigned by ${entry.admin?.nombre || entry.admin?.email || 'Admin'} (${entry.justificacionTexto})`,
        }));

        // Process redemption history
        const redeemedList = redeemedResponse.data.map(entry => ({
           id: `redeem-${entry.id}`, // Create unique key prefix
           type: 'redemption',
           date: entry.fechaCanje ? new Date(entry.fechaCanje) : null,
           amount: -entry.puntosCosto, // Amount is negative for redemption
           description: `Redeemed: ${entry.reward?.nombre || 'Unknown Reward'}`,
        }));

        // Combine and Sort
        const combinedList = [...assignedList, ...redeemedList];
        combinedList.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)); // Sort by date timestamp

        setHistory(combinedList);

      } catch (err) {
        console.error("Error fetching history:", err);
        setError(err.message || 'Failed to load history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
  };

  // Define Tailwind classes for table cells - Refined
  const thStyle = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <ClipboardDocumentListIcon className="h-7 w-7 mr-2 text-sky-600" />
        My Points History
      </h1>

      {error && <Alert type="error">{error}</Alert>}

      {/* History List - Improved Styling */}
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10"><Spinner size="lg" /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={thStyle}>Date</th>
                <th className={thStyle}>Description</th>
                <th className={`${thStyle} text-right pr-6`}>Points Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr><td colSpan="3" className={`${tdStyle} text-center text-gray-500 py-6`}>No points history found.</td></tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className={`${tdStyle} text-gray-500`}>{formatDate(entry.date)}</td>
                    <td className={`${tdStyle} text-gray-800`}>{entry.description}</td>
                    <td className={`${tdStyle} text-right font-semibold pr-6 ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.amount > 0 ? '+' : ''}{entry.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default HistoryEmployee;

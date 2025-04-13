import React, { useState, useEffect } from 'react';
// Firestore imports removed
import apiClient from '../../../services/api'; // Import API client
import { useAuth } from '../../../contexts/AuthContext.jsx';
import Spinner from '../../../components/ui/Spinner';
import Alert from '../../../components/ui/Alert';
import { DocumentTextIcon } from '@heroicons/react/24/outline'; // Optional icon

function PointsHistoryAdmin() {
  const { userData } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      // Use nested company ID check
      if (!userData?.company?.id) {
        setError("Admin company information not available.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        // Fetch history using API
        const response = await apiClient.get('/history/admin/points');
        // Convert date string from API to Date object for formatting
        const list = response.data.map(entry => ({
          ...entry,
          // Assuming fechaAsignacion comes as an ISO string from backend
          fechaAsignacion: entry.fechaAsignacion ? new Date(entry.fechaAsignacion) : null
        }));
        setHistory(list);
      } catch (err) {
        console.error("Error fetching points history:", err);
        setError(err.message || 'Failed to load points assignment history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userData?.companyId]);

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
         <DocumentTextIcon className="h-7 w-7 mr-2 text-indigo-600" /> {/* Optional Icon */}
         Points Assignment History
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
                <th className={thStyle}>Employee</th>
                <th className={thStyle}>Amount</th>
                <th className={thStyle}>Justification</th>
                <th className={thStyle}>Assigned By (Admin)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr><td colSpan="5" className={`${tdStyle} text-center text-gray-500 py-6`}>No points assignment history found for this company.</td></tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className={`${tdStyle} text-gray-500`}>{formatDate(entry.fechaAsignacion)}</td>
                    {/* Use data included from backend (employee.nombre, employee.email) */}
                    <td className={`${tdStyle} font-medium text-gray-900`}>{entry.employee?.nombre || <span className="text-gray-400 italic">{entry.employee?.email || 'N/A'}</span>}</td>
                    <td className={`${tdStyle} font-semibold ${entry.cantidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.cantidad > 0 ? '+' : ''}{entry.cantidad}
                    </td>
                    <td className={`${tdStyle} text-gray-700`}>{entry.justificacionTexto || <span className="text-gray-400 italic">N/A</span>}</td>
                    {/* Use data included from backend (admin.nombre, admin.email) */}
                    <td className={`${tdStyle} text-gray-500`}>{entry.admin?.nombre || entry.admin?.email || 'N/A'}</td>
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

export default PointsHistoryAdmin;

import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api'; // Ajusta la ruta si es necesario
import Spinner from '../../../components/ui/Spinner';
import Alert from '../../../components/ui/Alert';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';

function GlobalRedemptionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        // Llama al nuevo endpoint para el historial global del manager
        const response = await apiClient.get('/history/manager/redemptions/global');
        setHistory(response.data);
      } catch (err) {
        console.error("Error fetching global redemption history:", err);
        setError(err.message || 'Failed to load global redemption history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Define Tailwind classes for table cells
  const thStyle = "px-4 py-3 text-left text-xs font-medium text-brand-secondary uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-brand-secondary flex items-center">
        <ArchiveBoxIcon className="h-7 w-7 mr-2" />
        Global Redemption History
      </h1>

      {error && <Alert type="error">{error}</Alert>}

      <div className="overflow-x-auto border border-brand-tertiary rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10"><Spinner size="lg" /></div>
        ) : (
          <table className="min-w-full divide-y divide-brand-tertiary">
            <thead>
              <tr>
                <th className={thStyle}>Date</th>
                <th className={thStyle}>Employee</th>
                <th className={thStyle}>Company</th>
                <th className={thStyle}>Reward Redeemed</th>
                <th className={thStyle}>Points Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className={`${tdStyle} text-center text-gray-500 py-6`}>
                    No global redemptions found yet.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className={`${tdStyle} text-gray-500`}>
                      {new Date(item.fechaCanje).toLocaleDateString()} {new Date(item.fechaCanje).toLocaleTimeString()}
                    </td>
                    <td className={`${tdStyle} font-medium text-gray-900`}>
                      {item.employee?.nombre || item.employee?.email || 'N/A'}
                    </td>
                     <td className={`${tdStyle} text-gray-700`}>
                      {item.employee?.company?.nombre || 'N/A'}
                    </td>
                    <td className={`${tdStyle} text-gray-700`}>
                      {item.reward?.nombre || 'N/A'}
                    </td>
                    <td className={`${tdStyle} text-red-600 font-medium`}>
                      -{item.puntosCosto}
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

export default GlobalRedemptionHistory;

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import Spinner from '../../../components/ui/Spinner';
import Alert from '../../../components/ui/Alert';

function PointsHistoryAdmin() {
  const { userData } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userData?.companyId) {
        setError("Admin company information not available.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const historyCol = collection(db, 'puntosAsignados');
        const q = query(
          historyCol,
          where('companyId', '==', userData.companyId),
          orderBy('fechaAsignacion', 'desc')
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fechaAsignacion: doc.data().fechaAsignacion?.toDate()
        }));
        setHistory(list);
      } catch (err) {
        console.error("Error fetching points history:", err);
        setError('Failed to load points assignment history.');
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

  // Define Tailwind classes for table cells
  const thStyle = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tdStyle = "px-6 py-4 whitespace-nowrap text-sm";


  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Points Assignment History</h1>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center items-center p-8"><Spinner size="lg" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={thStyle}>Date</th>
                <th className={thStyle}>Employee</th>
                <th className={thStyle}>Amount</th>
                <th className={thStyle}>Assigned By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr><td colSpan="4" className={`${tdStyle} text-center text-gray-500`}>No points assignment history found.</td></tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id}>
                    <td className={`${tdStyle} text-gray-500`}>{formatDate(entry.fechaAsignacion)}</td>
                    <td className={`${tdStyle} font-medium text-gray-900`}>{entry.empleadoName || entry.empleadoEmail}</td>
                    <td className={`${tdStyle} font-semibold ${entry.cantidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.cantidad > 0 ? '+' : ''}{entry.cantidad}
                    </td>
                    <td className={`${tdStyle} text-gray-500`}>{entry.adminEmail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
       {/* Removed <style jsx> block */}
    </div>
  );
}

export default PointsHistoryAdmin;

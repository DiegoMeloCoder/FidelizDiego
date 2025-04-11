import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import Spinner from '../../../components/ui/Spinner';
import Alert from '../../../components/ui/Alert';

function HistoryEmployee() {
  const { currentUser } = useAuth(); // Need currentUser for UID
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        // 1. Fetch Assigned Points
        const assignedCol = collection(db, 'puntosAsignados');
        const assignedQuery = query(
          assignedCol,
          where('empleadoId', '==', currentUser.uid),
          orderBy('fechaAsignacion', 'desc')
        );
        const assignedSnapshot = await getDocs(assignedQuery);
        const assignedList = assignedSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: 'assignment',
            date: data.fechaAsignacion?.toDate(),
            amount: data.cantidad,
            description: `Points assigned by ${data.adminEmail}`,
          };
        });

        // 2. Fetch Redemptions
        const redeemedCol = collection(db, 'canjes');
        const redeemedQuery = query(
          redeemedCol,
          where('empleadoId', '==', currentUser.uid),
          orderBy('fechaCanje', 'desc')
        );
        const redeemedSnapshot = await getDocs(redeemedQuery);
        const redeemedList = redeemedSnapshot.docs.map(doc => {
           const data = doc.data();
           return {
             id: doc.id,
             type: 'redemption',
             date: data.fechaCanje?.toDate(),
             amount: -data.puntosCosto,
             description: `Redeemed: ${data.recompensaNombre}`,
           };
        });

        // 3. Combine and Sort
        const combinedList = [...assignedList, ...redeemedList];
        combinedList.sort((a, b) => (b.date || 0) - (a.date || 0));

        setHistory(combinedList);

      } catch (err) {
        console.error("Error fetching history:", err);
        setError('Failed to load history. Firestore might require indexes. Check browser console for links to create them.');
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

  // Define Tailwind classes for table cells
  const thStyle = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tdStyle = "px-6 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Points History</h1>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center items-center p-8"><Spinner size="lg" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Apply Tailwind classes directly */}
                <th className={thStyle}>Date</th>
                <th className={thStyle}>Description</th>
                <th className={`${thStyle} text-right`}>Points Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr><td colSpan="3" className={`${tdStyle} text-center text-gray-500`}>No history found.</td></tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id}>
                    <td className={`${tdStyle} text-gray-500`}>{formatDate(entry.date)}</td>
                    <td className={tdStyle}>{entry.description}</td>
                    <td className={`${tdStyle} text-right font-semibold ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.amount > 0 ? '+' : ''}{entry.amount}
                    </td>
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

export default HistoryEmployee;

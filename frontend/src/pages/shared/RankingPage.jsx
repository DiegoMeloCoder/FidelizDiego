import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

function RankingPage() {
  const { currentUser, userData } = useAuth(); // Get current user info
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limitCount = 20; // Limit to top 20 for now

  useEffect(() => {
    const fetchRanking = async () => {
      if (!userData?.companyId) {
        setError("User company information not available.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const usersCol = collection(db, 'users');
        const q = query(
          usersCol,
          where('companyId', '==', userData.companyId),
          where('role', '==', 'Employee'), // Only rank employees
          // where('isActive', '==', true), // Consider adding later if needed
          orderBy('points', 'desc'), // Order by points descending
          limit(limitCount) // Limit the results
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          rank: index + 1, // Calculate rank based on order
          ...doc.data(),
        }));
        setRanking(list);
      } catch (err) {
        // Firestore might require an index for this query
        console.error("Error fetching ranking:", err);
        setError('Failed to load ranking. Firestore might require an index (companyId == ?, role == ?, points DESC). Check browser console.');
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [userData?.companyId]); // Re-fetch if companyId changes

  // Define Tailwind classes for table cells
  const thStyle = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tdStyle = "px-6 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Employee Ranking (Top {limitCount})</h1>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center items-center p-8"><Spinner size="lg" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={`${thStyle} w-16`}>Rank</th>
                <th className={thStyle}>Name</th>
                <th className={`${thStyle} text-right`}>Points</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ranking.length === 0 ? (
                <tr><td colSpan="3" className={`${tdStyle} text-center text-gray-500`}>No employee data found for ranking.</td></tr>
              ) : (
                ranking.map((employee) => (
                  // Highlight the current user's row if they are an employee
                  <tr key={employee.id} className={currentUser?.uid === employee.id ? 'bg-indigo-50' : ''}>
                    <td className={`${tdStyle} text-center font-medium text-gray-700`}>{employee.rank}</td>
                    <td className={`${tdStyle} font-medium text-gray-900`}>{employee.name || employee.email}</td>
                    <td className={`${tdStyle} text-right font-semibold text-indigo-600`}>{employee.points ?? 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RankingPage;

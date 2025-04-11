import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { ChartBarIcon, StarIcon } from '@heroicons/react/24/outline'; // Icons

function RankingPage() {
  const { currentUser, userData } = useAuth();
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

  // Define Tailwind classes for table cells - Refined
  const thStyle = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <ChartBarIcon className="h-7 w-7 mr-2 text-amber-600" />
        Employee Ranking (Top {limitCount})
      </h1>

      {error && <Alert type="error">{error}</Alert>}

      {/* Ranking List - Improved Styling */}
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10"><Spinner size="lg" /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={`${thStyle} w-20 text-center`}>Rank</th> {/* Centered Rank */}
                <th className={thStyle}>Name</th>
                <th className={`${thStyle} text-right pr-6`}>Points</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ranking.length === 0 ? (
                <tr><td colSpan="3" className={`${tdStyle} text-center text-gray-500 py-6`}>No employee data found for ranking in this company.</td></tr>
              ) : (
                ranking.map((employee) => (
                  // Enhanced highlight for the current user
                  <tr
                    key={employee.id}
                    className={`transition-colors duration-150 ${
                      currentUser?.uid === employee.id
                        ? 'bg-indigo-100 hover:bg-indigo-200 font-semibold' // More distinct highlight
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className={`${tdStyle} text-center font-bold ${currentUser?.uid === employee.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                      {employee.rank}
                    </td>
                    <td className={`${tdStyle} ${currentUser?.uid === employee.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                      {employee.name || <span className="text-gray-400 italic">{employee.email}</span>}
                      {currentUser?.uid === employee.id && <span className="ml-2 text-xs text-indigo-500">(You)</span>}
                    </td>
                    <td className={`${tdStyle} text-right font-bold pr-6 ${currentUser?.uid === employee.id ? 'text-indigo-700' : 'text-indigo-600'} flex items-center justify-end`}>
                       <StarIcon className={`h-4 w-4 mr-1 ${currentUser?.uid === employee.id ? 'text-yellow-500' : 'text-yellow-400'}`}/>
                       {employee.points ?? 0}
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

export default RankingPage;

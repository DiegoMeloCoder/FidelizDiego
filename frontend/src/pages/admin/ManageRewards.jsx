import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx'; // Updated extension

function ManageRewards() {
  const { userData } = useAuth(); // Get admin's data (including companyId)
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for adding new reward
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Fetch rewards for the admin's company
  useEffect(() => {
    const fetchRewards = async () => {
      if (!userData?.companyId) {
        setError("Admin company information not available.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const rewardsCol = collection(db, 'rewards');
        const q = query(rewardsCol, where('companyId', '==', userData.companyId));
        const rewardSnapshot = await getDocs(q);
        const rewardList = rewardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRewards(rewardList);
      } catch (err) {
        console.error("Error fetching rewards:", err);
        setError('Failed to load rewards.');
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [userData?.companyId]); // Re-fetch if admin's companyId changes

  // Handle adding a new reward
  const handleAddReward = async (e) => {
    e.preventDefault();
    const points = parseInt(newRewardPoints, 10);
    if (!newRewardName.trim() || isNaN(points) || points <= 0) {
      setAddError('Please enter a valid name and positive points value.');
      return;
    }
     if (!userData?.companyId) {
        setAddError("Cannot add reward: Admin's company ID is missing.");
        return;
    }

    setAdding(true);
    setAddError('');

    try {
      const rewardsCol = collection(db, 'rewards');
      const newRewardData = {
        name: newRewardName.trim(),
        pointsRequired: points,
        companyId: userData.companyId,
        // Add other fields like description, imageUrl, isActive, stock later
        createdAt: serverTimestamp() // Optional
      };
      const docRef = await addDoc(rewardsCol, newRewardData);

      // Update local state
      setRewards(prevRewards => [...prevRewards, { id: docRef.id, ...newRewardData }]);

      // Clear form
      setNewRewardName('');
      setNewRewardPoints('');

    } catch (err) {
      console.error("Error adding reward:", err);
      setAddError('Failed to add reward. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Rewards</h1>

      {/* Add Reward Form */}
      <form onSubmit={handleAddReward} className="mb-6 p-4 border rounded-md bg-gray-50">
         <h2 className="text-lg font-medium text-gray-700 mb-3">Add New Reward</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <input
             type="text" value={newRewardName} onChange={(e) => setNewRewardName(e.target.value)}
             placeholder="Reward Name" required
             className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
           />
           <input
             type="number" value={newRewardPoints} onChange={(e) => setNewRewardPoints(e.target.value)}
             placeholder="Points Required" required min="1"
             className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
           />
         </div>
         {addError && <p className="text-sm text-red-600 mt-2">{addError}</p>}
         <button
           type="submit" disabled={adding}
           className="mt-3 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
         >
           {adding ? 'Adding...' : 'Add Reward'}
         </button>
       </form>

      {/* Rewards List */}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Loading rewards...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points Required</th>
                {/* Add 'Actions' column later */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rewards.length === 0 ? (
                <tr>
                  <td colSpan="2" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No rewards found for this company.</td>
                </tr>
              ) : (
                rewards.map((reward) => (
                  <tr key={reward.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reward.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reward.pointsRequired}</td>
                    {/* Actions */}
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

export default ManageRewards;

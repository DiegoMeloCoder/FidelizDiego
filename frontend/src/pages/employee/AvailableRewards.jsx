import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx'; // Updated extension

function AvailableRewards() {
  const { userData } = useAuth(); // Get employee's data (including companyId and points)
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch rewards for the employee's company
  useEffect(() => {
    const fetchRewards = async () => {
      if (!userData?.companyId) {
        setError("Employee company information not available.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const rewardsCol = collection(db, 'rewards');
        // Query rewards for the specific company
        // Later, you might add: where('isActive', '==', true)
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
  }, [userData?.companyId]); // Re-fetch if companyId changes

  const handleRedeem = (rewardId, pointsRequired) => {
    // Basic check if user has enough points (more robust logic needed later)
    if ((userData?.points ?? 0) < pointsRequired) {
        alert("You don't have enough points to redeem this reward.");
        return;
    }
    // Placeholder for actual redeem logic (Phase 5 in full plan)
    alert(`Redeem functionality for reward ID ${rewardId} (cost: ${pointsRequired} points) is not implemented in this MVP.`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Available Rewards</h1>
      <p className="text-gray-600 mb-4">
        Your current points: <span className="font-semibold">{userData?.points ?? 'N/A'}</span>
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Loading rewards...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.length === 0 ? (
            <p className="text-gray-500 col-span-full">No rewards currently available for your company.</p>
          ) : (
            rewards.map((reward) => (
              <div key={reward.id} className="border rounded-lg p-4 flex flex-col justify-between bg-gray-50 shadow-sm">
                <div>
                  {/* Add image later: <img src={reward.imageUrl || 'placeholder.png'} alt={reward.name} className="w-full h-32 object-cover mb-3 rounded"/> */}
                  <h3 className="text-lg font-medium text-gray-900">{reward.name}</h3>
                  {/* Add description later: <p className="text-sm text-gray-600 mt-1">{reward.description}</p> */}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-indigo-600 font-semibold">{reward.pointsRequired} Points</span>
                  <button
                    onClick={() => handleRedeem(reward.id, reward.pointsRequired)}
                    className="px-3 py-1 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    disabled={(userData?.points ?? 0) < reward.pointsRequired} // Disable if not enough points
                  >
                    Redeem (MVP)
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AvailableRewards;

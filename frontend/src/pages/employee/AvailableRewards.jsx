import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../../components/ui/Button'; // Import Button

function AvailableRewards() {
  const { currentUser, userData } = useAuth(); // Need currentUser for UID
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeemingId, setRedeemingId] = useState(null); // Track which reward is being redeemed
  const [redeemError, setRedeemError] = useState('');

  // Fetch rewards
  useEffect(() => {
    const fetchRewards = async () => {
      if (!userData?.companyId) {
        setError("Employee company information not available."); setLoading(false); return;
      }
      console.log(`AvailableRewards: Fetching rewards for companyId: ${userData.companyId}`); // Log company ID
      setLoading(true); setError('');
       try {
         const rewardsCol = collection(db, 'rewards');
         // Temporarily remove isActive filter for debugging/MVP simplicity
         const q = query(
             rewardsCol,
             where('companyId', '==', userData.companyId)
             // where('isActive', '==', true) // Temporarily removed
         );
         const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("AvailableRewards: Fetched rewards list:", list); // Log the fetched list
        setRewards(list);
      } catch (err) {
        console.error("Error fetching rewards:", err); setError('Failed to load rewards.');
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, [userData?.companyId]);

  // Handle Redeem Reward
  const handleRedeem = async (rewardId, pointsRequired) => {
    // ... (redeem logic remains the same) ...
    setRedeemingId(rewardId); setRedeemError('');
    if (!currentUser || !userData) {
        setRedeemError("User data not available."); setRedeemingId(null); return;
    }
    if ((userData.points ?? 0) < pointsRequired) {
        setRedeemError("Not enough points."); alert("You don't have enough points to redeem this reward."); setRedeemingId(null); return;
    }
    if (!window.confirm(`Are you sure you want to redeem this reward for ${pointsRequired} points?`)) {
        setRedeemingId(null); return;
    }
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { points: increment(-pointsRequired) });
      alert(`Successfully redeemed reward for ${pointsRequired} points! Your points balance will update shortly.`);
    } catch (err) {
      console.error("Error redeeming reward:", err);
      setRedeemError('Failed to redeem reward. Please try again.');
      alert('Failed to redeem reward. Please try again.');
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Available Rewards</h1>
      <p className="text-gray-600 mb-4">
        Your current points: <span className="font-semibold">{userData?.points ?? 'N/A'}</span>
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {redeemError && <p className="text-sm text-red-600 mb-4">{redeemError}</p>}

      {loading ? <p>Loading rewards...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.length === 0 ? (
            <p className="text-gray-500 col-span-full">No active rewards currently available.</p>
          ) : (
            rewards.map((reward) => {
              // Ensure isActive is checked correctly, defaulting to true if undefined for safety
              const isActive = reward.isActive !== undefined ? reward.isActive : true;
              if (!isActive) return null; // Don't render inactive rewards (double check)

              const canAfford = (userData?.points ?? 0) >= reward.pointsRequired;
              const isRedeemingThis = redeemingId === reward.id;
              return (
                // Removed isActive check from className as we filter non-active ones above
                <div key={reward.id} className={`border rounded-lg p-4 flex flex-col justify-between bg-gray-50 shadow-sm`}>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{reward.name}</h3>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-indigo-600 font-semibold">{reward.pointsRequired} Points</span>
                    <Button
                      onClick={() => handleRedeem(reward.id, reward.pointsRequired)}
                      disabled={!canAfford || isRedeemingThis} // Removed !reward.isActive check as we filter above
                      variant="primary"
                      className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                      size="sm"
                    >
                      {isRedeemingThis ? 'Redeeming...' : 'Redeem'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default AvailableRewards;

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore'; // Added addDoc, serverTimestamp
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert'; // Import Alert

function AvailableRewards() {
  const { currentUser, userData, loading: authLoading } = useAuth(); // Added authLoading
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [redeemingId, setRedeemingId] = useState(null);
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState(''); // State for success message

  // Fetch rewards
  useEffect(() => {
    // Wait for user data to be available before fetching
    if (authLoading) return;

    const fetchRewards = async () => {
      if (!userData?.companyId) {
        setListError("Employee company information not available."); setLoading(false); return;
      }
      console.log(`AvailableRewards: Fetching rewards for companyId: ${userData.companyId}`);
      setLoading(true); setListError(''); setRedeemSuccess(''); setRedeemError(''); // Clear messages on fetch
      try {
        const rewardsCol = collection(db, 'rewards');
        const q = query(
            rewardsCol,
            where('companyId', '==', userData.companyId)
            // where('isActive', '==', true) // Keep removed for now
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("AvailableRewards: Fetched rewards list:", list);
        setRewards(list);
      } catch (err) {
        console.error("Error fetching rewards:", err); setListError('Failed to load rewards.');
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, [userData?.companyId, authLoading]); // Depend on authLoading and companyId

  // Handle Redeem Reward
  const handleRedeem = async (rewardId, pointsRequired, rewardName) => {
    setRedeemingId(rewardId); setRedeemError(''); setRedeemSuccess('');

    if (!currentUser || !userData) {
        setRedeemError("User data not available."); setRedeemingId(null); return;
    }
    if ((userData.points ?? 0) < pointsRequired) {
        setRedeemError(`Not enough points to redeem ${rewardName}.`); setRedeemingId(null); return;
    }
    if (!window.confirm(`Redeem "${rewardName}" for ${pointsRequired} points?`)) {
        setRedeemingId(null); return;
    }

    try {
      // 1. Update user points
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { points: increment(-pointsRequired) });

      // 2. Create history record in 'canjes' collection
      const historyColRef = collection(db, 'canjes');
      await addDoc(historyColRef, {
        empleadoId: currentUser.uid,
        empleadoEmail: currentUser.email,
        companyId: userData.companyId,
        recompensaId: rewardId,
        recompensaNombre: rewardName, // Passed to handleRedeem
        puntosCosto: pointsRequired,
        fechaCanje: serverTimestamp(),
      });

      setRedeemSuccess(`Successfully redeemed ${rewardName}! Points will update soon.`);
    } catch (err) {
      console.error("Error redeeming reward:", err);
      setRedeemError(`Failed to redeem ${rewardName}. Please try again.`);
    } finally {
      setRedeemingId(null);
      // Clear messages after a delay?
      // setTimeout(() => { setRedeemSuccess(''); setRedeemError(''); }, 5000);
    }
  };

  // Show loading spinner if auth or rewards are loading
  const isLoading = loading || authLoading;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Available Rewards</h1>
      <p className="text-gray-600 mb-4">
        Your current points: <span className="font-semibold">{authLoading ? '...' : (userData?.points ?? 'N/A')}</span>
      </p>

      {/* Display feedback messages */}
      {listError && <Alert type="error" className="mb-4">{listError}</Alert>}
      {redeemError && <Alert type="error" className="mb-4">{redeemError}</Alert>}
      {redeemSuccess && <Alert type="success" className="mb-4">{redeemSuccess}</Alert>}

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.length === 0 ? (
            <p className="text-gray-500 col-span-full">No rewards currently available for your company.</p>
          ) : (
            rewards.map((reward) => {
              const isActive = reward.isActive !== undefined ? reward.isActive : true;
              // Filter out inactive rewards here instead of relying solely on the query
              if (!isActive) return null;

              const canAfford = (userData?.points ?? 0) >= reward.pointsRequired;
              const isRedeemingThis = redeemingId === reward.id;
              return (
                <div key={reward.id} className={`border rounded-lg p-4 flex flex-col justify-between bg-gray-50 shadow-sm`}>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{reward.name}</h3>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-indigo-600 font-semibold">{reward.pointsRequired} Points</span>
                    <Button
                      onClick={() => handleRedeem(reward.id, reward.pointsRequired, reward.name)}
                      disabled={!canAfford || isRedeemingThis}
                      variant="primary"
                      className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                      size="sm"
                    >
                      {isRedeemingThis ? <Spinner size="sm" color="text-white" /> : 'Redeem'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
          {/* Render message if all rewards were filtered out */}
          {!loading && rewards.filter(r => r.isActive !== false).length === 0 && rewards.length > 0 && (
             <p className="text-gray-500 col-span-full">No *active* rewards currently available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AvailableRewards;

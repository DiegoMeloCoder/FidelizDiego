import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

function AvailableRewards() {
  const { currentUser, userData, loading: authLoading } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [redeemingId, setRedeemingId] = useState(null);
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');

  // Function to clear messages after a delay
  const clearMessages = () => {
    setTimeout(() => {
      setListError('');
      setRedeemError('');
      setRedeemSuccess('');
    }, 4000); // Clear after 4 seconds
  };


  // Fetch rewards
  useEffect(() => {
    if (authLoading) return;

    const fetchRewards = async () => {
      if (!userData?.companyId) {
        setListError("Employee company information not available."); setLoading(false); return;
      }
      console.log(`AvailableRewards: Fetching rewards for companyId: ${userData.companyId}`);
      setLoading(true); setListError(''); setRedeemSuccess(''); setRedeemError('');
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
        clearMessages();
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, [userData?.companyId, authLoading]);

  // Handle Redeem Reward
  const handleRedeem = async (rewardId, pointsRequired, rewardName) => {
    setRedeemingId(rewardId); setRedeemError(''); setRedeemSuccess('');

    if (!currentUser || !userData) {
        setRedeemError("User data not available."); setRedeemingId(null); clearMessages(); return;
    }
    if ((userData.points ?? 0) < pointsRequired) {
        setRedeemError(`Not enough points to redeem ${rewardName}.`); setRedeemingId(null); clearMessages(); return;
    }
    if (!window.confirm(`Redeem "${rewardName}" for ${pointsRequired} points?`)) {
        setRedeemingId(null); return;
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { points: increment(-pointsRequired) });

      const historyColRef = collection(db, 'canjes');
      await addDoc(historyColRef, {
        empleadoId: currentUser.uid, empleadoEmail: currentUser.email,
        companyId: userData.companyId, recompensaId: rewardId,
        recompensaNombre: rewardName, puntosCosto: pointsRequired,
        fechaCanje: serverTimestamp(),
      });

      setRedeemSuccess(`Successfully redeemed ${rewardName}! Points will update soon.`);
      clearMessages(); // Clear success message after delay
    } catch (err) {
      console.error("Error redeeming reward:", err);
      setRedeemError(`Failed to redeem ${rewardName}. Please try again.`);
      clearMessages(); // Clear error message after delay
    } finally {
      setRedeemingId(null);
    }
  };

  const isLoading = loading || authLoading;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Available Rewards</h1>
      <p className="text-gray-600 mb-4">
        Your current points: <span className="font-semibold">{authLoading ? '...' : (userData?.points ?? 'N/A')}</span>
      </p>

      {/* Display feedback messages */}
      {listError && <Alert type="error" className="mb-4" onClose={() => setListError('')}>{listError}</Alert>}
      {redeemError && <Alert type="error" className="mb-4" onClose={() => setRedeemError('')}>{redeemError}</Alert>}
      {redeemSuccess && <Alert type="success" className="mb-4" onClose={() => setRedeemSuccess('')}>{redeemSuccess}</Alert>}

      {isLoading ? (
        <div className="flex justify-center items-center p-8"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.length === 0 ? (
            <p className="text-gray-500 col-span-full">No rewards currently available for your company.</p>
          ) : (
            rewards.map((reward) => {
              const isActive = reward.isActive !== undefined ? reward.isActive : true;
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
          {!loading && rewards.filter(r => r.isActive !== false).length === 0 && rewards.length > 0 && (
             <p className="text-gray-500 col-span-full">No *active* rewards currently available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AvailableRewards;

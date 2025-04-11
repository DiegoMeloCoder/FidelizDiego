import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { GiftIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'; // Icons

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
  const currentPoints = userData?.points ?? 0;

  return (
    <div className="space-y-6">
       {/* Header and Points */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow border border-gray-200">
         <h1 className="text-3xl font-bold text-gray-800 flex items-center">
           <GiftIcon className="h-7 w-7 mr-2 text-rose-600" />
           Available Rewards
         </h1>
         <div className="text-right">
            <p className="text-sm font-medium text-gray-500">Your Points</p>
            <p className="text-2xl font-bold text-indigo-600 flex items-center justify-end">
                <StarIcon className="h-5 w-5 mr-1 text-yellow-400"/>
                {authLoading ? <Spinner size="xs" /> : currentPoints}
            </p>
         </div>
       </div>


      {/* Display feedback messages */}
      <div className="space-y-3">
        {listError && <Alert type="error" onClose={() => setListError('')}>{listError}</Alert>}
        {redeemError && <Alert type="error" onClose={() => setRedeemError('')}>{redeemError}</Alert>}
        {redeemSuccess && <Alert type="success" onClose={() => setRedeemSuccess('')}>{redeemSuccess}</Alert>}
      </div>

      {/* Rewards Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center p-10"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rewards.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-10">No rewards currently available for your company.</p>
          ) : (
            rewards.map((reward) => {
              // Ensure isActive check handles undefined correctly (defaults to true)
              const isActive = reward.isActive !== false;
              if (!isActive) return null; // Skip rendering inactive rewards

              const canAfford = currentPoints >= reward.pointsRequired;
              const isRedeemingThis = redeemingId === reward.id;

              return (
                // Refined Reward Card
                <div
                  key={reward.id}
                  className={`bg-white border rounded-lg shadow-md flex flex-col overflow-hidden transition-opacity duration-300 ${isRedeemingThis ? 'opacity-70' : ''}`}
                >
                  {/* Optional: Add an image placeholder or actual image later */}
                  {/* <div className="h-32 bg-gray-200 flex items-center justify-center">
                    <GiftIcon className="h-12 w-12 text-gray-400"/>
                  </div> */}

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 flex-grow">{reward.name}</h3>
                    <div className="flex items-center text-indigo-600 font-bold text-xl mt-2">
                       <StarIcon className="h-5 w-5 mr-1 text-yellow-400"/>
                       {reward.pointsRequired}
                       <span className="text-sm font-medium text-gray-500 ml-1">Points</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <Button
                      onClick={() => handleRedeem(reward.id, reward.pointsRequired, reward.name)}
                      disabled={!canAfford || isRedeemingThis}
                      variant={canAfford ? "primary" : "secondary"} // Use primary if affordable
                      className={`w-full inline-flex items-center justify-center ${
                        !canAfford ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      }`}
                      size="sm"
                    >
                      {isRedeemingThis ? (
                        <Spinner size="sm" color="text-white" className="mr-2"/>
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 mr-1.5" />
                      )}
                      {isRedeemingThis ? 'Redeeming...' : (canAfford ? 'Redeem Now' : 'Not Enough Points')}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
          {/* Message if all fetched rewards are inactive */}
          {!isLoading && rewards.length > 0 && rewards.every(r => r.isActive === false) && (
             <p className="text-gray-500 col-span-full text-center py-10">No active rewards currently available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AvailableRewards;

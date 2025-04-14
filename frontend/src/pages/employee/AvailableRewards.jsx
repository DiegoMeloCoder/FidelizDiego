import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
// Firestore imports removed
import apiClient from '../../services/api'; // Import API client
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { GiftIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'; // Icons

function AvailableRewards() {
  // Import refreshUserData from context
  const { currentUser, userData, loading: authLoading, refreshUserData } = useAuth();
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

  // Define fetchRewards outside useEffect, memoized with useCallback
  const fetchRewards = useCallback(async () => {
    // Use nested company ID check
    if (!userData?.company?.id) {
      setListError("Employee company information not available."); setLoading(false); return;
    }
    console.log(`AvailableRewards: Fetching rewards for companyId: ${userData.company.id}`);
    setLoading(true); setListError(''); // Clear list error before fetch
    // Don't clear redeem success/error here, let clearMessages handle it
    try {
      // Fetch rewards using API (backend filters by company, frontend filters active)
      const response = await apiClient.get('/rewards');
      // Ensure isActive defaults to true if missing
      const list = response.data.map(reward => ({
          ...reward,
          isActive: reward.isActive !== undefined ? reward.isActive : true,
      }));
      console.log("AvailableRewards: Fetched rewards list:", list);
      setRewards(list);
    } catch (err) {
      console.error("Error fetching rewards:", err);
      setListError(err.message || 'Failed to load rewards.');
      clearMessages(); // Clear error after delay
    } finally {
      setLoading(false);
    }
  }, [userData?.company?.id]); // Dependency: fetchRewards needs to be recreated if companyId changes


  // Fetch rewards on initial load or when companyId changes
  useEffect(() => {
    if (authLoading) return; // Wait for auth to be ready

    // Call the memoized fetchRewards function
    fetchRewards();

  }, [userData?.company?.id, authLoading, fetchRewards]); // Add fetchRewards to dependency array


  // Handle Redeem Reward
  const handleRedeem = async (rewardId, pointsRequired, rewardName) => {
    setRedeemingId(rewardId); setRedeemError(''); setRedeemSuccess('');

    if (!currentUser || !userData) {
        setRedeemError("User data not available."); setRedeemingId(null); clearMessages(); return;
    }
    if ((userData.points ?? 0) < pointsRequired) {
        setRedeemError(`Not enough points to redeem ${rewardName}.`); setRedeemingId(null); clearMessages(); return;
    }
    // Check stock before confirming (client-side check for immediate feedback)
    const rewardToCheck = rewards.find(r => r.id === rewardId);
    if (rewardToCheck && rewardToCheck.stock === 0) {
        setRedeemError(`Reward "${rewardName}" is out of stock.`); setRedeemingId(null); clearMessages(); return;
    }

    if (!window.confirm(`Redeem "${rewardName}" for ${pointsRequired} points?`)) {
        setRedeemingId(null); return;
    }

    try {
      // Call backend API to redeem reward (handles DB transaction)
      const response = await apiClient.post(`/redemptions/rewards/${rewardId}/redeem`);

      const redeemedData = response.data;
      setRedeemSuccess(`Successfully redeemed ${rewardName}! New balance: ${redeemedData.employeeNewBalance}`);
      // Refresh user data in context to update points balance in UI
      refreshUserData();
      // Re-fetch rewards to update stock display
      fetchRewards(); // Now this call should work
      clearMessages();
    } catch (err) {
      console.error("Error redeeming reward:", err);
      setRedeemError(err.message || `Failed to redeem ${rewardName}. Please try again.`);
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
              const isOutOfStock = reward.stock === 0; // Check if stock is exactly 0

              return (
                // Refined Reward Card
                <div
                  key={reward.id}
                  className={`bg-white border rounded-lg shadow-md flex flex-col overflow-hidden transition-opacity duration-300 ${isRedeemingThis ? 'opacity-70' : ''}`}
                >
                  {/* Display Reward Image */}
                  <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden"> {/* Fixed height container */}
                    {reward.imageUrl ? (
                      <img src={reward.imageUrl} alt={reward.nombre} className="w-full h-full object-cover" /> // Cover the container
                    ) : (
                      <GiftIcon className="h-16 w-16 text-gray-400" /> // Placeholder icon
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 flex-grow">{reward.nombre}</h3> {/* Use nombre */}
                    <div className="flex items-center text-indigo-600 font-bold text-xl mt-2">
                       <StarIcon className="h-5 w-5 mr-1 text-yellow-400"/>
                       {reward.pointsRequired}
                       <span className="text-sm font-medium text-gray-500 ml-1">Points</span>
                    </div>
                    {/* Display Stock if finite */}
                    {reward.stock !== null && (
                        <p className={`text-xs mt-1 ${isOutOfStock ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                            Stock: {isOutOfStock ? '0 (Out of Stock)' : reward.stock}
                        </p>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <Button
                      onClick={() => handleRedeem(reward.id, reward.pointsRequired, reward.nombre)}
                      // Disable if not affordable OR redeeming OR out of stock
                      disabled={!canAfford || isRedeemingThis || isOutOfStock}
                      variant={(canAfford && !isOutOfStock) ? "primary" : "secondary"} // Primary only if affordable and in stock
                      className={`w-full inline-flex items-center justify-center ${
                        (!canAfford || isOutOfStock) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      }`}
                      size="sm"
                    >
                      {isRedeemingThis ? (
                        <Spinner size="sm" color="text-white" className="mr-2"/>
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 mr-1.5" />
                      )}
                      {/* Adjust button text based on stock */}
                      {isRedeemingThis ? 'Redeeming...' :
                       isOutOfStock ? 'Out of Stock' :
                       canAfford ? 'Redeem Now' : 'Not Enough Points'}
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

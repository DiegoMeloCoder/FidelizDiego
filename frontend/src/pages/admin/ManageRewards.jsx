import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { PlusIcon, PencilSquareIcon, ArchiveBoxXMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Icons

function ManageRewards() {
  const { userData } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success messages

  // Add Form State
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Function to clear messages after a delay
  const clearMessages = () => {
    setTimeout(() => {
      setAddError('');
      setListError('');
      setEditError('');
      setSuccessMessage('');
    }, 4000);
  };

  // Fetch rewards
  useEffect(() => {
    fetchRewards();
  }, [userData?.companyId]);

  const fetchRewards = async () => {
    if (!userData?.companyId) {
      setListError("Admin company information not available."); setLoading(false); return;
    }
    setLoading(true); setListError(''); setSuccessMessage('');
    try {
      const rewardsCol = collection(db, 'rewards');
      const q = query(rewardsCol, where('companyId', '==', userData.companyId));
      const snapshot = await getDocs(q);
      // Correctly map isActive status from Firestore, defaulting to true if undefined
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Reflect actual status from DB, default to true only if undefined
          isActive: data.isActive !== undefined ? data.isActive : true,
        };
      });
      setRewards(list);
    } catch (err) {
      console.error("Error fetching rewards:", err); setListError('Failed to load rewards.');
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  // Add Reward
  const handleAddReward = async (e) => {
    e.preventDefault();
    const points = parseInt(newRewardPoints, 10);
    if (!newRewardName.trim() || isNaN(points) || points <= 0) {
      setAddError('Please enter a valid name and positive points value.'); clearMessages(); return;
    }
    if (!userData?.companyId) {
      setAddError("Cannot add reward: Admin's company ID is missing."); clearMessages(); return;
    }
    setAdding(true); setAddError(''); setListError(''); setSuccessMessage('');
    try {
      const rewardsCol = collection(db, 'rewards');
      const newRewardData = {
        name: newRewardName.trim(), pointsRequired: points,
        companyId: userData.companyId, isActive: true,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(rewardsCol, newRewardData);
      setRewards(prev => [...prev, { id: docRef.id, ...newRewardData }]);
      setNewRewardName(''); setNewRewardPoints('');
      setSuccessMessage(`Reward "${newRewardData.name}" added successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error adding reward:", err); setAddError('Failed to add reward.');
      clearMessages();
    } finally {
      setAdding(false);
    }
  };

  // Edit Reward - Open Modal
  const handleEditClick = (reward) => {
    setEditingReward(reward);
    setEditName(reward.name);
    setEditPoints(reward.pointsRequired.toString());
    setEditIsActive(reward.isActive !== undefined ? reward.isActive : true);
    setEditError(''); setSuccessMessage('');
    setIsModalOpen(true);
  };

  // Edit Reward - Save Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const points = parseInt(editPoints, 10);
    if (!editName.trim() || !editingReward || isNaN(points) || points <= 0) {
      setEditError('Please enter a valid name and positive points value.'); clearMessages(); return;
    }
    setSaving(true); setEditError(''); setListError(''); setSuccessMessage('');
    try {
      const rewardDocRef = doc(db, 'rewards', editingReward.id);
      const updatedData = { name: editName.trim(), pointsRequired: points, isActive: editIsActive };
      await updateDoc(rewardDocRef, updatedData);
      setRewards(prev => prev.map(r => r.id === editingReward.id ? { ...r, ...updatedData } : r));
      closeModal();
      setSuccessMessage(`Reward "${editName.trim()}" updated successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error updating reward:", err); setEditError('Failed to update reward.');
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Delete Reward (Logical Delete)
  const handleDeleteClick = async (rewardId, rewardName) => {
    if (window.confirm(`Are you sure you want to set reward "${rewardName}" to inactive?`)) {
      setListError(''); setSuccessMessage('');
      // TODO: Add button loading state
      try {
        const rewardDocRef = doc(db, 'rewards', rewardId);
        await updateDoc(rewardDocRef, { isActive: false });
        setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, isActive: false } : r));
        setSuccessMessage(`Reward "${rewardName}" set to inactive.`);
        clearMessages();
      } catch (err) {
        console.error("Error setting reward inactive:", err);
        setListError(`Failed to set reward "${rewardName}" to inactive.`);
        clearMessages();
      }
    }
  };

   // Activate Reward
   const handleActivateClick = async (rewardId, rewardName) => {
    if (window.confirm(`Are you sure you want to set reward "${rewardName}" to active?`)) {
       setListError(''); setSuccessMessage('');
       // TODO: Add button loading state
      try {
        const rewardDocRef = doc(db, 'rewards', rewardId);
        await updateDoc(rewardDocRef, { isActive: true });
        setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, isActive: true } : r));
        setSuccessMessage(`Reward "${rewardName}" set to active.`);
        clearMessages();
      } catch (err) {
        console.error("Error setting reward active:", err);
        setListError(`Failed to set reward "${rewardName}" to active.`);
        clearMessages();
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReward(null);
    setEditName('');
    setEditPoints('');
    setEditIsActive(true);
  };

  // Define Tailwind classes for table cells - Refined
  const thStyle = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Manage Rewards</h1>

      {/* Add Reward Form - Improved Layout */}
      <form onSubmit={handleAddReward} className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4">
         <h2 className="text-lg font-medium text-gray-700">Add New Reward</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label htmlFor="new-reward-name" className="block text-sm font-medium text-gray-700 mb-1">Reward Name</label>
             <Input id="new-reward-name" type="text" value={newRewardName} onChange={(e) => setNewRewardName(e.target.value)} placeholder="e.g., Gift Card" required className="mt-0 w-full"/>
           </div>
           <div>
             <label htmlFor="new-reward-points" className="block text-sm font-medium text-gray-700 mb-1">Points Required</label>
             <Input id="new-reward-points" type="number" value={newRewardPoints} onChange={(e) => setNewRewardPoints(e.target.value)} placeholder="e.g., 1000" required min="1" className="mt-0 w-full"/>
           </div>
         </div>
         {addError && <Alert type="error">{addError}</Alert>}
         <div className="flex justify-end">
           <Button type="submit" disabled={adding} variant="primary" className="inline-flex items-center">
             {adding ? <Spinner size="sm" color="text-white" className="mr-2"/> : <PlusIcon className="h-5 w-5 mr-1.5"/>}
             {adding ? 'Adding...' : 'Add Reward'}
           </Button>
         </div>
       </form>

      {/* Display feedback messages */}
      <div className="space-y-3">
        {listError && <Alert type="error">{listError}</Alert>}
        {successMessage && <Alert type="success">{successMessage}</Alert>}
      </div>

      {/* Rewards List - Improved Styling */}
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10"><Spinner size="lg" /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={thStyle}>Name</th>
                <th className={thStyle}>Points Required</th>
                <th className={thStyle}>Status</th>
                <th className={`${thStyle} text-right pr-6`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rewards.length === 0 ? (
                <tr><td colSpan="4" className={`${tdStyle} text-center text-gray-500 py-6`}>No rewards found for this company.</td></tr>
              ) : (
                rewards.map((reward) => (
                  <tr key={reward.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className={`${tdStyle} font-medium text-gray-900`}>{reward.name}</td>
                    <td className={`${tdStyle} text-gray-700 font-medium`}>{reward.pointsRequired}</td>
                    <td className={tdStyle}>
                       {/* Improved Status Badge */}
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                         reward.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                       }`}>
                         {reward.isActive ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className={`${tdStyle} text-right space-x-2 pr-6`}>
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(reward)} className="inline-flex items-center">
                        <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      {reward.isActive ? (
                         <Button variant="danger" size="sm" onClick={() => handleDeleteClick(reward.id, reward.name)} className="inline-flex items-center">
                           <ArchiveBoxXMarkIcon className="h-4 w-4 mr-1" /> Set Inactive
                         </Button>
                      ) : (
                         <Button variant="success" size="sm" onClick={() => handleActivateClick(reward.id, reward.name)} className="inline-flex items-center">
                           <ArrowPathIcon className="h-4 w-4 mr-1" /> Set Active
                         </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal - Refined */}
      {isModalOpen && editingReward && (
         <Modal isOpen={isModalOpen} onClose={closeModal} title={`Edit Reward: ${editingReward.name}`}>
             <form onSubmit={handleSaveEdit} className="space-y-4">
                 <div>
                     <label htmlFor="edit-reward-name" className="block text-sm font-medium text-gray-700 mb-1">Reward Name</label>
                     <Input id="edit-reward-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="mt-0 w-full"/>
                 </div>
                 <div>
                     <label htmlFor="edit-reward-points" className="block text-sm font-medium text-gray-700 mb-1">Points Required</label>
                     <Input id="edit-reward-points" type="number" value={editPoints} onChange={(e) => setEditPoints(e.target.value)} required min="1" className="mt-0 w-full"/>
                 </div>
                 <div>
                    <label htmlFor="edit-reward-active" className="flex items-center cursor-pointer">
                        <input
                            id="edit-reward-active"
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(e) => setEditIsActive(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active (Visible to employees)</span>
                    </label>
                 </div>
                 {editError && <Alert type="error">{editError}</Alert>}
                 <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
                     <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
                     <Button type="submit" variant="primary" disabled={saving} className="inline-flex items-center">
                       {saving ? <Spinner size="sm" color="text-white" className="mr-2"/> : <PencilSquareIcon className="h-4 w-4 mr-1.5"/>}
                       {saving ? 'Saving...' : 'Save Changes'}
                     </Button>
                 </div>
             </form>
         </Modal>
      )}
    </div>
  );
}

export default ManageRewards;

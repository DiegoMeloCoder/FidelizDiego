import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

function ManageRewards() {
  const { userData } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Form State
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null); // { id, name, pointsRequired, isActive }
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Fetch rewards
  useEffect(() => {
    fetchRewards();
  }, [userData?.companyId]); // Re-fetch if companyId changes

  const fetchRewards = async () => {
    if (!userData?.companyId) {
      setError("Admin company information not available."); setLoading(false); return;
    }
    setLoading(true); setError('');
    try {
      const rewardsCol = collection(db, 'rewards');
      const q = query(rewardsCol, where('companyId', '==', userData.companyId));
      const snapshot = await getDocs(q);
      // Default isActive to true if missing
      const list = snapshot.docs.map(doc => ({ id: doc.id, isActive: true, ...doc.data() }));
      setRewards(list);
    } catch (err) {
      console.error("Error fetching rewards:", err); setError('Failed to load rewards.');
    } finally {
      setLoading(false);
    }
  };

  // Add Reward
  const handleAddReward = async (e) => {
    e.preventDefault();
    const points = parseInt(newRewardPoints, 10);
    if (!newRewardName.trim() || isNaN(points) || points <= 0) {
      setAddError('Please enter a valid name and positive points value.'); return;
    }
    if (!userData?.companyId) {
      setAddError("Cannot add reward: Admin's company ID is missing."); return;
    }
    setAdding(true); setAddError('');
    try {
      const rewardsCol = collection(db, 'rewards');
      const newRewardData = {
        name: newRewardName.trim(), pointsRequired: points,
        companyId: userData.companyId, isActive: true, // Default to active
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(rewardsCol, newRewardData);
      setRewards(prev => [...prev, { id: docRef.id, ...newRewardData }]);
      setNewRewardName(''); setNewRewardPoints('');
    } catch (err) {
      console.error("Error adding reward:", err); setAddError('Failed to add reward.');
    } finally {
      setAdding(false);
    }
  };

  // Edit Reward - Open Modal
  const handleEditClick = (reward) => {
    setEditingReward(reward);
    setEditName(reward.name);
    setEditPoints(reward.pointsRequired.toString()); // Keep as string for input
    setEditIsActive(reward.isActive !== undefined ? reward.isActive : true); // Default to true if missing
    setEditError('');
    setIsModalOpen(true);
  };

  // Edit Reward - Save Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const points = parseInt(editPoints, 10);
    if (!editName.trim() || !editingReward || isNaN(points) || points <= 0) {
      setEditError('Please enter a valid name and positive points value.'); return;
    }
    setSaving(true); setEditError('');
    try {
      const rewardDocRef = doc(db, 'rewards', editingReward.id);
      const updatedData = {
        name: editName.trim(),
        pointsRequired: points,
        isActive: editIsActive,
      };
      await updateDoc(rewardDocRef, updatedData);
      setRewards(prev => prev.map(r =>
        r.id === editingReward.id ? { ...r, ...updatedData } : r
      ));
      closeModal();
    } catch (err) {
      console.error("Error updating reward:", err); setEditError('Failed to update reward.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Reward (Logical Delete)
  const handleDeleteClick = async (rewardId, rewardName) => {
    if (window.confirm(`Are you sure you want to set reward "${rewardName}" to inactive?`)) {
      try {
        const rewardDocRef = doc(db, 'rewards', rewardId);
        await updateDoc(rewardDocRef, { isActive: false });
        setRewards(prev => prev.map(r =>
          r.id === rewardId ? { ...r, isActive: false } : r
        ));
      } catch (err) {
        console.error("Error setting reward inactive:", err);
        setError(`Failed to set reward "${rewardName}" to inactive.`);
      }
    }
  };

   const handleActivateClick = async (rewardId, rewardName) => {
    if (window.confirm(`Are you sure you want to set reward "${rewardName}" to active?`)) {
      try {
        const rewardDocRef = doc(db, 'rewards', rewardId);
        await updateDoc(rewardDocRef, { isActive: true });
        setRewards(prev => prev.map(r =>
          r.id === rewardId ? { ...r, isActive: true } : r
        ));
      } catch (err) {
        console.error("Error setting reward active:", err);
        setError(`Failed to set reward "${rewardName}" to active.`);
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

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Rewards</h1>

      {/* Add Reward Form */}
      <form onSubmit={handleAddReward} className="mb-6 p-4 border rounded-md bg-gray-50">
         <h2 className="text-lg font-medium text-gray-700 mb-3">Add New Reward</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
           <Input type="text" value={newRewardName} onChange={(e) => setNewRewardName(e.target.value)} placeholder="Reward Name" required />
           <Input type="number" value={newRewardPoints} onChange={(e) => setNewRewardPoints(e.target.value)} placeholder="Points Required" required min="1" />
         </div>
         {addError && <p className="text-sm text-red-600 mb-2">{addError}</p>}
         <Button type="submit" disabled={adding} variant="primary">{adding ? 'Adding...' : 'Add Reward'}</Button>
       </form>

      {/* Rewards List */}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? <p>Loading rewards...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th-style">Name</th>
                <th className="th-style">Points Required</th>
                <th className="th-style">Status</th>
                <th className="th-style text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rewards.length === 0 ? (
                <tr><td colSpan="4" className="td-style text-center text-gray-500">No rewards found.</td></tr>
              ) : (
                rewards.map((reward) => (
                  <tr key={reward.id}>
                    <td className="td-style font-medium text-gray-900">{reward.name}</td>
                    <td className="td-style text-gray-500">{reward.pointsRequired}</td>
                    <td className="td-style">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reward.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                         {reward.isActive ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className="td-style text-right space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(reward)}>Edit</Button>
                      {reward.isActive ? (
                         <Button variant="danger" size="sm" onClick={() => handleDeleteClick(reward.id, reward.name)}>Set Inactive</Button>
                      ) : (
                         <Button variant="secondary" size="sm" onClick={() => handleActivateClick(reward.id, reward.name)}>Set Active</Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingReward && (
         <Modal isOpen={isModalOpen} onClose={closeModal} title={`Edit Reward: ${editingReward.name}`}>
             <form onSubmit={handleSaveEdit}>
                 <div className="mb-4">
                     <label htmlFor="edit-reward-name" className="block text-sm font-medium text-gray-700 mb-1">Reward Name</label>
                     <Input id="edit-reward-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                 </div>
                 <div className="mb-4">
                     <label htmlFor="edit-reward-points" className="block text-sm font-medium text-gray-700 mb-1">Points Required</label>
                     <Input id="edit-reward-points" type="number" value={editPoints} onChange={(e) => setEditPoints(e.target.value)} required min="1" />
                 </div>
                 <div className="mb-4">
                    <label htmlFor="edit-reward-active" className="flex items-center">
                        <input
                            id="edit-reward-active"
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(e) => setEditIsActive(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                 </div>
                 {editError && <p className="text-sm text-red-600 mb-4">{editError}</p>}
                 <div className="flex justify-end space-x-3">
                     <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                     <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                 </div>
             </form>
         </Modal>
      )}

       {/* Basic Table Styling (can be moved to index.css or App.css) */}
       <style jsx>{`
         .th-style { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
         .td-style { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; }
       `}</style>
    </div>
  );
}

export default ManageRewards;

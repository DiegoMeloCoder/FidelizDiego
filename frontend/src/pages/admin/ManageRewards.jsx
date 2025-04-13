import React, { useState, useEffect } from 'react';
// Firestore imports removed
import apiClient from '../../services/api'; // Import API client
import { useAuth } from '../../contexts/AuthContext.jsx'; // Keep useAuth for companyId
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
  const [newRewardStock, setNewRewardStock] = useState(''); // '' for infinite/null
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState('');
  const [editStock, setEditStock] = useState(''); // '' for infinite/null
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
    // Depend on the nested company ID from the API response
    if (userData?.company?.id) { // Fetch only if ID is available
        fetchRewards();
    } else if (userData !== null) { // If userData is loaded but no companyId
        setListError("Admin company information not available.");
        setLoading(false);
    }
    // If userData is null (still loading initial profile), loading remains true
  }, [userData?.company?.id]); // <-- Use nested ID

  const fetchRewards = async () => {
    setLoading(true); setListError(''); setSuccessMessage('');
    try {
      // Fetch rewards using API (backend filters by company)
      const response = await apiClient.get('/rewards');
      // Ensure isActive defaults to true if missing
      const list = response.data.map(reward => ({
        ...reward,
        isActive: reward.isActive !== undefined ? reward.isActive : true,
      }));
      setRewards(list);
    } catch (err) {
      console.error("Error fetching rewards:", err);
      setListError(err.message || 'Failed to load rewards.');
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  // Add Reward
  const handleAddReward = async (e) => {
    e.preventDefault();
    const points = parseInt(newRewardPoints, 10);
    const stock = newRewardStock === '' ? null : parseInt(newRewardStock, 10); // Convert '' to null

    if (!newRewardName.trim() || isNaN(points) || points <= 0) {
      setAddError('Please enter a valid name and positive points value.'); clearMessages(); return;
    }
    // Validate stock input if not null
    if (stock !== null && (isNaN(stock) || stock < 0)) {
        setAddError('Stock must be a non-negative number or empty for infinite.'); clearMessages(); return;
    }
    setAdding(true); setAddError(''); setListError(''); setSuccessMessage('');
    try {
      // Add reward using API
      const response = await apiClient.post('/rewards', {
        nombre: newRewardName.trim(),
        pointsRequired: points,
        stock: stock, // Send null or number
      });
      const addedReward = response.data; // API returns the created reward

      // Update local state
      setRewards(prev => [...prev, addedReward]);
      setNewRewardName(''); setNewRewardPoints(''); setNewRewardStock(''); // Reset stock field
      setSuccessMessage(`Reward "${addedReward.nombre}" added successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error adding reward:", err);
      setAddError(err.message || 'Failed to add reward.');
      clearMessages();
    } finally {
      setAdding(false);
    }
  };

  // Edit Reward - Open Modal
  const handleEditClick = (reward) => {
    setEditingReward(reward);
    setEditName(reward.nombre);
    setEditPoints(reward.pointsRequired.toString());
    // Set stock state: if null/undefined use '', otherwise convert number to string
    setEditStock(reward.stock === null || reward.stock === undefined ? '' : reward.stock.toString());
    setEditIsActive(reward.isActive !== undefined ? reward.isActive : true);
    setEditError(''); setSuccessMessage('');
    setIsModalOpen(true);
  };

  // Edit Reward - Save Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const pointsValue = parseInt(editPoints, 10); // Use different variable name
    const stockValue = editStock === '' ? null : parseInt(editStock, 10); // Convert '' to null, else parse int

    if (!editName.trim() || !editingReward || isNaN(pointsValue) || pointsValue <= 0) {
      setEditError('Please enter a valid name and positive points value.'); clearMessages(); return;
    }
    // Validate stock input if not null
    if (stockValue !== null && (isNaN(stockValue) || stockValue < 0)) {
        setEditError('Stock must be a non-negative number or empty for infinite.'); clearMessages(); return;
    }

    setSaving(true); setEditError(''); setListError(''); setSuccessMessage('');
    try {
      // Update reward using API, including stock
      const response = await apiClient.put(`/rewards/${editingReward.id}`, {
        nombre: editName.trim(),
        pointsRequired: pointsValue,
        isActive: editIsActive,
        stock: stockValue, // Send null or the number
      });
      const updatedReward = response.data; // API returns the updated reward

      // Update local state
      setRewards(prev => prev.map(r => r.id === updatedReward.id ? updatedReward : r));
      closeModal();
      setSuccessMessage(`Reward "${updatedReward.nombre}" updated successfully.`); // <-- Use nombre
      clearMessages();
    } catch (err) {
      console.error("Error updating reward:", err);
      setEditError(err.message || 'Failed to update reward.');
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Delete Reward (Logical Delete)
  const handleDeleteClick = async (rewardId, rewardName) => {
    // Use nombre for confirmation
    if (window.confirm(`Are you sure you want to set reward "${rewardName}" to inactive?`)) {
      setListError(''); setSuccessMessage('');
      try {
        // Toggle status using API
        const response = await apiClient.patch(`/rewards/${rewardId}/toggle-status`);
        const updatedReward = response.data.reward; // API returns updated reward

        // Update local state
        setRewards(prev => prev.map(r => r.id === updatedReward.id ? updatedReward : r));
        setSuccessMessage(response.data.message); // Use message from API
        clearMessages();
      } catch (err) {
        console.error("Error setting reward inactive:", err);
        setListError(err.message || `Failed to set reward "${rewardName}" to inactive.`);
        clearMessages();
      }
    }
  };

   // Activate Reward
   const handleActivateClick = async (rewardId, rewardName) => {
    // Use nombre for confirmation
    if (window.confirm(`Are you sure you want to set reward "${rewardName}" to active?`)) {
       setListError(''); setSuccessMessage('');
      try {
        // Toggle status using API
        const response = await apiClient.patch(`/rewards/${rewardId}/toggle-status`);
        const updatedReward = response.data.reward; // API returns updated reward

        // Update local state
        setRewards(prev => prev.map(r => r.id === updatedReward.id ? updatedReward : r));
        setSuccessMessage(response.data.message); // Use message from API
        clearMessages();
      } catch (err) {
        console.error("Error setting reward active:", err);
        setListError(err.message || `Failed to set reward "${rewardName}" to active.`);
        clearMessages();
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReward(null);
    setEditName('');
    setEditPoints('');
    setEditStock(''); // Reset stock state
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
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Changed to 3 cols */}
           <div>
             <label htmlFor="new-reward-name" className="block text-sm font-medium text-gray-700 mb-1">Reward Name</label>
             <Input id="new-reward-name" type="text" value={newRewardName} onChange={(e) => setNewRewardName(e.target.value)} placeholder="e.g., Gift Card" required className="mt-0 w-full"/>
           </div>
           <div>
             <label htmlFor="new-reward-points" className="block text-sm font-medium text-gray-700 mb-1">Points Required</label>
             <Input id="new-reward-points" type="number" value={newRewardPoints} onChange={(e) => setNewRewardPoints(e.target.value)} placeholder="e.g., 1000" required min="1" className="mt-0 w-full"/>
           </div>
           {/* Add Stock Input */}
           <div>
             <label htmlFor="new-reward-stock" className="block text-sm font-medium text-gray-700 mb-1">Stock (Optional)</label>
             <Input id="new-reward-stock" type="number" value={newRewardStock} onChange={(e) => setNewRewardStock(e.target.value)} placeholder="Empty = Infinite" min="0" className="mt-0 w-full"/>
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
                <th className={thStyle}>Stock</th>
                <th className={thStyle}>Status</th>
                <th className={`${thStyle} text-right pr-6`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rewards.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${tdStyle} text-center text-gray-500 py-6`}>
                    No rewards found for this company.
                  </td>
                </tr>
              ) : (
                rewards.map((reward) => (
                  <tr key={reward.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className={`${tdStyle} font-medium text-gray-900`}>{reward.nombre}</td>
                    <td className={`${tdStyle} text-gray-700 font-medium`}>{reward.pointsRequired}</td>
                    <td className={`${tdStyle} text-gray-700`}>
                      {reward.stock === null ? 'Infinite' : reward.stock}
                    </td>
                    <td className={tdStyle}>
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
                        <Button variant="danger" size="sm" onClick={() => handleDeleteClick(reward.id, reward.nombre)} className="inline-flex items-center">
                          <ArchiveBoxXMarkIcon className="h-4 w-4 mr-1" /> Set Inactive
                        </Button>
                      ) : (
                        <Button variant="success" size="sm" onClick={() => handleActivateClick(reward.id, reward.nombre)} className="inline-flex items-center">
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
         <Modal isOpen={isModalOpen} onClose={closeModal} title={`Edit Reward: ${editingReward.nombre}`}> {/* <-- Use nombre */}
             <form onSubmit={handleSaveEdit} className="space-y-4">
                 <div>
                     <label htmlFor="edit-reward-name" className="block text-sm font-medium text-gray-700 mb-1">Reward Name</label>
                     <Input id="edit-reward-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="mt-0 w-full"/>
                 </div>
                 <div>
                     <label htmlFor="edit-reward-points" className="block text-sm font-medium text-gray-700 mb-1">Points Required</label>
                     <Input id="edit-reward-points" type="number" value={editPoints} onChange={(e) => setEditPoints(e.target.value)} required min="1" className="mt-0 w-full"/>
                 </div>
                 {/* Add Stock Edit Input */}
                 <div>
                     <label htmlFor="edit-reward-stock" className="block text-sm font-medium text-gray-700 mb-1">Stock (Optional)</label>
                     <Input id="edit-reward-stock" type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} placeholder="Empty = Infinite" min="0" className="mt-0 w-full"/>
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

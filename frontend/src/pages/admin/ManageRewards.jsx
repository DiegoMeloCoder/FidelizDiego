import React, { useState, useEffect } from 'react';
// Import both upload functions
import apiClient, { uploadRewardImage, uploadGlobalRewardImage } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext.jsx'; // Keep useAuth for companyId and role
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { PlusIcon, PencilSquareIcon, ArchiveBoxXMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Icons

// Lista predefinida de intereses/tags (debería coincidir con la del backend/config y ProfilePage)
const predefinedTags = ['Deportes', 'Tecnología', 'Viajes', 'Hogar', 'Gastronomía', 'Moda', 'Bienestar', 'Lectura', 'Música', 'Cine/Series', 'Mascotas', 'Videojuegos', 'Arte/Cultura', 'Aire Libre'];

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
  const [newRewardImageFile, setNewRewardImageFile] = useState(null); // State for new image file
  const [newRewardPreview, setNewRewardPreview] = useState(null); // State for new image preview URL
  const [newRewardTags, setNewRewardTags] = useState([]); // State for new reward tags (now an array)

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState('');
  const [editStock, setEditStock] = useState(''); // '' for infinite/null
  const [editIsActive, setEditIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editRewardImageFile, setEditRewardImageFile] = useState(null); // State for edited image file
  const [editRewardPreview, setEditRewardPreview] = useState(null); // State for edited image preview URL
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false); // Flag to remove image on edit
  const [editTags, setEditTags] = useState([]); // State for editing tags (now an array)

  // Function to clear messages after a delay
  const clearMessages = () => {
    setTimeout(() => {
      setAddError('');
      setListError('');
      setEditError('');
      setSuccessMessage('');
    }, 4000);
  };

  // Fetch rewards - Adjusted for Manager role
  useEffect(() => {
    if (!userData) {
      // Still waiting for user data
      setLoading(true); // Keep loading true if userData is not yet available
      return;
    }

    if (userData.role === 'Manager') {
      // Manager fetches global rewards (no companyId needed)
      fetchRewards();
    } else if (userData.role === 'Admin') {
      // Admin fetches company-specific rewards
      if (userData.company?.id) {
        fetchRewards();
      } else {
        // Admin exists but has no company assigned (edge case?)
        setListError("Admin user is not assigned to a company.");
        setLoading(false);
      }
    } else {
      // Should not happen if routing/protection is correct, but handle defensively
      setListError("Unauthorized role to manage rewards.");
      setLoading(false);
    }
  }, [userData]); // Depend on the whole userData object

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

  // Handle tag checkbox change for Add form
  const handleNewTagChange = (tag) => {
    setNewRewardTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag) // Remove tag
        : [...prev, tag] // Add tag
    );
  };

  // Handle tag checkbox change for Edit modal
  const handleEditTagChange = (tag) => {
    setEditTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag) // Remove tag
        : [...prev, tag] // Add tag
    );
  };

  // Add Reward
  const handleAddReward = async (e) => {
    e.preventDefault();
    const points = parseInt(newRewardPoints, 10);
    const stock = newRewardStock === '' ? null : parseInt(newRewardStock, 10); // Convert '' to null
    // Tags state is already an array
    const tagsArray = newRewardTags;

    if (!newRewardName.trim() || isNaN(points) || points <= 0) {
      setAddError('Please enter a valid name and positive points value.'); clearMessages(); return;
    }
    // Validate stock input if not null
    if (stock !== null && (isNaN(stock) || stock < 0)) {
        setAddError('Stock must be a non-negative number or empty for infinite.'); clearMessages(); return;
    }
    setAdding(true); setAddError(''); setListError(''); setSuccessMessage('');
    try {
      let uploadedImageUrl = null;
      // 1. Upload image if selected, using the correct function based on role
      if (newRewardImageFile) {
        const uploadFunction = userData?.role === 'Manager' ? uploadGlobalRewardImage : uploadRewardImage;
        try {
          uploadedImageUrl = await uploadFunction(newRewardImageFile);
        } catch (uploadError) {
          console.error(`Error uploading ${userData?.role === 'Manager' ? 'global ' : ''}reward image:`, uploadError);
          setAddError(`Image upload failed: ${uploadError.message}`);
          clearMessages();
          setAdding(false); // Stop loading state
          return; // Prevent reward creation if image upload fails
        }
      }

      // 2. Create reward using API, including the image URL if uploaded
      const response = await apiClient.post('/rewards', {
        nombre: newRewardName.trim(),
        pointsRequired: points,
        stock: stock, // Send null or number
        imageUrl: uploadedImageUrl, // Send the uploaded image URL or null
        tags: tagsArray, // Send the tags array directly
      });
      const addedReward = response.data; // API returns the created reward (should include imageUrl and tags)

      // Update local state (ensure imageUrl and tags are included if added)
      setRewards(prev => [...prev, { ...addedReward, imageUrl: addedReward.imageUrl || null, tags: addedReward.tags || [] }]);
      setNewRewardName(''); setNewRewardPoints(''); setNewRewardStock(''); setNewRewardTags([]); // Reset tags state
      setNewRewardImageFile(null); // Reset image file
      setNewRewardPreview(null); // Reset image preview
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
    // Set tags state: Use the array directly
    setEditTags(Array.isArray(reward.tags) ? reward.tags : []);
    setEditIsActive(reward.isActive !== undefined ? reward.isActive : true);
    setEditError(''); setSuccessMessage('');
    setEditRewardImageFile(null); // Reset file input on open
    setEditRewardPreview(null); // Reset preview on open
    setRemoveCurrentImage(false); // Reset remove flag
    setIsModalOpen(true);
  };

  // Edit Reward - Save Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const pointsValue = parseInt(editPoints, 10); // Use different variable name
    const stockValue = editStock === '' ? null : parseInt(editStock, 10); // Convert '' to null, else parse int
    // Tags state is already an array
    const tagsArray = editTags;

    if (!editName.trim() || !editingReward || isNaN(pointsValue) || pointsValue <= 0) {
      setEditError('Please enter a valid name and positive points value.'); clearMessages(); return;
    }
    // Validate stock input if not null
    if (stockValue !== null && (isNaN(stockValue) || stockValue < 0)) {
        setEditError('Stock must be a non-negative number or empty for infinite.'); clearMessages(); return;
    }

    setSaving(true); setEditError(''); setListError(''); setSuccessMessage('');
    try {
      let imageUrlPayload; // Undefined initially

      // 1. Upload new image if selected, using the correct function based on role
      if (editRewardImageFile) {
        const uploadFunction = userData?.role === 'Manager' ? uploadGlobalRewardImage : uploadRewardImage;
        try {
          imageUrlPayload = await uploadFunction(editRewardImageFile);
        } catch (uploadError) {
          console.error(`Error uploading ${userData?.role === 'Manager' ? 'global ' : ''}reward image during edit:`, uploadError);
          setEditError(`Image upload failed: ${uploadError.message}`);
          clearMessages();
          setSaving(false); // Stop loading state
          return; // Prevent update if image upload fails
        }
      } else if (removeCurrentImage) {
        // 2. If user explicitly clicked "Remove Image"
        imageUrlPayload = null;
      }
      // If imageUrlPayload remains undefined, the backend won't update the image field

      // 3. Prepare update payload
      const updatePayload = {
        nombre: editName.trim(),
        pointsRequired: pointsValue,
        isActive: editIsActive,
        stock: stockValue,
        tags: tagsArray, // Include tags in payload
      };

      // Only include imageUrl in payload if it needs changing (new upload or removal)
      if (imageUrlPayload !== undefined) {
        updatePayload.imageUrl = imageUrlPayload;
      }

      // 4. Update reward using API
      const response = await apiClient.put(`/rewards/${editingReward.id}`, updatePayload);
      const updatedReward = response.data; // API returns the updated reward (should include final imageUrl)

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
    setEditTags([]); // Reset tags state to empty array
    setEditIsActive(true);
    setEditRewardImageFile(null); // Reset image file state
    setEditRewardPreview(null); // Reset image preview state
    setRemoveCurrentImage(false); // Reset remove flag
  };

  // Define Tailwind classes for table cells - Refined
  const thStyle = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  // Handle new image selection
  const handleNewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewRewardImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRewardPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setNewRewardImageFile(null);
      setNewRewardPreview(null);
    }
  };

  // Handle edit image selection
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditRewardImageFile(file);
      setRemoveCurrentImage(false); // If new file is selected, don't remove current one (it will be replaced)
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditRewardPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      // Don't clear existing preview if no file selected, user might just cancel
      // setEditRewardImageFile(null);
      // setEditRewardPreview(null);
    }
  };

  // Handle remove image click in edit modal
  const handleRemoveImageClick = () => {
    setEditRewardImageFile(null); // Clear selected file
    setEditRewardPreview(null); // Clear preview
    setRemoveCurrentImage(true); // Set flag to remove existing image on save
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Manage Rewards</h1>

      {/* Add Reward Form - Improved Layout */}
      <form onSubmit={handleAddReward} className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4">
         <h2 className="text-lg font-medium text-gray-700">Add New Reward</h2>
         {/* Grid for Name, Points, Stock */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
         {/* Tags Checkboxes */}
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Optional)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {predefinedTags.map(tag => (
                    <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={newRewardTags.includes(tag)}
                            onChange={() => handleNewTagChange(tag)} // Use specific handler
                            className="rounded text-brand-primary focus:ring-brand-primary"
                        />
                        <span className="text-sm text-gray-700">{tag}</span>
                    </label>
                ))}
            </div>
         </div>
         {/* Image Upload Section */}
         <div>
            <label htmlFor="new-reward-image" className="block text-sm font-medium text-gray-700 mb-1">Reward Image (Optional)</label>
            <Input
                id="new-reward-image"
                type="file"
                accept="image/jpeg, image/png, image/gif, image/webp" // Specify accepted types
                onChange={handleNewImageChange}
                className="mt-0 w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {/* Image Preview */}
            {newRewardPreview && (
                <div className="mt-2">
                    <img src={newRewardPreview} alt="New reward preview" className="h-20 w-20 object-cover rounded-md border border-gray-300" />
                </div>
            )}
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
                <th className={thStyle}>Image</th> {/* Add Image column */}
                <th className={thStyle}>Name</th>
                <th className={thStyle}>Points Required</th>
                <th className={thStyle}>Stock</th>
                {/* Add Tags Column */}
                <th className={thStyle}>Tags</th>
                {/* Remove Votes Columns */}
                {/* <th className={thStyle}>Votes (L/D)</th> */}
                <th className={thStyle}>Status</th>
                <th className={`${thStyle} text-right pr-6`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rewards.length === 0 ? (
                <tr>
                  {/* Adjust colspan back */}
                  <td colSpan={7} className={`${tdStyle} text-center text-gray-500 py-6`}>
                    No rewards found for this company.
                  </td>
                </tr>
              ) : (
                rewards.map((reward) => (
                  <tr key={reward.id} className="hover:bg-gray-50 transition-colors duration-150">
                    {/* Image Cell */}
                    <td className={tdStyle}>
                      {reward.imageUrl ? (
                        <img src={reward.imageUrl} alt={reward.nombre} className="h-10 w-10 object-cover rounded-md border border-gray-200" />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">No Image</div>
                      )}
                    </td>
                    <td className={`${tdStyle} font-medium text-gray-900`}>{reward.nombre}</td>
                    <td className={`${tdStyle} text-gray-700 font-medium`}>{reward.pointsRequired}</td>
                    <td className={`${tdStyle} text-gray-700`}>
                      {reward.stock === null ? 'Infinite' : reward.stock}
                    </td>
                    {/* Tags Cell */}
                    <td className={tdStyle}>
                      {Array.isArray(reward.tags) && reward.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {reward.tags.map(tag => (
                            <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">None</span>
                      )}
                    </td>
                    {/* Remove Votes Cell */}
                    <td className={tdStyle}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        reward.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {reward.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className={`${tdStyle} text-right space-x-2 pr-6`}>
                      {/* Show buttons only if Manager OR if Admin AND reward is not global */}
                      {(userData?.role === 'Manager' || (userData?.role === 'Admin' && reward.companyId !== null)) && (
                        <>
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
                        </>
                      )}
                      {/* Optional: Show a placeholder or nothing if Admin and reward is global */}
                      {userData?.role === 'Admin' && reward.companyId === null && (
                        <span className="text-xs text-gray-400 italic">Global</span>
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
                 {/* Edit Tags Checkboxes */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Optional)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {predefinedTags.map(tag => (
                            <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editTags.includes(tag)}
                                    onChange={() => handleEditTagChange(tag)} // Use specific handler
                                    className="rounded text-brand-primary focus:ring-brand-primary"
                                />
                                <span className="text-sm text-gray-700">{tag}</span>
                            </label>
                        ))}
                    </div>
                 </div>
                 {/* Edit Image Section */}
                 <div>
                    <label htmlFor="edit-reward-image" className="block text-sm font-medium text-gray-700 mb-1">Reward Image (Optional)</label>
                    <div className="flex items-center space-x-4">
                        {/* Current Image or New Preview */}
                        {editRewardPreview ? (
                            <img src={editRewardPreview} alt="New preview" className="h-16 w-16 object-cover rounded-md border border-gray-300" />
                        ) : editingReward.imageUrl && !removeCurrentImage ? (
                            <img src={editingReward.imageUrl} alt="Current reward" className="h-16 w-16 object-cover rounded-md border border-gray-300" />
                        ) : (
                            <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                        <div className="flex-grow">
                            <Input
                                id="edit-reward-image"
                                type="file"
                                accept="image/jpeg, image/png, image/gif, image/webp"
                                onChange={handleEditImageChange}
                                className="mt-0 w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {/* Remove Image Button */}
                            {(editingReward.imageUrl || editRewardPreview) && !removeCurrentImage && (
                                <Button type="button" variant="link" size="sm" onClick={handleRemoveImageClick} className="mt-1 text-red-600 hover:text-red-800">
                                    Remove Image
                                </Button>
                            )}
                             {removeCurrentImage && (
                                <span className="mt-1 text-sm text-red-600">Image will be removed on save.</span>
                            )}
                        </div>
                    </div>
                 </div>
                 {/* Active Checkbox */}
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

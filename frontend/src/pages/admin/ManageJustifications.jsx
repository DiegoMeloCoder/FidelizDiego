import React, { useState, useEffect } from 'react';
// Firestore imports removed
import apiClient from '../../services/api'; // Import API client
import { useAuth } from '../../contexts/AuthContext.jsx'; // Keep useAuth for companyId check
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { PlusIcon, PencilSquareIcon, CheckCircleIcon, XCircleIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Icons

function ManageJustifications() {
  const { userData } = useAuth();
  const [justifications, setJustifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Add Form State
  const [newJustificationText, setNewJustificationText] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJustification, setEditingJustification] = useState(null);
  const [editText, setEditText] = useState('');
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

  // Fetch justifications
  useEffect(() => {
    // Depend on the nested company ID from the API response
    if (userData?.company?.id) { // Fetch only if ID is available
        fetchJustifications();
    } else if (userData !== null) { // If userData is loaded but no companyId
        setListError("Admin company information not available.");
        setLoading(false);
    }
    // If userData is null (still loading initial profile), loading remains true
  }, [userData?.company?.id]); // <-- Use nested ID

  const fetchJustifications = async () => {
    // Check nested company ID (redundant check removed, handled by useEffect dependency)
    // if (!userData?.company?.id) { // <-- Use nested ID
    //   setListError("Admin company information not available."); setLoading(false); return;
    // }
      setLoading(true);
    setListError('');
    setSuccessMessage('');
    try {
      // Fetch justifications using API (backend handles filtering and sorting)
      const response = await apiClient.get('/justifications');
      // Ensure isActive defaults to true if missing
      const list = response.data.map(j => ({
          ...j,
          estaActiva: j.estaActiva !== undefined ? j.estaActiva : true,
      }));
      setJustifications(list);

    } catch (err) {
      console.error("Error fetching justifications:", err);
      setListError(err.message || 'Failed to load justifications.');
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  // Add Justification
  const handleAddJustification = async (e) => {
    e.preventDefault();
    if (!newJustificationText.trim()) {
      setAddError('Justification text cannot be empty.'); clearMessages(); return;
    }
    // Backend uses the authenticated admin's company ID
    // if (!userData?.company?.id) { // <-- Use nested ID
    //   setAddError("Cannot add justification: Admin's company ID is missing."); clearMessages(); return;
    // }
    setAdding(true); setAddError(''); setListError(''); setSuccessMessage('');
    try {
      // Add justification using API
      const response = await apiClient.post('/justifications', {
        textoJustificacion: newJustificationText.trim(),
        // companyId is handled by the backend
      });
      const addedJustification = response.data; // API returns the created justification

      // Add to local state and re-fetch to get the sorted list from backend
      // Or insert and sort client-side if preferred (less accurate if backend sort changes)
      // Let's re-fetch for simplicity and accuracy
      setNewJustificationText('');
      setSuccessMessage(`Justification added successfully.`);
      fetchJustifications(); // Re-fetch the list
      clearMessages();
    } catch (err) {
      console.error("Error adding justification:", err);
      setAddError(err.message || 'Failed to add justification.');
      clearMessages();
    } finally {
      setAdding(false);
    }
  };

  // Edit Justification - Open Modal
  const handleEditClick = (justification) => {
    // Backend handles preventing edit of global/default, but we can keep the UI check
    // Use nested ID for comparison
    if (justification.companyId !== userData?.company?.id || justification.esPredeterminada) { // <-- Use nested ID
        setEditError("Default or global justifications cannot be edited.");
        clearMessages();
        return;
    }
    setEditingJustification(justification);
    setEditText(justification.textoJustificacion);
    setEditIsActive(justification.estaActiva !== undefined ? justification.estaActiva : true);
    setEditError(''); setSuccessMessage('');
    setIsModalOpen(true);
  };

   // Edit Justification - Save Changes
   const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim() || !editingJustification) {
      setEditError('Justification text cannot be empty.'); clearMessages(); return;
    }
    // Backend handles preventing edit of global/default
    // We can remove the redundant client-side check here if desired,
    // but keeping it provides slightly faster feedback.
    if (editingJustification.companyId !== userData?.company?.id || editingJustification.esPredeterminada) { // <-- Use nested ID
        setEditError('Cannot save changes to a default or global justification.');
        clearMessages();
        return;
    }
    setSaving(true); setEditError(''); setListError(''); setSuccessMessage('');
    try {
      // Update justification using API
      const response = await apiClient.put(`/justifications/${editingJustification.id}`, {
        textoJustificacion: editText.trim(),
        estaActiva: editIsActive,
      });
      const updatedJustification = response.data; // API returns updated justification

      // Update local state
      setJustifications(prev => prev.map(j => j.id === updatedJustification.id ? updatedJustification : j));
      closeModal();
      setSuccessMessage(`Justification updated successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error updating justification:", err);
      setEditError(err.message || 'Failed to update justification.');
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active Status (Activate/Deactivate)
  const handleToggleActive = async (justification) => {
     // Backend handles preventing toggle of global/default, but keep UI check
     if (justification.companyId !== userData?.company?.id || justification.esPredeterminada) { // <-- Use nested ID
        setListError("Default or global justifications cannot be activated/deactivated here.");
        clearMessages();
        return;
    }
     const newState = !(justification.estaActiva !== false); // Handle potential undefined
     const action = newState ? 'activate' : 'deactivate';
     if (window.confirm(`Are you sure you want to ${action} the justification: "${justification.textoJustificacion}"?`)) {
      setListError(''); setSuccessMessage('');
      // Consider adding a temporary loading state on the specific row/button
      try {
        // Toggle status using API
        const response = await apiClient.patch(`/justifications/${justification.id}/toggle-status`);
        const updatedJustification = response.data.justification; // API returns updated justification

        // Update local state
        setJustifications(prev => prev.map(j => j.id === updatedJustification.id ? updatedJustification : j));
        setSuccessMessage(response.data.message); // Use message from API
        clearMessages();
      } catch (err) {
        console.error(`Error ${action}ing justification:`, err);
        setListError(err.message || `Failed to ${action} justification.`);
        clearMessages();
      }
    }
  };


  const closeModal = () => {
    setIsModalOpen(false);
    setEditingJustification(null);
    setEditText('');
    setEditIsActive(true);
  };

  // Define Tailwind classes for table cells
  const thStyle = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 text-sm"; // Removed whitespace-nowrap for description

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <DocumentMagnifyingGlassIcon className="h-7 w-7 mr-2 text-cyan-600" />
        Manage Points Justifications
      </h1>

      {/* Add Justification Form */}
      <form onSubmit={handleAddJustification} className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-3">
         <h2 className="text-lg font-medium text-gray-700">Add New Company Justification</h2>
         <div>
           <label htmlFor="new-justification-text" className="block text-sm font-medium text-gray-700 mb-1">Justification Text</label>
           <Input
             id="new-justification-text"
             type="text"
             value={newJustificationText}
             onChange={(e) => setNewJustificationText(e.target.value)}
             placeholder="e.g., Exceeded Sales Target Q1"
             required
             className="mt-0 w-full"
           />
         </div>
         {addError && <Alert type="error">{addError}</Alert>}
         <div className="flex justify-end">
           <Button type="submit" disabled={adding} variant="primary" className="inline-flex items-center">
             {adding ? <Spinner size="sm" color="text-white" className="mr-2"/> : <PlusIcon className="h-5 w-5 mr-1.5"/>}
             {adding ? 'Adding...' : 'Add Justification'}
           </Button>
         </div>
       </form>

      {/* Display feedback messages */}
      <div className="space-y-3">
        {listError && <Alert type="error">{listError}</Alert>}
        {successMessage && <Alert type="success">{successMessage}</Alert>}
      </div>

      {/* Justifications List */}
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10"><Spinner size="lg" /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={thStyle}>Justification Text</th>
                <th className={thStyle}>Type</th>
                <th className={thStyle}>Status</th>
                <th className={`${thStyle} text-right pr-6`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {justifications.length === 0 ? (
                <tr><td colSpan="4" className={`${tdStyle} text-center text-gray-500 py-6`}>No justifications found. Add company-specific ones above.</td></tr>
              ) : (
                justifications.map((justification) => {
                  // Use nested ID for comparison
                  const isCompanySpecific = justification.companyId === userData?.company?.id && !justification.esPredeterminada; // <-- Use nested ID
                  const isGlobal = justification.companyId === null || justification.esPredeterminada === true;
                  const isActive = justification.estaActiva !== false; // Default to active if undefined

                  return (
                    <tr key={justification.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className={`${tdStyle} text-gray-900`}>{justification.textoJustificacion}</td>
                      <td className={tdStyle}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isGlobal ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {isGlobal ? 'Global/Default' : 'Company'}
                        </span>
                      </td>
                      <td className={tdStyle}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className={`${tdStyle} text-right space-x-2 pr-6`}>
                        {isCompanySpecific ? (
                          <>
                            <Button variant="secondary" size="sm" onClick={() => handleEditClick(justification)} className="inline-flex items-center">
                              <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            {isActive ? (
                              <Button variant="danger" size="sm" onClick={() => handleToggleActive(justification)} className="inline-flex items-center">
                                <XCircleIcon className="h-4 w-4 mr-1" /> Deactivate
                              </Button>
                            ) : (
                              <Button variant="success" size="sm" onClick={() => handleToggleActive(justification)} className="inline-flex items-center">
                                <CheckCircleIcon className="h-4 w-4 mr-1" /> Activate
                              </Button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">N/A (Global)</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

       {/* Edit Modal */}
       {isModalOpen && editingJustification && (
         <Modal isOpen={isModalOpen} onClose={closeModal} title={`Edit Justification`}>
             <form onSubmit={handleSaveEdit} className="space-y-4">
                 <div>
                     <label htmlFor="edit-justification-text" className="block text-sm font-medium text-gray-700 mb-1">Justification Text</label>
                     <Input id="edit-justification-text" type="text" value={editText} onChange={(e) => setEditText(e.target.value)} required className="mt-0 w-full"/>
                 </div>
                 <div>
                    <label htmlFor="edit-justification-active" className="flex items-center cursor-pointer">
                        <input
                            id="edit-justification-active"
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(e) => setEditIsActive(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active (Can be selected for point assignment)</span>
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

export default ManageJustifications;

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, or } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
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
    fetchJustifications();
  }, [userData?.companyId]);

  const fetchJustifications = async () => {
    if (!userData?.companyId) {
      setListError("Admin company information not available.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setListError('');
    setSuccessMessage('');
    try {
      const justCol = collection(db, 'justificacionesPuntos');
      // Query for global (companyId == null OR esPredeterminada == true) AND company-specific justifications
      // Firestore limitation: Cannot have inequality filters on different fields in the same query directly with OR.
      // Option 1: Two separate queries and merge client-side (more flexible)
      // Option 2: Structure data differently (e.g., add companyId to globals during setup - not ideal)
      // Option 3: Use 'in' query if possible (not for null)

      // Using Option 1: Two queries
      const globalQuery = query(
        justCol,
        // Assuming global ones might have companyId == null OR esPredeterminada == true
        // Let's simplify for now: query for companyId == null AND companyId == adminCompanyId
        // We need an OR condition here which Firestore doesn't support well across fields like this.
        // Fetching ALL and filtering client-side might be easier for MVP if index creation is complex.
        // Let's try fetching company-specific and global (null companyId) separately.

        // Query 1: Company Specific
        where('companyId', '==', userData.companyId)
      );
       // Query 2: Global (companyId is null) - Requires composite index usually
       // Firestore might struggle with querying for 'null' efficiently without specific indexes.
       // Let's fetch all for now and filter, simpler for MVP start.
       // TODO: Optimize this fetch later if performance becomes an issue.

      // Fetch ALL justifications and filter client-side for simplicity now
      const allSnapshot = await getDocs(justCol);
      const allList = allSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(j => j.companyId === userData.companyId || j.companyId === null || j.esPredeterminada === true); // Filter relevant

      // Sort: Company specific first, then global, then by text?
      allList.sort((a, b) => {
         // Prioritize company-specific
         if (a.companyId === userData.companyId && b.companyId !== userData.companyId) return -1;
         if (a.companyId !== userData.companyId && b.companyId === userData.companyId) return 1;
         // Prioritize global predeterminada over null companyId if both not company specific
         if (a.esPredeterminada && !b.esPredeterminada) return -1;
         if (!a.esPredeterminada && b.esPredeterminada) return 1;
         // Then sort by text
         return (a.textoJustificacion || '').localeCompare(b.textoJustificacion || '');
      });


      setJustifications(allList);

    } catch (err) {
      console.error("Error fetching justifications:", err);
      setListError('Failed to load justifications. Check console for potential index issues.');
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
    if (!userData?.companyId) {
      setAddError("Cannot add justification: Admin's company ID is missing."); clearMessages(); return;
    }
    setAdding(true); setAddError(''); setListError(''); setSuccessMessage('');
    try {
      const justCol = collection(db, 'justificacionesPuntos');
      const newJustificationData = {
        textoJustificacion: newJustificationText.trim(),
        companyId: userData.companyId, // Link to admin's company
        estaActiva: true,
        esPredeterminada: false, // Company specific are not default
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(justCol, newJustificationData);
      // Add to local state optimistically
      setJustifications(prev => [...prev, { id: docRef.id, ...newJustificationData }].sort((a, b) => { /* Re-apply sort */
         if (a.companyId === userData.companyId && b.companyId !== userData.companyId) return -1;
         if (a.companyId !== userData.companyId && b.companyId === userData.companyId) return 1;
         if (a.esPredeterminada && !b.esPredeterminada) return -1;
         if (!a.esPredeterminada && b.esPredeterminada) return 1;
         return (a.textoJustificacion || '').localeCompare(b.textoJustificacion || '');
      }));
      setNewJustificationText('');
      setSuccessMessage(`Justification added successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error adding justification:", err); setAddError('Failed to add justification.');
      clearMessages();
    } finally {
      setAdding(false);
    }
  };

  // Edit Justification - Open Modal
  const handleEditClick = (justification) => {
    // Only allow editing company-specific justifications
    if (justification.companyId !== userData.companyId || justification.esPredeterminada) {
        alert("Default or global justifications cannot be edited here.");
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
     // Double check it's a company-specific one before saving
     if (editingJustification.companyId !== userData.companyId || editingJustification.esPredeterminada) {
        setEditError('Cannot save changes to a default or global justification.');
        clearMessages();
        return;
    }
    setSaving(true); setEditError(''); setListError(''); setSuccessMessage('');
    try {
      const justDocRef = doc(db, 'justificacionesPuntos', editingJustification.id);
      const updatedData = { textoJustificacion: editText.trim(), estaActiva: editIsActive };
      await updateDoc(justDocRef, updatedData);
      setJustifications(prev => prev.map(j => j.id === editingJustification.id ? { ...j, ...updatedData } : j));
      closeModal();
      setSuccessMessage(`Justification updated successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error updating justification:", err); setEditError('Failed to update justification.');
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active Status (Activate/Deactivate)
  const handleToggleActive = async (justification) => {
     // Only allow toggling company-specific justifications
     if (justification.companyId !== userData.companyId || justification.esPredeterminada) {
        alert("Default or global justifications cannot be activated/deactivated here.");
        return;
    }
    const newState = !justification.estaActiva;
    const action = newState ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${action} the justification: "${justification.textoJustificacion}"?`)) {
      setListError(''); setSuccessMessage('');
      // Consider adding a temporary loading state on the specific row/button
      try {
        const justDocRef = doc(db, 'justificacionesPuntos', justification.id);
        await updateDoc(justDocRef, { estaActiva: newState });
        setJustifications(prev => prev.map(j => j.id === justification.id ? { ...j, estaActiva: newState } : j));
        setSuccessMessage(`Justification ${action}d successfully.`);
        clearMessages();
      } catch (err) {
        console.error(`Error ${action}ing justification:`, err);
        setListError(`Failed to ${action} justification.`);
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
                  const isCompanySpecific = justification.companyId === userData.companyId && !justification.esPredeterminada;
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

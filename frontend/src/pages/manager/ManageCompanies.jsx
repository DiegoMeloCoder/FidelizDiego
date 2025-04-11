import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { PlusIcon, PencilSquareIcon, ArchiveBoxXMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Import icons
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success messages

  // State for Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Function to clear messages after a delay
  const clearMessages = () => {
    setTimeout(() => {
      setAddError('');
      setDeleteError('');
      setListError('');
      setEditError('');
      setSuccessMessage('');
    }, 4000); // Clear after 4 seconds
  };

  // Fetch companies
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setListError(''); setSuccessMessage(''); // Clear messages on fetch
    try {
      const companiesCol = collection(db, 'companies');
      const companySnapshot = await getDocs(companiesCol);
      const companyList = companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompanies(companyList);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setListError('Failed to load companies.');
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  // Add Company
  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) { setAddError('Company name cannot be empty.'); clearMessages(); return; }
    setAdding(true); setAddError(''); setDeleteError(''); setSuccessMessage('');
    try {
      const companiesCol = collection(db, 'companies');
      const newCompanyData = { name: newCompanyName.trim(), status: 'active', createdAt: serverTimestamp() };
      const docRef = await addDoc(companiesCol, newCompanyData);
      setCompanies(prev => [...prev, { id: docRef.id, ...newCompanyData }]);
      setNewCompanyName('');
      setSuccessMessage(`Company "${newCompanyData.name}" added successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error adding company:", err); setAddError('Failed to add company.');
      clearMessages();
    } finally {
      setAdding(false);
    }
  };

  // Edit Company - Open Modal
  const handleEditClick = (company) => {
    setEditingCompany(company);
    setEditName(company.name);
    setEditStatus(company.status || 'active');
    setEditError(''); setSuccessMessage(''); // Clear messages when opening modal
    setIsModalOpen(true);
  };

  // Edit Company - Save Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingCompany) { setEditError('Company name cannot be empty.'); clearMessages(); return; }
    setSaving(true); setEditError(''); setListError(''); setSuccessMessage('');
    try {
      const companyDocRef = doc(db, 'companies', editingCompany.id);
      await updateDoc(companyDocRef, { name: editName.trim(), status: editStatus });
      setCompanies(prev => prev.map(c => c.id === editingCompany.id ? { ...c, name: editName.trim(), status: editStatus } : c));
      closeModal();
      setSuccessMessage(`Company "${editName.trim()}" updated successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error updating company:", err); setEditError('Failed to update company.');
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Delete Company (Logical Delete)
  const handleDeleteClick = async (companyId, companyName) => {
    if (window.confirm(`Are you sure you want to set company "${companyName}" to inactive? This is a logical delete.`)) {
      setDeleteError(''); setListError(''); setSuccessMessage('');
      // TODO: Add button loading state
      try {
        const companyDocRef = doc(db, 'companies', companyId);
        await updateDoc(companyDocRef, { status: 'inactive' });
        setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, status: 'inactive' } : c));
        setSuccessMessage(`Company "${companyName}" set to inactive.`);
        clearMessages();
      } catch (err) {
        console.error("Error deleting company (logically):", err);
        setDeleteError(`Failed to set company "${companyName}" to inactive.`);
        clearMessages();
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setEditName('');
    setEditStatus('active');
  };

  // Activate Company (Moved Inside Component Scope)
  const handleActivateClick = async (companyId, companyName) => {
    // Similar logic to handleDeleteClick, but sets status to 'active'
    if (window.confirm(`Are you sure you want to set company "${companyName}" back to active?`)) {
      setDeleteError(''); setListError(''); setSuccessMessage(''); // Reuse existing state vars or add new ones
      // TODO: Add button loading state if desired
      try {
        const companyDocRef = doc(db, 'companies', companyId);
        await updateDoc(companyDocRef, { status: 'active' });
        // Use functional update for setCompanies to ensure correct state
        setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, status: 'active' } : c));
        setSuccessMessage(`Company "${companyName}" set back to active.`);
        clearMessages();
      } catch (err) {
        console.error("Error activating company:", err);
        setDeleteError(`Failed to set company "${companyName}" to active.`); // Reuse deleteError or add activateError
        clearMessages();
      }
    }
  };

  // Define Tailwind classes for table cells - Refined
  const thStyle = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"; // Added bg-gray-50
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm"; // Adjusted padding

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6"> {/* Added space-y */}
      <h1 className="text-3xl font-bold text-gray-800">Manage Companies</h1>

      {/* Add Company Form - Improved Layout */}
      <form onSubmit={handleAddCompany} className="p-4 border border-gray-200 rounded-md bg-gray-50 flex flex-col sm:flex-row sm:items-end sm:space-x-3 space-y-3 sm:space-y-0">
        <div className="flex-grow">
          <label htmlFor="new-company-name" className="block text-sm font-medium text-gray-700 mb-1">Add New Company</label>
          <Input
            id="new-company-name"
            type="text"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            placeholder="Enter company name..."
            required
            className="mt-0 w-full" // Ensure full width
          />
        </div>
        <Button type="submit" disabled={adding} variant="primary" className="shrink-0 w-full sm:w-auto justify-center">
          {adding ? <Spinner size="sm" color="text-white" className="mr-2"/> : <PlusIcon className="h-5 w-5 mr-1.5"/>}
          {adding ? 'Adding...' : 'Add Company'}
        </Button>
      </form>

      {/* Display feedback messages - Refined styling might be inside Alert component */}
      <div className="space-y-3"> {/* Container for alerts */}
        {addError && <Alert type="error">{addError}</Alert>}
        {deleteError && <Alert type="error">{deleteError}</Alert>}
        {listError && <Alert type="error">{listError}</Alert>}
        {successMessage && <Alert type="success">{successMessage}</Alert>}
      </div>

      {/* Companies List - Improved Styling */}
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10"><Spinner size="lg" /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={thStyle}>Name</th>
                <th className={thStyle}>Status</th>
                <th className={thStyle}>ID</th>
                <th className={`${thStyle} text-right pr-6`}>Actions</th> {/* Added right padding */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.length === 0 ? (
                <tr><td colSpan="4" className={`${tdStyle} text-center text-gray-500 py-6`}>No companies found.</td></tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-150"> {/* Added hover effect */}
                    <td className={`${tdStyle} font-medium text-gray-900`}>{company.name}</td>
                    <td className={tdStyle}>
                      {/* Improved Status Badge */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        company.status === 'active' ? 'bg-green-100 text-green-800' :
                        company.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        company.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800' // Default/fallback
                      }`}>
                        {company.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`${tdStyle} text-gray-500 font-mono text-xs`}>{company.id}</td> {/* Smaller mono font for ID */}
                    <td className={`${tdStyle} text-right space-x-2 pr-6`}> {/* Added right padding */}
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(company)} className="inline-flex items-center">
                        <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      {company.status === 'active' && (
                         <Button variant="danger" size="sm" onClick={() => handleDeleteClick(company.id, company.name)} className="inline-flex items-center">
                           <ArchiveBoxXMarkIcon className="h-4 w-4 mr-1" /> Set Inactive
                         </Button>
                      )}
                      {company.status === 'inactive' && (
                         <Button variant="success" size="sm" onClick={() => handleActivateClick(company.id, company.name)} className="inline-flex items-center"> {/* Dedicated Activate Button */}
                           <ArrowPathIcon className="h-4 w-4 mr-1" /> Set Active
                         </Button>
                      )}
                       {/* Consider adding Edit button back for inactive if needed */}
                       {/* {company.status === 'inactive' && (
                         <Button variant="secondary" size="sm" onClick={() => handleEditClick(company)} className="inline-flex items-center">
                           <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                         </Button>
                       )} */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal - Styling assumed consistent via Modal component */}
      {isModalOpen && editingCompany && (
         <Modal isOpen={isModalOpen} onClose={closeModal} title={`Edit Company: ${editingCompany.name}`}>
             <form onSubmit={handleSaveEdit} className="space-y-4"> {/* Added space-y */}
                 <div>
                     <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                     <Input id="edit-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="mt-0 w-full"/>
                 </div>
                 <div>
                     <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                     {/* Using custom select or styled native select */}
                     <select
                       id="edit-status"
                       value={editStatus}
                       onChange={(e) => setEditStatus(e.target.value)}
                       className="block w-full px-3 py-2 mt-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                     >
                         <option value="active">Active</option>
                         <option value="inactive">Inactive</option>
                         <option value="pending_payment">Pending Payment</option>
                     </select>
                 </div>
                 {editError && <Alert type="error">{editError}</Alert>}
                 <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4"> {/* Added border top */}
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

export default ManageCompanies;

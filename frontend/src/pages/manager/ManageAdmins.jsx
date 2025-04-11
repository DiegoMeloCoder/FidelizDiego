import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'; // Added serverTimestamp
import { initializeApp, deleteApp } from 'firebase/app'; // Added for secondary app
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Added getAuth
import { db, firebaseConfig } from '../../firebase/config'; // Import firebaseConfig, keep db for Firestore ops
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { PlusIcon, PencilSquareIcon, UserMinusIcon, UserPlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'; // Icons

function ManageAdmins() {
  // Note: Manager doesn't have a companyId in userData, they manage multiple companies.
  const { currentUser } = useAuth(); // Manager's own user info (might not be needed directly)
  const [admins, setAdmins] = useState([]);
  const [companies, setCompanies] = useState([]); // Need companies to assign admins
  const [companyMap, setCompanyMap] = useState({}); // For easy lookup of company names
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Add Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(''); // Company to assign admin to
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  // Maybe add company change later if needed
  // const [editCompanyId, setEditCompanyId] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Function to clear messages
  const clearMessages = () => {
    setTimeout(() => {
      setAddError(''); setListError(''); setEditError(''); setSuccessMessage('');
    }, 4000);
  };

  // Fetch Admins and Companies
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setListError('');
      setSuccessMessage('');
      try {
        // Fetch Companies first to create a map
        const companiesCol = collection(db, 'companies');
        const companySnapshot = await getDocs(companiesCol);
        const companyList = companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCompanies(companyList);
        const cMap = companyList.reduce((map, company) => {
          map[company.id] = company.name;
          return map;
        }, {});
        setCompanyMap(cMap);
        if (companyList.length > 0) {
            setSelectedCompanyId(companyList[0].id); // Default selection for add form
        }


        // Fetch Admins
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where('role', '==', 'Admin'));
        const adminSnapshot = await getDocs(q);
        const adminList = adminSnapshot.docs.map(doc => ({
          id: doc.id,
          // Default isActive to true if undefined
          isActive: doc.data().isActive !== undefined ? doc.data().isActive : true,
          ...doc.data()
        }));
        setAdmins(adminList);

      } catch (err) {
        console.error("Error fetching data:", err);
        setListError('Failed to load admins or companies.');
        clearMessages();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Handlers for Add/Edit/Toggle ---

   // Add Admin Handler
   const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim() || !selectedCompanyId) {
      setAddError('Please fill in all fields and select a company.'); clearMessages(); return;
    }
    setAdding(true); setAddError(''); setListError(''); setSuccessMessage('');
    let tempApp = null; // Variable to hold the temporary app instance
    let newUser = null; // Variable to hold the created user

    try {
      // 1. Initialize temporary Firebase app
      // Use a unique name to avoid conflicts if the modal is opened multiple times quickly
      const tempAppName = `secondary-auth-${Date.now()}`;
      tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getAuth(tempApp);

      // 2. Create Firebase Auth user using the temporary instance
      console.log("Creating user with temporary auth instance...");
      const userCredential = await createUserWithEmailAndPassword(tempAuth, newAdminEmail, newAdminPassword);
      newUser = userCredential.user;
      console.log("User created successfully in temporary auth instance:", newUser.uid);

      // 3. Create Firestore user document (using the main 'db' instance)
      const userDocRef = doc(db, 'users', newUser.uid); // Use main db instance
      const newAdminData = {
        email: newAdminEmail,
        name: newAdminName.trim(),
        role: 'Admin',
        companyId: selectedCompanyId,
        isActive: true,
        createdAt: serverTimestamp() // Add createdAt timestamp
      };
      await setDoc(userDocRef, newAdminData); // Use main db instance

      // 4. Update local state
      // Add the new admin to the local state for immediate UI update
      setAdmins(prev => [...prev, { id: newUser.uid, ...newAdminData, isActive: true }]); // Ensure isActive is set locally
      setNewAdminName(''); setNewAdminEmail(''); setNewAdminPassword('');
      setSelectedCompanyId(companies.length > 0 ? companies[0].id : ''); // Reset dropdown
      closeAddModal();
      setSuccessMessage(`Admin ${newAdminData.name} added successfully and assigned to ${companyMap[selectedCompanyId]}.`);
      clearMessages();

    } catch (err) {
      console.error("Error adding admin:", err);
      // No need to delete Auth user here as it was created in a separate instance
      // Handle specific auth errors from the temporary instance
      if (err.code === 'auth/email-already-in-use') {
        setAddError('This email address is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setAddError('Password is too weak (min. 6 characters).');
      } else {
        // General error (could be auth or Firestore)
        setAddError('Failed to add admin. Check console for details.');
      }
      clearMessages();
    } finally {
      setAdding(false);
      // 5. Clean up the temporary Firebase app instance regardless of success/failure
      if (tempApp) {
        try {
          await deleteApp(tempApp);
          console.log("Temporary Firebase app instance deleted.");
        } catch (deleteError) {
          console.error("Error deleting temporary Firebase app instance:", deleteError);
        }
      }
    }
  };

  // Edit Admin - Open Modal
  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setEditName(admin.name || '');
    setEditIsActive(admin.isActive);
    // setEditCompanyId(admin.companyId); // For company change later
    setEditError(''); setSuccessMessage('');
    setIsEditModalOpen(true);
  };

  // Edit Admin - Save Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingAdmin) {
      setEditError('Admin name cannot be empty.'); clearMessages(); return;
    }
    setSaving(true); setEditError(''); setListError(''); setSuccessMessage('');
    try {
      const adminDocRef = doc(db, 'users', editingAdmin.id);
      // Only update name and isActive for now
      const updatedData = { name: editName.trim(), isActive: editIsActive };
      await updateDoc(adminDocRef, updatedData);
      setAdmins(prev => prev.map(adm => adm.id === editingAdmin.id ? { ...adm, ...updatedData } : adm));
      closeEditModal();
      setSuccessMessage(`Admin "${editName.trim()}" updated successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error updating admin:", err); setEditError('Failed to update admin.');
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

   // Toggle Active Status
   const handleToggleActive = async (admin) => {
    const newState = !admin.isActive;
    const action = newState ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${action} admin "${admin.name || admin.email}"?`)) {
      setListError(''); setSuccessMessage('');
      try {
        const adminDocRef = doc(db, 'users', admin.id);
        await updateDoc(adminDocRef, { isActive: newState });
        setAdmins(prev => prev.map(adm => adm.id === admin.id ? { ...adm, isActive: newState } : adm));
        setSuccessMessage(`Admin ${action}d successfully.`);
        clearMessages();
      } catch (err) {
        console.error(`Error ${action}ing admin:`, err);
        setListError(`Failed to ${action} admin.`);
        clearMessages();
      }
    }
  };

  // Modal close handlers
  const closeAddModal = () => setIsAddModalOpen(false);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAdmin(null);
    setEditName('');
    setEditIsActive(true);
  };

  // --- Render Logic ---
  const thStyle = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Manage Admins</h1>
        <Button onClick={() => setIsAddModalOpen(true)} variant="primary" className="w-full sm:w-auto inline-flex items-center justify-center">
          <PlusIcon className="h-5 w-5 mr-1.5" />
          Add New Admin
        </Button>
      </div>

      {/* Feedback Messages */}
      <div className="space-y-3">
        {listError && <Alert type="error">{listError}</Alert>}
        {successMessage && <Alert type="success">{successMessage}</Alert>}
      </div>

      {/* Admins List */}
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10"><Spinner size="lg" /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={thStyle}>Name</th>
                <th className={thStyle}>Email</th>
                <th className={thStyle}>Company</th>
                <th className={thStyle}>Status</th>
                <th className={`${thStyle} text-right pr-6`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.length === 0 ? (
                <tr><td colSpan="5" className={`${tdStyle} text-center text-gray-500 py-6`}>No Admins found.</td></tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className={`${tdStyle} font-medium text-gray-900`}>{admin.name || <span className="text-gray-400 italic">No Name</span>}</td>
                    <td className={`${tdStyle} text-gray-500`}>{admin.email}</td>
                    <td className={`${tdStyle} text-gray-500`}>
                      {companyMap[admin.companyId] || <span className="text-gray-400 italic">Unassigned</span>}
                    </td>
                    <td className={tdStyle}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className={`${tdStyle} text-right space-x-2 pr-6`}>
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(admin)} className="inline-flex items-center">
                        <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      {admin.isActive ? (
                         <Button variant="danger" size="sm" onClick={() => handleToggleActive(admin)} className="inline-flex items-center">
                           <UserMinusIcon className="h-4 w-4 mr-1" /> Deactivate
                         </Button>
                      ) : (
                         <Button variant="success" size="sm" onClick={() => handleToggleActive(admin)} className="inline-flex items-center">
                           <UserPlusIcon className="h-4 w-4 mr-1" /> Activate
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

      {/* Add Admin Modal */}
      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add New Admin">
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label htmlFor="new-admin-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <Input id="new-admin-name" type="text" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} required className="mt-0 w-full"/>
          </div>
          <div>
            <label htmlFor="new-admin-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <Input id="new-admin-email" type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} required className="mt-0 w-full"/>
          </div>
          <div>
            <label htmlFor="new-admin-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input id="new-admin-password" type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} required minLength="6" className="mt-0 w-full"/>
          </div>
          <div>
            <label htmlFor="assign-company" className="block text-sm font-medium text-gray-700 mb-1">Assign to Company</label>
            <select
              id="assign-company"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {companies.length === 0 && <option value="" disabled>No companies available</option>}
              {companies.map(comp => (
                <option key={comp.id} value={comp.id}>{comp.name}</option>
              ))}
            </select>
          </div>
          {addError && <Alert type="error">{addError}</Alert>}
          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
            <Button type="button" variant="secondary" onClick={closeAddModal} disabled={adding}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={adding || companies.length === 0} className="inline-flex items-center">
              {adding ? <Spinner size="sm" color="text-white" className="mr-2"/> : <PlusIcon className="h-5 w-5 mr-1.5"/>}
              {adding ? 'Adding...' : 'Add Admin'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Admin Modal */}
      {isEditModalOpen && editingAdmin && (
         <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title={`Edit Admin: ${editingAdmin.name || editingAdmin.email}`}>
             <form onSubmit={handleSaveEdit} className="space-y-4">
                 <div>
                     <label htmlFor="edit-admin-name" className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                     <Input id="edit-admin-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="mt-0 w-full"/>
                 </div>
                 <div>
                     <label htmlFor="edit-admin-email" className="block text-sm font-medium text-gray-700 mb-1">Email (Read-only)</label>
                     <Input id="edit-admin-email" type="email" value={editingAdmin.email} readOnly disabled className="bg-gray-100 mt-0 w-full cursor-not-allowed" />
                 </div>
                 {/* TODO: Add Company Change Dropdown if needed */}
                 <div>
                    <label htmlFor="edit-admin-active" className="flex items-center cursor-pointer">
                        <input
                            id="edit-admin-active"
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(e) => setEditIsActive(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active (User can log in)</span>
                    </label>
                 </div>
                 {editError && <Alert type="error">{editError}</Alert>}
                 <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
                     <Button type="button" variant="secondary" onClick={closeEditModal} disabled={saving}>Cancel</Button>
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

export default ManageAdmins;

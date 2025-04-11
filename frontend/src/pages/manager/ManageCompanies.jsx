import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
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

  // State for Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Fetch companies
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setListError('');
    try {
      const companiesCol = collection(db, 'companies');
      const companySnapshot = await getDocs(companiesCol);
      const companyList = companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompanies(companyList);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setListError('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  // Add Company
  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) { setAddError('Company name cannot be empty.'); return; }
    setAdding(true); setAddError(''); setDeleteError('');
    try {
      const companiesCol = collection(db, 'companies');
      const newCompanyData = { name: newCompanyName.trim(), status: 'active', createdAt: serverTimestamp() };
      const docRef = await addDoc(companiesCol, newCompanyData);
      setCompanies(prev => [...prev, { id: docRef.id, ...newCompanyData }]);
      setNewCompanyName('');
      // TODO: Show success Alert
    } catch (err) {
      console.error("Error adding company:", err); setAddError('Failed to add company.');
    } finally {
      setAdding(false);
    }
  };

  // Edit Company - Open Modal
  const handleEditClick = (company) => {
    setEditingCompany(company);
    setEditName(company.name);
    setEditStatus(company.status || 'active');
    setEditError('');
    setIsModalOpen(true);
  };

  // Edit Company - Save Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingCompany) { setEditError('Company name cannot be empty.'); return; }
    setSaving(true); setEditError(''); setListError('');
    try {
      const companyDocRef = doc(db, 'companies', editingCompany.id);
      await updateDoc(companyDocRef, { name: editName.trim(), status: editStatus });
      setCompanies(prev => prev.map(c => c.id === editingCompany.id ? { ...c, name: editName.trim(), status: editStatus } : c));
      closeModal();
      // TODO: Show success Alert
    } catch (err) {
      console.error("Error updating company:", err); setEditError('Failed to update company.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Company (Logical Delete)
  const handleDeleteClick = async (companyId, companyName) => {
    if (window.confirm(`Are you sure you want to set company "${companyName}" to inactive? This is a logical delete.`)) {
      setDeleteError(''); setListError(''); // Clear errors
      // TODO: Add button loading state
      try {
        const companyDocRef = doc(db, 'companies', companyId);
        await updateDoc(companyDocRef, { status: 'inactive' });
        setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, status: 'inactive' } : c));
        // TODO: Show success Alert
      } catch (err) {
        console.error("Error deleting company (logically):", err);
        setDeleteError(`Failed to set company "${companyName}" to inactive.`);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setEditName('');
    setEditStatus('active');
  };

  // Define Tailwind classes for table cells
  const thStyle = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tdStyle = "px-6 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Companies</h1>

      {/* Add Company Form */}
      <form onSubmit={handleAddCompany} className="mb-6 flex items-end space-x-3">
        <div className="flex-grow">
          <label htmlFor="new-company-name" className="block text-sm font-medium text-gray-700 mb-1">New Company Name</label>
          <Input id="new-company-name" type="text" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="Enter company name" required className="mt-0" />
        </div>
        <Button type="submit" disabled={adding} variant="primary" className="shrink-0">
          {adding ? <Spinner size="sm" color="text-white" className="mr-2"/> : null}
          {adding ? 'Adding...' : 'Add Company'}
        </Button>
      </form>
      {/* Use Alert component for errors */}
      {addError && <Alert type="error" className="mb-4">{addError}</Alert>}
      {deleteError && <Alert type="error" className="mb-4">{deleteError}</Alert>}
      {listError && <Alert type="error" className="mb-4">{listError}</Alert>}

      {/* Companies List */}
      {loading ? (
        <div className="flex justify-center items-center p-8"><Spinner size="lg" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={thStyle}>Name</th>
                <th className={thStyle}>Status</th>
                <th className={thStyle}>ID</th>
                <th className={`${thStyle} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.length === 0 ? (
                <tr><td colSpan="4" className={`${tdStyle} text-center text-gray-500`}>No companies found.</td></tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id}>
                    <td className={`${tdStyle} font-medium text-gray-900`}>{company.name}</td>
                    <td className={tdStyle}>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {company.status}
                      </span>
                    </td>
                    <td className={`${tdStyle} text-gray-500`}>{company.id}</td>
                    <td className={`${tdStyle} text-right space-x-2`}>
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(company)}>Edit</Button>
                      {company.status !== 'inactive' && (
                         <Button variant="danger" size="sm" onClick={() => handleDeleteClick(company.id, company.name)}>
                           Set Inactive
                         </Button>
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
      {isModalOpen && editingCompany && (
         <Modal isOpen={isModalOpen} onClose={closeModal} title={`Edit Company: ${editingCompany.name}`}>
             <form onSubmit={handleSaveEdit}>
                 <div className="mb-4">
                     <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                     <Input id="edit-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                 </div>
                 <div className="mb-4">
                     <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                     <select id="edit-status" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                         <option value="active">Active</option>
                         <option value="inactive">Inactive</option>
                         <option value="pending_payment">Pending Payment</option>
                     </select>
                 </div>
                 {editError && <Alert type="error" className="mb-4">{editError}</Alert>}
                 <div className="flex justify-end space-x-3">
                     <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
                     <Button type="submit" variant="primary" disabled={saving}>
                       {saving ? <Spinner size="sm" color="text-white" className="mr-2"/> : null}
                       {saving ? 'Saving...' : 'Save Changes'}
                     </Button>
                 </div>
             </form>
         </Modal>
      )}

      {/* Removed <style jsx> block */}
    </div>
  );
}

export default ManageCompanies;

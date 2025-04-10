import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal'; // Import the actual Modal component

function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  // State for Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null); // { id, name, status }
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
    setError('');
    try {
      const companiesCol = collection(db, 'companies');
      const companySnapshot = await getDocs(companiesCol);
      const companyList = companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompanies(companyList);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  // Add Company
  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) { setError('Company name cannot be empty.'); return; }
    setAdding(true); setError('');
    try {
      const companiesCol = collection(db, 'companies');
      const newCompanyData = { name: newCompanyName.trim(), status: 'active', createdAt: serverTimestamp() };
      const docRef = await addDoc(companiesCol, newCompanyData);
      setCompanies(prev => [...prev, { id: docRef.id, ...newCompanyData }]);
      setNewCompanyName('');
    } catch (err) {
      console.error("Error adding company:", err); setError('Failed to add company.');
    } finally {
      setAdding(false);
    }
  };

  // Edit Company - Open Modal
  const handleEditClick = (company) => {
    setEditingCompany(company);
    setEditName(company.name);
    setEditStatus(company.status || 'active'); // Default if status is missing
    setEditError('');
    setIsModalOpen(true);
  };

  // Edit Company - Save Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingCompany) { setEditError('Company name cannot be empty.'); return; }
    setSaving(true); setEditError('');
    try {
      const companyDocRef = doc(db, 'companies', editingCompany.id);
      await updateDoc(companyDocRef, {
        name: editName.trim(),
        status: editStatus,
      });
      // Update local state
      setCompanies(prev => prev.map(c =>
        c.id === editingCompany.id ? { ...c, name: editName.trim(), status: editStatus } : c
      ));
      closeModal();
    } catch (err) {
      console.error("Error updating company:", err); setEditError('Failed to update company.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Company (Logical Delete)
  const handleDeleteClick = async (companyId, companyName) => {
    if (window.confirm(`Are you sure you want to set company "${companyName}" to inactive? This is a logical delete.`)) {
      // Consider adding a loading state for delete
      try {
        const companyDocRef = doc(db, 'companies', companyId);
        await updateDoc(companyDocRef, {
          status: 'inactive', // Set status to inactive
        });
        // Update local state
        setCompanies(prev => prev.map(c =>
          c.id === companyId ? { ...c, status: 'inactive' } : c
        ));
        // Or filter out if you prefer: setCompanies(prev => prev.filter(c => c.id !== companyId));
      } catch (err) {
        console.error("Error deleting company (logically):", err);
        setError(`Failed to set company "${companyName}" to inactive.`); // Show error specific to delete
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setEditName('');
    setEditStatus('active');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Companies</h1>

      {/* Add Company Form */}
      <form onSubmit={handleAddCompany} className="mb-6 flex items-end space-x-3">
        <div className="flex-grow">
          <label htmlFor="new-company-name" className="block text-sm font-medium text-gray-700 mb-1">New Company Name</label>
          <Input id="new-company-name" type="text" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="Enter company name" required className="mt-0" />
        </div>
        <Button type="submit" disabled={adding} variant="primary" className="shrink-0">{adding ? 'Adding...' : 'Add Company'}</Button>
      </form>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Companies List */}
      {loading ? <p>Loading companies...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th-style">Name</th>
                <th className="th-style">Status</th>
                <th className="th-style">ID</th>
                <th className="th-style text-right">Actions</th> {/* Actions Column */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.length === 0 ? (
                <tr><td colSpan="4" className="td-style text-center text-gray-500">No companies found.</td></tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id}>
                    <td className="td-style font-medium text-gray-900">{company.name}</td>
                    <td className="td-style">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="td-style text-gray-500">{company.id}</td>
                    <td className="td-style text-right space-x-2"> {/* Actions Buttons */}
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(company)}>Edit</Button>
                      {company.status !== 'inactive' && ( // Only show delete for active companies
                         <Button variant="danger" size="sm" onClick={() => handleDeleteClick(company.id, company.name)}>Set Inactive</Button>
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
                         <option value="pending_payment">Pending Payment</option> {/* Added from requirements */}
                     </select>
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

// Removed the placeholder Modal definition

export default ManageCompanies;

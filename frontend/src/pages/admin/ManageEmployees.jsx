import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Keep for adding
// Note: We are NOT importing functions to delete/update Auth users from client for security.
import { db, auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert'; // Import Alert

function ManageEmployees() {
  const { userData: adminUserData } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(''); // Renamed for clarity

  // Add Form State
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeePassword, setNewEmployeePassword] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null); // { id, name, email, isActive, ... }
  const [editName, setEditName] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, [adminUserData?.companyId]);

  const fetchEmployees = async () => {
     if (!adminUserData?.companyId) {
        setListError("Admin company information not available."); setLoading(false); return; // Use listError
      }
      setLoading(true); setListError(''); // Clear listError
      try {
        const usersCol = collection(db, 'users');
        const q = query(
          usersCol,
          where('role', '==', 'Employee'),
          where('companyId', '==', adminUserData.companyId)
        );
        const snapshot = await getDocs(q);
        // Default isActive to true if missing from Firestore document
        const list = snapshot.docs.map(doc => ({ id: doc.id, isActive: true, ...doc.data() }));
        setEmployees(list);
      } catch (err) {
        console.error("Error fetching employees:", err); setListError('Failed to load employees.'); // Use listError
      } finally {
        setLoading(false);
      }
  };

  // Add Employee Handler (remains the same)
  const handleAddEmployee = async (e) => {
    // ... (add logic remains the same) ...
     e.preventDefault();
    if (!newEmployeeName.trim() || !newEmployeeEmail.trim() || !newEmployeePassword.trim()) {
      setAddError('Please fill in all fields.'); return;
    }
    if (!adminUserData?.companyId) {
      setAddError("Cannot add employee: Admin's company ID is missing."); return;
    }

    setAdding(true); setAddError('');
    let newUserCredential = null;
    try {
      newUserCredential = await createUserWithEmailAndPassword(auth, newEmployeeEmail, newEmployeePassword);
      const newUser = newUserCredential.user;
      const userDocRef = doc(db, 'users', newUser.uid);
      const newEmployeeData = {
        email: newEmployeeEmail, name: newEmployeeName.trim(), role: 'Employee',
        companyId: adminUserData.companyId, points: 0, isActive: true, // Add isActive on creation
      };
      await setDoc(userDocRef, newEmployeeData);
      setEmployees(prev => [...prev, { id: newUser.uid, ...newEmployeeData }]);
      setNewEmployeeName(''); setNewEmployeeEmail(''); setNewEmployeePassword('');
      // TODO: Replace alert with Alert component, maybe outside the form?
      alert('Employee added successfully! Note: Your session might be affected; refresh if needed.');
    } catch (err) {
      console.error("Error adding employee:", err);
      // Use addError state for form-specific errors
      if (err.code === 'auth/email-already-in-use') {
        setAddError('This email address is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setAddError('Password is too weak (min. 6 characters).');
      } else {
        setAddError('Failed to add employee. Check console for details.');
      }
    } finally {
      setAdding(false);
    }
  };

  // Edit Employee - Open Modal
  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setEditName(employee.name || ''); // Handle potentially missing name
    setEditIsActive(employee.isActive !== undefined ? employee.isActive : true); // Default to true
    setEditError('');
    setIsModalOpen(true);
  };

  // Edit Employee - Save Changes (only name and isActive)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingEmployee) {
      setEditError('Employee name cannot be empty.'); return;
    }
    setSaving(true); setEditError('');
    try {
      const employeeDocRef = doc(db, 'users', editingEmployee.id);
      const updatedData = {
        name: editName.trim(),
        isActive: editIsActive,
        // DO NOT update email/password from client-side for security
      };
      await updateDoc(employeeDocRef, updatedData);
      setEmployees(prev => prev.map(emp =>
        emp.id === editingEmployee.id ? { ...emp, ...updatedData } : emp
      ));
      closeModal();
      // Optionally show success alert
    } catch (err) {
      console.error("Error updating employee:", err); setEditError('Failed to update employee.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Employee (Logical Delete - Set isActive to false)
  const handleDeleteClick = async (employeeId, employeeName) => {
    if (window.confirm(`Are you sure you want to set employee "${employeeName || 'N/A'}" to inactive? They won't be able to log in.`)) {
      try {
        const employeeDocRef = doc(db, 'users', employeeId);
        await updateDoc(employeeDocRef, { isActive: false });
        setEmployees(prev => prev.map(emp =>
          emp.id === employeeId ? { ...emp, isActive: false } : emp
        ));
        // Note: This doesn't disable the Firebase Auth user, only marks inactive in Firestore.
        // Full deactivation requires backend/Admin SDK.
        // Optionally show success alert
      } catch (err) {
        console.error("Error setting employee inactive:", err);
        setListError(`Failed to set employee "${employeeName || 'N/A'}" to inactive.`); // Use listError for table-level feedback
      }
    }
  };

   // Activate Employee (Set isActive to true)
   const handleActivateClick = async (employeeId, employeeName) => {
    if (window.confirm(`Are you sure you want to set employee "${employeeName || 'N/A'}" to active?`)) {
      try {
        const employeeDocRef = doc(db, 'users', employeeId);
        await updateDoc(employeeDocRef, { isActive: true });
        setEmployees(prev => prev.map(emp =>
          emp.id === employeeId ? { ...emp, isActive: true } : emp
        ));
        // Optionally show success alert
      } catch (err) {
        console.error("Error setting employee active:", err);
        setListError(`Failed to set employee "${employeeName || 'N/A'}" to active.`); // Use listError
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setEditName('');
    setEditIsActive(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Employees</h1>

      {/* Add Employee Form */}
      <form onSubmit={handleAddEmployee} className="mb-6 p-4 border rounded-md bg-gray-50">
        {/* ... (Add form remains the same) ... */}
         <h2 className="text-lg font-medium text-gray-700 mb-3">Add New Employee</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
           <Input type="text" value={newEmployeeName} onChange={(e) => setNewEmployeeName(e.target.value)} placeholder="Full Name" required />
           <Input type="email" value={newEmployeeEmail} onChange={(e) => setNewEmployeeEmail(e.target.value)} placeholder="Email Address" required />
           <Input type="password" value={newEmployeePassword} onChange={(e) => setNewEmployeePassword(e.target.value)} placeholder="Password (min. 6 chars)" required minLength="6" />
         </div>
         {addError && <p className="text-sm text-red-600 mb-2">{addError}</p>}
         <Button type="submit" disabled={adding} variant="primary">
           {adding ? <Spinner size="sm" color="text-white" className="mr-2"/> : null}
           {adding ? 'Adding...' : 'Add Employee'}
         </Button>
      </form>

      {/* Employees List */}
      {/* Use Alert for list-level errors */}
      {listError && <Alert type="error" className="mb-4">{listError}</Alert>}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="th-style">Name</th>
                <th className="th-style">Email</th>
                <th className="th-style">Points</th>
                <th className="th-style">Status</th> {/* Added Status Column */}
                <th className="th-style text-right">Actions</th> {/* Added Actions Column */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr><td colSpan="5" className="td-style text-center text-gray-500">No employees found.</td></tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="td-style font-medium text-gray-900">{employee.name || 'N/A'}</td>
                    <td className="td-style text-gray-500">{employee.email}</td>
                    <td className="td-style text-gray-500">{employee.points ?? 0}</td>
                    <td className="td-style"> {/* Status Indicator */}
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                         {employee.isActive ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className="td-style text-right space-x-2"> {/* Actions */}
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(employee)}>Edit</Button>
                      {employee.isActive ? (
                         <Button variant="danger" size="sm" onClick={() => handleDeleteClick(employee.id, employee.name)}>
                           {/* TODO: Add loading state */}
                           Set Inactive
                         </Button>
                      ) : (
                         <Button variant="secondary" size="sm" onClick={() => handleActivateClick(employee.id, employee.name)}>
                           {/* TODO: Add loading state */}
                           Set Active
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
       {isModalOpen && editingEmployee && (
         <Modal isOpen={isModalOpen} onClose={closeModal} title={`Edit Employee: ${editingEmployee.name || editingEmployee.email}`}>
             <form onSubmit={handleSaveEdit}>
                 <div className="mb-4">
                     <label htmlFor="edit-employee-name" className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                     <Input id="edit-employee-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                 </div>
                 {/* Email is read-only in edit modal */}
                 <div className="mb-4">
                     <label htmlFor="edit-employee-email" className="block text-sm font-medium text-gray-700 mb-1">Email (Read-only)</label>
                     <Input id="edit-employee-email" type="email" value={editingEmployee.email} readOnly disabled className="bg-gray-100" />
                 </div>
                 <div className="mb-4">
                    <label htmlFor="edit-employee-active" className="flex items-center">
                        <input
                            id="edit-employee-active"
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(e) => setEditIsActive(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active (User can log in)</span>
                    </label>
                 </div>
                 {/* Use Alert for edit errors */}
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

      {/* Basic Table Styling */}
      <style jsx>{`
        .th-style { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .td-style { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; }
      `}</style>
    </div>
  );
}

export default ManageEmployees;

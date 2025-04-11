import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

function ManageEmployees() {
  const { userData: adminUserData } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success messages

  // Add Form State
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeePassword, setNewEmployeePassword] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editName, setEditName] = useState('');
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

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, [adminUserData?.companyId]);

  const fetchEmployees = async () => {
     if (!adminUserData?.companyId) {
        setListError("Admin company information not available."); setLoading(false); return;
      }
      setLoading(true); setListError(''); setSuccessMessage('');
      try {
        const usersCol = collection(db, 'users');
        const q = query(
          usersCol,
          where('role', '==', 'Employee'),
          where('companyId', '==', adminUserData.companyId)
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, isActive: true, ...doc.data() }));
        setEmployees(list);
      } catch (err) {
        console.error("Error fetching employees:", err); setListError('Failed to load employees.');
        clearMessages();
      } finally {
        setLoading(false);
      }
  };

  // Add Employee Handler
  const handleAddEmployee = async (e) => {
     e.preventDefault();
    if (!newEmployeeName.trim() || !newEmployeeEmail.trim() || !newEmployeePassword.trim()) {
      setAddError('Please fill in all fields.'); clearMessages(); return;
    }
    if (!adminUserData?.companyId) {
      setAddError("Cannot add employee: Admin's company ID is missing."); clearMessages(); return;
    }

    setAdding(true); setAddError(''); setListError(''); setSuccessMessage('');
    let newUserCredential = null;
    try {
      newUserCredential = await createUserWithEmailAndPassword(auth, newEmployeeEmail, newEmployeePassword);
      const newUser = newUserCredential.user;
      const userDocRef = doc(db, 'users', newUser.uid);
      const newEmployeeData = {
        email: newEmployeeEmail, name: newEmployeeName.trim(), role: 'Employee',
        companyId: adminUserData.companyId, points: 0, isActive: true,
      };
      await setDoc(userDocRef, newEmployeeData);
      setEmployees(prev => [...prev, { id: newUser.uid, ...newEmployeeData }]);
      setNewEmployeeName(''); setNewEmployeeEmail(''); setNewEmployeePassword('');
      setSuccessMessage(`Employee ${newEmployeeData.name} added successfully! Note: Your session might be affected; refresh if needed.`);
      clearMessages();
    } catch (err) {
      console.error("Error adding employee:", err);
      if (err.code === 'auth/email-already-in-use') {
        setAddError('This email address is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setAddError('Password is too weak (min. 6 characters).');
      } else {
        setAddError('Failed to add employee. Check console for details.');
      }
      clearMessages();
    } finally {
      setAdding(false);
    }
  };

  // Edit Employee - Open Modal
  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setEditName(employee.name || '');
    setEditIsActive(employee.isActive !== undefined ? employee.isActive : true);
    setEditError(''); setSuccessMessage('');
    setIsModalOpen(true);
  };

  // Edit Employee - Save Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingEmployee) {
      setEditError('Employee name cannot be empty.'); clearMessages(); return;
    }
    setSaving(true); setEditError(''); setListError(''); setSuccessMessage('');
    try {
      const employeeDocRef = doc(db, 'users', editingEmployee.id);
      const updatedData = { name: editName.trim(), isActive: editIsActive };
      await updateDoc(employeeDocRef, updatedData);
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...emp, ...updatedData } : emp));
      closeModal();
      setSuccessMessage(`Employee "${editName.trim()}" updated successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error updating employee:", err); setEditError('Failed to update employee.');
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Delete Employee (Logical Delete)
  const handleDeleteClick = async (employeeId, employeeName) => {
    if (window.confirm(`Are you sure you want to set employee "${employeeName || 'N/A'}" to inactive? They won't be able to log in.`)) {
      setListError(''); setSuccessMessage('');
      // TODO: Add button loading state
      try {
        const employeeDocRef = doc(db, 'users', employeeId);
        await updateDoc(employeeDocRef, { isActive: false });
        setEmployees(prev => prev.map(emp => emp.id === employeeId ? { ...emp, isActive: false } : emp));
        setSuccessMessage(`Employee "${employeeName || 'N/A'}" set to inactive.`);
        clearMessages();
      } catch (err) {
        console.error("Error setting employee inactive:", err);
        setListError(`Failed to set employee "${employeeName || 'N/A'}" to inactive.`);
        clearMessages();
      }
    }
  };

   // Activate Employee
   const handleActivateClick = async (employeeId, employeeName) => {
    if (window.confirm(`Are you sure you want to set employee "${employeeName || 'N/A'}" to active?`)) {
      setListError(''); setSuccessMessage('');
       // TODO: Add button loading state
      try {
        const employeeDocRef = doc(db, 'users', employeeId);
        await updateDoc(employeeDocRef, { isActive: true });
        setEmployees(prev => prev.map(emp => emp.id === employeeId ? { ...emp, isActive: true } : emp));
        setSuccessMessage(`Employee "${employeeName || 'N/A'}" set to active.`);
        clearMessages();
      } catch (err) {
        console.error("Error setting employee active:", err);
        setListError(`Failed to set employee "${employeeName || 'N/A'}" to active.`);
        clearMessages();
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setEditName('');
    setEditIsActive(true);
  };

  // Define Tailwind classes for table cells
  const thStyle = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tdStyle = "px-6 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Employees</h1>

      {/* Add Employee Form */}
      <form onSubmit={handleAddEmployee} className="mb-6 p-4 border rounded-md bg-gray-50">
         <h2 className="text-lg font-medium text-gray-700 mb-3">Add New Employee</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
           <Input type="text" value={newEmployeeName} onChange={(e) => setNewEmployeeName(e.target.value)} placeholder="Full Name" required />
           <Input type="email" value={newEmployeeEmail} onChange={(e) => setNewEmployeeEmail(e.target.value)} placeholder="Email Address" required />
           <Input type="password" value={newEmployeePassword} onChange={(e) => setNewEmployeePassword(e.target.value)} placeholder="Password (min. 6 chars)" required minLength="6" />
         </div>
         {/* Use Alert for add errors */}
         {addError && <Alert type="error" className="mb-2">{addError}</Alert>}
         <Button type="submit" disabled={adding} variant="primary">
           {adding ? <Spinner size="sm" color="text-white" className="mr-2"/> : null}
           {adding ? 'Adding...' : 'Add Employee'}
         </Button>
      </form>

      {/* Display feedback messages */}
      {listError && <Alert type="error" className="mb-4">{listError}</Alert>}
      {successMessage && <Alert type="success" className="mb-4">{successMessage}</Alert>}

      {/* Employees List */}
      {loading ? (
        <div className="flex justify-center items-center p-8"><Spinner size="lg" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={thStyle}>Name</th>
                <th className={thStyle}>Email</th>
                <th className={thStyle}>Points</th>
                <th className={thStyle}>Status</th>
                <th className={`${thStyle} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr><td colSpan="5" className={`${tdStyle} text-center text-gray-500`}>No employees found.</td></tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className={`${tdStyle} font-medium text-gray-900`}>{employee.name || 'N/A'}</td>
                    <td className={`${tdStyle} text-gray-500`}>{employee.email}</td>
                    <td className={`${tdStyle} text-gray-500`}>{employee.points ?? 0}</td>
                    <td className={tdStyle}>
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                         {employee.isActive ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className={`${tdStyle} text-right space-x-2`}>
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(employee)}>Edit</Button>
                      {employee.isActive ? (
                         <Button variant="danger" size="sm" onClick={() => handleDeleteClick(employee.id, employee.name)}>
                           Set Inactive
                         </Button>
                      ) : (
                         <Button variant="secondary" size="sm" onClick={() => handleActivateClick(employee.id, employee.name)}>
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
    </div>
  );
}

export default ManageEmployees;

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
import { PlusIcon, PencilSquareIcon, UserMinusIcon, UserPlusIcon } from '@heroicons/react/24/outline'; // Icons

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

  // Define Tailwind classes for table cells - Refined
  const thStyle = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Manage Employees</h1>

      {/* Add Employee Form - Improved Layout */}
      <form onSubmit={handleAddEmployee} className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4">
         <h2 className="text-lg font-medium text-gray-700">Add New Employee</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
             <label htmlFor="new-employee-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
             <Input id="new-employee-name" type="text" value={newEmployeeName} onChange={(e) => setNewEmployeeName(e.target.value)} placeholder="John Doe" required className="mt-0 w-full"/>
           </div>
           <div>
             <label htmlFor="new-employee-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
             <Input id="new-employee-email" type="email" value={newEmployeeEmail} onChange={(e) => setNewEmployeeEmail(e.target.value)} placeholder="john.doe@company.com" required className="mt-0 w-full"/>
           </div>
           <div>
             <label htmlFor="new-employee-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
             <Input id="new-employee-password" type="password" value={newEmployeePassword} onChange={(e) => setNewEmployeePassword(e.target.value)} placeholder="Min. 6 characters" required minLength="6" className="mt-0 w-full"/>
           </div>
         </div>
         {/* Use Alert for add errors */}
         {addError && <Alert type="error">{addError}</Alert>}
         <div className="flex justify-end">
           <Button type="submit" disabled={adding} variant="primary" className="inline-flex items-center">
             {adding ? <Spinner size="sm" color="text-white" className="mr-2"/> : <PlusIcon className="h-5 w-5 mr-1.5"/>}
             {adding ? 'Adding...' : 'Add Employee'}
           </Button>
         </div>
      </form>

      {/* Display feedback messages */}
      <div className="space-y-3">
        {listError && <Alert type="error">{listError}</Alert>}
        {successMessage && <Alert type="success">{successMessage}</Alert>}
      </div>

      {/* Employees List - Improved Styling */}
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10"><Spinner size="lg" /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={thStyle}>Name</th>
                <th className={thStyle}>Email</th>
                <th className={thStyle}>Points</th>
                <th className={thStyle}>Status</th>
                <th className={`${thStyle} text-right pr-6`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr><td colSpan="5" className={`${tdStyle} text-center text-gray-500 py-6`}>No employees found for this company.</td></tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className={`${tdStyle} font-medium text-gray-900`}>{employee.name || <span className="text-gray-400 italic">No Name</span>}</td>
                    <td className={`${tdStyle} text-gray-500`}>{employee.email}</td>
                    <td className={`${tdStyle} text-gray-700 font-medium`}>{employee.points ?? 0}</td>
                    <td className={tdStyle}>
                       {/* Improved Status Badge */}
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                         employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                       }`}>
                         {employee.isActive ? 'Active' : 'Inactive'}
                       </span>
                    </td>
                    <td className={`${tdStyle} text-right space-x-2 pr-6`}>
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(employee)} className="inline-flex items-center">
                        <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      {employee.isActive ? (
                         <Button variant="danger" size="sm" onClick={() => handleDeleteClick(employee.id, employee.name)} className="inline-flex items-center">
                           <UserMinusIcon className="h-4 w-4 mr-1" /> Set Inactive
                         </Button>
                      ) : (
                         <Button variant="success" size="sm" onClick={() => handleActivateClick(employee.id, employee.name)} className="inline-flex items-center">
                           <UserPlusIcon className="h-4 w-4 mr-1" /> Set Active
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
       {isModalOpen && editingEmployee && (
         <Modal isOpen={isModalOpen} onClose={closeModal} title={`Edit Employee: ${editingEmployee.name || editingEmployee.email}`}>
             <form onSubmit={handleSaveEdit} className="space-y-4">
                 <div>
                     <label htmlFor="edit-employee-name" className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                     <Input id="edit-employee-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="mt-0 w-full"/>
                 </div>
                 <div>
                     <label htmlFor="edit-employee-email" className="block text-sm font-medium text-gray-700 mb-1">Email (Read-only)</label>
                     <Input id="edit-employee-email" type="email" value={editingEmployee.email} readOnly disabled className="bg-gray-100 mt-0 w-full cursor-not-allowed" />
                 </div>
                 <div>
                    <label htmlFor="edit-employee-active" className="flex items-center cursor-pointer">
                        <input
                            id="edit-employee-active"
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

export default ManageEmployees;

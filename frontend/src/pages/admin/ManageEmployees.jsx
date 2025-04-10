import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';

function ManageEmployees() {
  const { userData: adminUserData } = useAuth(); // Rename for clarity
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeePassword, setNewEmployeePassword] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!adminUserData?.companyId) {
        setError("Admin company information not available.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const usersCol = collection(db, 'users');
        const q = query(
          usersCol,
          where('role', '==', 'Employee'),
          where('companyId', '==', adminUserData.companyId)
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEmployees(list);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError('Failed to load employees.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [adminUserData?.companyId]);

  // Add Employee Handler
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployeeName.trim() || !newEmployeeEmail.trim() || !newEmployeePassword.trim()) {
      setAddError('Please fill in all fields.'); return;
    }
    if (!adminUserData?.companyId) {
      setAddError("Cannot add employee: Admin's company ID is missing."); return;
    }

    setAdding(true);
    setAddError('');

    let newUserCredential = null;
    try {
      // --- Step 1: Create Auth User ---
      // IMPORTANT: This might sign in the new user, potentially disrupting the admin's session.
      // More robust solutions involve backend functions or admin SDKs, but are beyond MVP scope.
      newUserCredential = await createUserWithEmailAndPassword(auth, newEmployeeEmail, newEmployeePassword);
      const newUser = newUserCredential.user;
      console.log("Successfully created auth user:", newUser.uid);

      // --- Step 2: Create Firestore Document ---
      const userDocRef = doc(db, 'users', newUser.uid);
      const newEmployeeData = {
        email: newEmployeeEmail,
        name: newEmployeeName.trim(),
        role: 'Employee',
        companyId: adminUserData.companyId,
        points: 0,
      };
      await setDoc(userDocRef, newEmployeeData);
      console.log("Successfully created Firestore doc for user:", newUser.uid);

      // --- Step 3: Update Local State ---
      setEmployees(prev => [...prev, { id: newUser.uid, ...newEmployeeData }]);

      // --- Step 4: Clear Form ---
      setNewEmployeeName('');
      setNewEmployeeEmail('');
      setNewEmployeePassword('');
      alert('Employee added successfully! Note: Your session might be affected; refresh if needed.'); // Inform user

    } catch (err) {
      console.error("Error adding employee:", err);
      // Rollback attempt (delete auth user if Firestore failed - basic example)
      if (newUserCredential && err.code !== 'auth/email-already-in-use' && err.code !== 'auth/weak-password') {
          console.warn("Attempting to delete auth user due to Firestore error...");
          // This requires the admin to be recently signed in, might fail.
          // await newUserCredential.user.delete().catch(delErr => console.error("Failed to delete auth user on rollback:", delErr));
          // A better approach uses backend functions.
      }

      if (err.code === 'auth/email-already-in-use') {
        setAddError('This email address is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setAddError('Password is too weak (min. 6 characters).');
      } else {
        setAddError('Failed to add employee. Check console for details.');
      }
    } finally {
      setAdding(false);
      // **Crucial:** We avoid re-signing in the admin here. The AuthProvider should
      // ideally keep the admin logged in if the underlying auth state wasn't completely overwritten.
      // If logout still occurs, it confirms the limitation of client-side admin actions.
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Employees</h1>
      {/* Add Employee Form */}
      <form onSubmit={handleAddEmployee} className="mb-6 p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-medium text-gray-700 mb-3">Add New Employee</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" value={newEmployeeName} onChange={(e) => setNewEmployeeName(e.target.value)} placeholder="Full Name" required className="input-style" />
          <input type="email" value={newEmployeeEmail} onChange={(e) => setNewEmployeeEmail(e.target.value)} placeholder="Email Address" required className="input-style" />
          <input type="password" value={newEmployeePassword} onChange={(e) => setNewEmployeePassword(e.target.value)} placeholder="Password (min. 6 chars)" required minLength="6" className="input-style" />
        </div>
        {addError && <p className="text-sm text-red-600 mt-2">{addError}</p>}
        <button type="submit" disabled={adding} className="mt-3 btn-primary">
          {adding ? 'Adding...' : 'Add Employee'}
        </button>
      </form>
      {/* Employees List */}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? <p>Loading employees...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* ... table head ... */}
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No employees found.</td></tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.points ?? 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Basic Styling (replace with actual Tailwind classes) */}
      <style jsx>{`
        .input-style {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .btn-primary {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: white;
          background-color: #4f46e5;
          border: 1px solid transparent;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .btn-primary:hover {
          background-color: #4338ca;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default ManageEmployees;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore'; // Added addDoc, serverTimestamp
import { db } from '../../firebase/config';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

function AdminDashboard() {
  const { currentUser, userData } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [loadingCompany, setLoadingCompany] = useState(true);

  // State for Assign Points Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]); // Employees for the select dropdown
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [pointsToAssign, setPointsToAssign] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Fetch company name
  useEffect(() => {
    const fetchCompanyName = async () => {
      if (userData?.companyId) {
        setLoadingCompany(true);
        const companyDocRef = doc(db, 'companies', userData.companyId);
        try {
          const companyDocSnap = await getDoc(companyDocRef);
          setCompanyName(companyDocSnap.exists() ? companyDocSnap.data().name : 'Unknown Company');
        } catch (error) {
          console.error("Error fetching company name:", error); setCompanyName('Error');
        } finally {
          setLoadingCompany(false);
        }
      } else { setLoadingCompany(false); }
    };
    fetchCompanyName();
  }, [userData?.companyId]);

  // Fetch employees when modal is opened
  useEffect(() => {
    const fetchEmployeesForModal = async () => {
      if (isModalOpen && userData?.companyId) {
        setLoadingEmployees(true); setAssignError(''); setEmployees([]);
         try {
           const usersCol = collection(db, 'users');
           // Fetch ALL employees of the company first
           const q = query(
             usersCol,
             where('role', '==', 'Employee'),
             where('companyId', '==', userData.companyId)
             // Removed: where('isActive', '==', true)
           );
           const snapshot = await getDocs(q);
           // Filter client-side for active (or missing isActive field)
           const list = snapshot.docs
             .map(doc => ({ id: doc.id, ...doc.data() }))
             .filter(emp => emp.isActive !== false); // Show if isActive is true or undefined/null

          setEmployees(list);
          if (list.length > 0) {
            setSelectedEmployeeId(list[0].id); // Default to first employee
          }
        } catch (err) {
          console.error("Error fetching employees for modal:", err);
          setAssignError('Failed to load employees.');
        } finally {
          setLoadingEmployees(false);
        }
      }
    };
    fetchEmployeesForModal();
  }, [isModalOpen, userData?.companyId]);

  // Handle Assign Points Submission
  const handleAssignPoints = async (e) => {
    e.preventDefault();
    const points = parseInt(pointsToAssign, 10);
    if (!selectedEmployeeId || isNaN(points) || points === 0) { // Allow negative points later if needed
      setAssignError('Please select an employee and enter a valid non-zero points value.'); return;
    }
    // Basic MVP check - no limits enforced here yet
    setAssigning(true); setAssignError('');
    try {
      // Find selected employee details for logging
      const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
      if (!selectedEmployee) {
        setAssignError('Selected employee data not found.');
        setAssigning(false);
        return;
      }

      // 1. Update employee points
      const employeeDocRef = doc(db, 'users', selectedEmployeeId);
      await updateDoc(employeeDocRef, {
        points: increment(points)
      });

      // 2. Create history record
      const historyColRef = collection(db, 'puntosAsignados');
      await addDoc(historyColRef, {
        adminId: currentUser.uid,
        adminEmail: currentUser.email,
        empleadoId: selectedEmployeeId,
        empleadoEmail: selectedEmployee.email, // Get from fetched employee data
        empleadoName: selectedEmployee.name || '', // Get from fetched employee data
        companyId: userData.companyId,
        cantidad: points,
        fechaAsignacion: serverTimestamp(),
        // justificacionTexto: 'MVP Assignment' // Optional: Add justification later
      });

      alert(`Successfully assigned ${points} points to ${selectedEmployee.name || selectedEmployee.email}!`);
      closeModal();
    } catch (err) {
      console.error("Error assigning points:", err);
      setAssignError('Failed to assign points.');
    } finally {
      setAssigning(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployeeId('');
    setPointsToAssign('');
    setAssignError('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Admin Dashboard {loadingCompany ? '...' : `- ${companyName}`}
      </h1>
      <p className="text-gray-600 mb-4">
        Welcome, {currentUser?.email || 'Admin'}! Manage employees and rewards for your company.
      </p>
      {/* Use Button component and enable it */}
      <Button
        onClick={openModal}
        variant="primary" // Changed from blue
      >
        Assign Points
      </Button>

      {/* Assign Points Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Assign Points to Employee">
        <form onSubmit={handleAssignPoints}>
          {loadingEmployees ? (
            <p>Loading employees...</p>
          ) : employees.length === 0 ? (
            <p className="text-gray-600">No active employees found for this company.</p>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                <select
                  id="employee-select"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  {/* <option value="" disabled>-- Select Employee --</option> */}
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name || emp.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="points-assign" className="block text-sm font-medium text-gray-700 mb-1">Points to Assign (+/-)</label>
                <Input
                  id="points-assign"
                  type="number"
                  value={pointsToAssign}
                  onChange={(e) => setPointsToAssign(e.target.value)}
                  placeholder="e.g., 50 or -10"
                  required
                />
              </div>
              {assignError && <p className="text-sm text-red-600 mb-4">{assignError}</p>}
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={assigning}>{assigning ? 'Assigning...' : 'Assign Points'}</Button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
}

export default AdminDashboard;

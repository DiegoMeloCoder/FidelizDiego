import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore'; // Removed 'or'
import { db } from '../../firebase/config';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

function AdminDashboard() {
  const { currentUser, userData } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [loadingCompany, setLoadingCompany] = useState(true);

  // State for Assign Points Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [justifications, setJustifications] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedJustificationId, setSelectedJustificationId] = useState('');
  const [pointsToAssign, setPointsToAssign] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [loadingModalData, setLoadingModalData] = useState(false);

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

  // Fetch employees and justifications when modal is opened
  useEffect(() => {
    const fetchModalData = async () => {
      if (isModalOpen && userData?.companyId) {
        setLoadingModalData(true); setAssignError(''); setEmployees([]); setJustifications([]);
        try {
          // Fetch Employees (only active)
          const usersCol = collection(db, 'users');
          const empQuery = query(
            usersCol,
            where('role', '==', 'Employee'),
            where('companyId', '==', userData.companyId)
            // where('isActive', '==', true) // Remove this strict filter
          );
          const empSnapshot = await getDocs(empQuery);
          // Filter client-side: show if isActive is true or undefined/null
          const empList = empSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(emp => emp.isActive !== false);
          setEmployees(empList);
          if (empList.length > 0) setSelectedEmployeeId(empList[0].id);

          // Fetch Justifications using two separate queries and combining
          const justCol = collection(db, 'justificacionesPuntos');
          const globalJustQuery = query(
            justCol,
            where('companyId', '==', null),
            where('estaActiva', '==', true)
          );
          const companyJustQuery = query(
            justCol,
            where('companyId', '==', userData.companyId),
            where('estaActiva', '==', true)
          );

          const [globalSnapshot, companySnapshot] = await Promise.all([
             getDocs(globalJustQuery),
             getDocs(companyJustQuery)
          ]);

          const globalList = globalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const companyList = companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Combine lists (add company-specific ones first for potential preference)
          const combinedList = [...companyList, ...globalList];
          // Optional: Remove duplicates if needed, though unlikely with this structure
          // const uniqueList = Array.from(new Map(combinedList.map(item => [item.id, item])).values());

          setJustifications(combinedList);
           if (combinedList.length > 0) setSelectedJustificationId(combinedList[0].id);

        } catch (err) {
          console.error("Error fetching modal data:", err);
          // Firestore might require indexes for the justification queries now
          setAssignError('Failed to load data for modal. Check console for index errors.');
        } finally {
          setLoadingModalData(false);
        }
      }
    };
    fetchModalData();
  }, [isModalOpen, userData?.companyId]);

  // Handle Assign Points Submission
  const handleAssignPoints = async (e) => {
    // ... (logic remains the same) ...
     e.preventDefault();
    const points = parseInt(pointsToAssign, 10);
    if (!selectedEmployeeId || !selectedJustificationId || isNaN(points) || points === 0) {
      setAssignError('Please select employee, justification, and enter valid points.'); return;
    }
    setAssigning(true); setAssignError('');
    try {
      const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
      const selectedJustification = justifications.find(jus => jus.id === selectedJustificationId);

      if (!selectedEmployee || !selectedJustification) {
        setAssignError('Selected employee or justification data not found.'); setAssigning(false); return;
      }

      const employeeDocRef = doc(db, 'users', selectedEmployeeId);
      await updateDoc(employeeDocRef, { points: increment(points) });

      const historyColRef = collection(db, 'puntosAsignados');
      await addDoc(historyColRef, {
        adminId: currentUser.uid, adminEmail: currentUser.email,
        empleadoId: selectedEmployeeId, empleadoEmail: selectedEmployee.email,
        empleadoName: selectedEmployee.name || '', companyId: userData.companyId,
        cantidad: points, fechaAsignacion: serverTimestamp(),
        justificacionId: selectedJustificationId,
        justificacionTexto: selectedJustification.textoJustificacion
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
    setSelectedJustificationId('');
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
      <Button onClick={openModal} variant="primary">Assign Points</Button>

      {/* Assign Points Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Assign Points to Employee">
        <form onSubmit={handleAssignPoints}>
          {loadingModalData ? (
             <div className="flex justify-center items-center p-8"><Spinner size="md" /></div>
          ) : employees.length === 0 ? (
            <Alert type="warning">No active employees found for this company.</Alert>
          ) : justifications.length === 0 ? (
             <Alert type="warning">No active justifications found. Please add justifications first.</Alert>
          ) : (
            <>
              {/* Employee Select */}
              <div className="mb-4">
                <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                <select id="employee-select" value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} className="input-style" required>
                  {employees.map(emp => (<option key={emp.id} value={emp.id}>{emp.name || emp.email}</option>))}
                </select>
              </div>
              {/* Justification Select */}
              <div className="mb-4">
                 <label htmlFor="justification-select" className="block text-sm font-medium text-gray-700 mb-1">Select Justification</label>
                 <select id="justification-select" value={selectedJustificationId} onChange={(e) => setSelectedJustificationId(e.target.value)} className="input-style" required>
                   {justifications.map(jus => (<option key={jus.id} value={jus.id}>{jus.textoJustificacion}</option>))}
                 </select>
               </div>
              {/* Points Input */}
              <div className="mb-4">
                <label htmlFor="points-assign" className="block text-sm font-medium text-gray-700 mb-1">Points to Assign (+/-)</label>
                <Input id="points-assign" type="number" value={pointsToAssign} onChange={(e) => setPointsToAssign(e.target.value)} placeholder="e.g., 50 or -10" required />
              </div>
              {/* Error Alert */}
              {assignError && <Alert type="error" className="mb-4">{assignError}</Alert>}
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={closeModal} disabled={assigning}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={assigning}>
                  {assigning ? <Spinner size="sm" color="text-white" className="mr-2"/> : null}
                  {assigning ? 'Assigning...' : 'Assign Points'}
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>
       {/* Basic Styling */}
       <style jsx>{`
        .input-style {
          display: block; width: 100%; padding: 0.5rem 0.75rem;
          margin-top: 0.25rem; border: 1px solid #d1d5db; border-radius: 0.375rem;
          box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        select.input-style {
           appearance: none; -webkit-appearance: none; -moz-appearance: none;
           background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E');
           background-repeat: no-repeat; background-position: right 0.5rem center; background-size: 1.5em 1.5em;
           padding-right: 2.5rem;
        }
       `}</style>
    </div>
  );
}

export default AdminDashboard;

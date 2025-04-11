import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, increment, addDoc, serverTimestamp,getCountFromServer } from 'firebase/firestore'; // Added getCountFromServer
import { db } from '../../firebase/config';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { UsersIcon, GiftIcon, PlusCircleIcon } from '@heroicons/react/24/outline'; // Icons

function AdminDashboard() {
  const { currentUser, userData } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [stats, setStats] = useState({ employeeCount: 0, rewardCount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');

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
          console.error("Error fetching company name:", error);
          setCompanyName('Error loading name');
        } finally {
          setLoadingCompany(false);
        }
      } else {
        setLoadingCompany(false);
        setCompanyName('No Company Assigned');
      }
    };

    const fetchStats = async () => {
      if (userData?.companyId) {
        setLoadingStats(true);
        setStatsError('');
        try {
          // Use getCountFromServer for efficiency
          const usersCol = collection(db, 'users');
          const empQuery = query(
            usersCol,
            where('role', '==', 'Employee'),
            where('companyId', '==', userData.companyId),
            where('isActive', '!=', false) // Count active or undefined/null isActive
          );
          const empCountSnapshot = await getCountFromServer(empQuery);
          const employeeCount = empCountSnapshot.data().count;

          const rewardsCol = collection(db, 'rewards');
            const rewardQuery = query(
              rewardsCol,
              where('companyId', '==', userData.companyId),
              where('isActive', '==', true) // Revert back to counting only explicitly true isActive
            );
            const rewardCountSnapshot = await getCountFromServer(rewardQuery);
          const rewardCount = rewardCountSnapshot.data().count;

          setStats({ employeeCount, rewardCount });

        } catch (error) {
           console.error("Error fetching dashboard stats:", error);
           setStatsError('Failed to load dashboard statistics.');
        } finally {
           setLoadingStats(false);
        }
      } else {
        setLoadingStats(false); // No company ID, no stats to load
      }
    };

    fetchCompanyName();
    fetchStats();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            {loadingCompany ? <Spinner size="xs" /> : companyName}
          </p>
        </div>
        <Button onClick={openModal} variant="primary" className="w-full sm:w-auto inline-flex items-center justify-center">
          <PlusCircleIcon className="h-5 w-5 mr-1.5" />
          Assign Points
        </Button>
      </div>

       {/* Stats Section */}
       {loadingStats && <div className="flex justify-center p-10"><Spinner /></div>}
       {statsError && <Alert type="error">{statsError}</Alert>}
       {!loadingStats && !statsError && userData?.companyId && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
           {/* Active Employees Card */}
           <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex items-center space-x-4">
             <div className="bg-teal-100 p-3 rounded-full">
               <UsersIcon className="h-6 w-6 text-teal-600" />
             </div>
             <div>
               <p className="text-sm font-medium text-gray-500">Active Employees</p>
               <p className="text-2xl font-semibold text-gray-800">{stats.employeeCount}</p>
             </div>
           </div>

           {/* Active Rewards Card */}
           <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex items-center space-x-4">
             <div className="bg-purple-100 p-3 rounded-full">
               <GiftIcon className="h-6 w-6 text-purple-600" />
             </div>
             <div>
               <p className="text-sm font-medium text-gray-500">Active Rewards</p>
               <p className="text-2xl font-semibold text-gray-800">{stats.rewardCount}</p>
             </div>
           </div>
         </div>
       )}

      {/* Welcome Message (Optional) */}
      {/* <p className="text-gray-600 text-lg">
        Welcome, {currentUser?.email || 'Admin'}! Manage employees and rewards for your company.
      </p> */}


      {/* Assign Points Modal - Refined */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Assign Points to Employee">
        <form onSubmit={handleAssignPoints} className="space-y-4">
          {loadingModalData ? (
             <div className="flex justify-center items-center p-8"><Spinner size="md" /></div>
          ) : employees.length === 0 ? (
            <Alert type="warning">No active employees found for this company.</Alert>
          ) : justifications.length === 0 ? (
             <Alert type="warning">No active justifications found. Please add or activate justifications first.</Alert>
          ) : (
            <>
              {/* Employee Select */}
              <div>
                <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                <select
                  id="employee-select"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  {/* Optional: Add a default disabled option */}
                  {/* <option value="" disabled>-- Select an employee --</option> */}
                  {employees.map(emp => (<option key={emp.id} value={emp.id}>{emp.name || emp.email}</option>))}
                </select>
              </div>
              {/* Justification Select */}
              <div>
                 <label htmlFor="justification-select" className="block text-sm font-medium text-gray-700 mb-1">Select Justification</label>
                 <select
                   id="justification-select"
                   value={selectedJustificationId}
                   onChange={(e) => setSelectedJustificationId(e.target.value)}
                   className="block w-full px-3 py-2 mt-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   required
                 >
                   {/* Optional: Add a default disabled option */}
                   {/* <option value="" disabled>-- Select a justification --</option> */}
                   {justifications.map(jus => (<option key={jus.id} value={jus.id}>{jus.textoJustificacion}</option>))}
                 </select>
               </div>
              {/* Points Input */}
              <div>
                <label htmlFor="points-assign" className="block text-sm font-medium text-gray-700 mb-1">Points to Assign (+/-)</label>
                <Input
                  id="points-assign"
                  type="number"
                  value={pointsToAssign}
                  onChange={(e) => setPointsToAssign(e.target.value)}
                  placeholder="e.g., 50 or -10"
                  required
                  className="mt-0 w-full" // Ensure Input component takes full width if needed
                />
              </div>
              {/* Error Alert */}
              {assignError && <Alert type="error">{assignError}</Alert>}
              {/* Action Buttons */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
                <Button type="button" variant="secondary" onClick={closeModal} disabled={assigning}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={assigning} className="inline-flex items-center">
                  {assigning ? <Spinner size="sm" color="text-white" className="mr-2"/> : <PlusCircleIcon className="h-5 w-5 mr-1.5"/>}
                  {assigning ? 'Assigning...' : 'Assign Points'}
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>
       {/* Removed <style jsx> block */}
    </div>
  );
}

export default AdminDashboard;

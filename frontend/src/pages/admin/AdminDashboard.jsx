import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
// Firestore imports removed
import apiClient from '../../services/api'; // Import API client
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { UsersIcon, GiftIcon, PlusCircleIcon } from '@heroicons/react/24/outline'; // Icons

function AdminDashboard() {
  const { currentUser, userData, loading: authLoading } = useAuth(); // userData now contains company info { id, nombre, status }
  // const [companyName, setCompanyName] = useState(''); // No longer needed, use userData.company.nombre
  // const [loadingCompany, setLoadingCompany] = useState(true); // No longer needed
  const [stats, setStats] = useState({ employeeCount: 0, rewardCount: 0 }); // Initialize with 0 or null
  const [loadingStats, setLoadingStats] = useState(true); // Start loading stats
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

  // Fetch company name - Removed, now comes from userData.company.nombre

  // Fetch stats - Ahora usa la API
  useEffect(() => {
    const fetchStats = async () => {
      // Depend on userData being loaded and having a company ID
      if (userData?.company?.id) {
          setLoadingStats(true); // Set loading true before fetch
          setStatsError('');
        try {
          // Llamar al nuevo endpoint de estadísticas del admin
          const response = await apiClient.get('/stats/admin');
          setStats(response.data); // Guardar los datos recibidos (employeeCount, rewardCount)
        } catch (error) {
           console.error("Error fetching dashboard stats:", error);
           setStatsError(error.message || 'Failed to load dashboard statistics.');
           setStats({ employeeCount: 'Err', rewardCount: 'Err' }); // Indicate error in stats
        } finally {
           setLoadingStats(false);
        }
      } else {
        // Handle case where user data might not have company info yet or failed load
        setLoadingStats(false);
        if (!authLoading) { // Only set error if auth has finished loading
             setStatsError("User company data not available to fetch stats.");
        }
      }
    };
    // Fetch stats only if userData is available and not authLoading
    if (userData && !authLoading) {
        fetchStats();
    } else if (!authLoading && !userData) {
        // Handle case where user data failed to load in AuthContext
        setLoadingStats(false);
        setStatsError("User data not available to fetch stats.");
    }
    // If authLoading is true, we wait for userData
  }, [userData, authLoading]); // Depender de userData y authLoading


  // Fetch employees and justifications when modal is opened
  useEffect(() => {
    const fetchModalData = async () => {
      // Use nested company ID
      if (isModalOpen && userData?.company?.id) {
        setLoadingModalData(true); setAssignError(''); setEmployees([]); setJustifications([]);
        try {
          // Fetch Employees using API (already filters by company and role)
          const empResponse = await apiClient.get('/employees');
          // Filter only active employees for selection
          const activeEmpList = empResponse.data.filter(emp => emp.isActive !== false);
          setEmployees(activeEmpList);
          if (activeEmpList.length > 0) setSelectedEmployeeId(activeEmpList[0].id);

          // Fetch Justifications using API (backend returns globals + company specific)
          const justResponse = await apiClient.get('/justifications');
          // Filter only active justifications for selection
          const activeJustList = justResponse.data.filter(jus => jus.estaActiva !== false);
          setJustifications(activeJustList);
           if (activeJustList.length > 0) setSelectedJustificationId(activeJustList[0].id);

        } catch (err) {
          console.error("Error fetching modal data:", err);
          setAssignError(err.message || 'Failed to load data for modal.');
        } finally {
          setLoadingModalData(false);
        }
      }
    };
    fetchModalData();
  }, [isModalOpen, userData?.company?.id]); // Depend on companyId as well

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
      // Call backend API to assign points
      const response = await apiClient.post('/points/assign', {
        empleadoId: selectedEmployeeId,
        cantidad: points,
        justificacionId: parseInt(selectedJustificationId), // Ensure ID is integer
      });

      // Optionally update local state or show success based on response
      const assignedData = response.data;
      const employeeName = employees.find(e => e.id === selectedEmployeeId)?.nombre || 'employee';
      alert(`Successfully assigned ${assignedData.assignment.cantidad} points to ${employeeName}! New balance: ${assignedData.employeeNewBalance}`);
      closeModal();
    } catch (err) {
      console.error("Error assigning points:", err);
      setAssignError(err.message || 'Failed to assign points.');
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
          {/* Apply brand-secondary to page title */}
          <h1 className="text-3xl font-bold text-brand-secondary">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            {/* Display company name from userData */}
            {userData?.company?.nombre || (userData ? 'No Company Assigned' : <Spinner size="xs" />)}
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
       {!loadingStats && !statsError && userData?.company?.id && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
           {/* Active Employees Card - Apply brand colors */}
           <div className="bg-white p-5 rounded-lg shadow border border-brand-tertiary flex items-center space-x-4"> {/* Use brand-tertiary for border */}
             <div className="bg-brand-tertiary p-3 rounded-full"> {/* Use brand-tertiary for icon bg */}
               <UsersIcon className="h-6 w-6 text-brand-primary" /> {/* Use brand-primary for icon color */}
             </div>
             <div>
               <p className="text-sm font-medium text-gray-500">Active Employees</p>
               <p className="text-2xl font-semibold text-gray-800">{stats.employeeCount}</p>
             </div>
           </div>

           {/* Active Rewards Card - Apply brand colors */}
           <div className="bg-white p-5 rounded-lg shadow border border-brand-tertiary flex items-center space-x-4"> {/* Use brand-tertiary for border */}
             <div className="bg-brand-tertiary p-3 rounded-full"> {/* Use brand-tertiary for icon bg */}
               <GiftIcon className="h-6 w-6 text-brand-primary" /> {/* Use brand-primary for icon color */}
             </div>
             <div>
               <p className="text-sm font-medium text-gray-500">Active Rewards</p>
               <p className="text-2xl font-semibold text-gray-800">{stats.rewardCount}</p>
             </div>
           </div>
         </div>
       )}
       {/* No longer need the placeholder message, loading state handles it */}
       {/* {!loadingStats && !statsError && userData?.company?.id && stats.employeeCount === 'N/A' && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center text-gray-500">
            Statistics will be available soon.
          </div>
       )} */}

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
                  {/* Mostrar nombre si existe, si no, email */}
                  {employees.map(emp => (<option key={emp.id} value={emp.id}>{emp.nombre || emp.email}</option>))}
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

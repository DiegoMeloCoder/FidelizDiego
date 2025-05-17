import React, { useState, useEffect } from 'react';
// Firestore and secondary Firebase app imports removed
import apiClient from '../../services/api'; // Import API client
import { useAuth } from '../../contexts/AuthContext.jsx'; // Keep useAuth to get admin's companyId
import Button from '../../components/ui/Button';
import Papa from 'papaparse'; // Import papaparse
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { PlusIcon, PencilSquareIcon, UserMinusIcon, UserPlusIcon, ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'; // Added Icons

function ManageEmployees() {
  const { userData: adminUserData } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success messages
  const [engagementScores, setEngagementScores] = useState({}); // Store scores as { employeeId: score }
  const [loadingScores, setLoadingScores] = useState(false);

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

  // Bulk Upload State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState({ success: [], errors: [] });
  const [uploadError, setUploadError] = useState(''); // Error during parsing/validation
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);


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
    // Depend on the nested company ID from the API response
    if (adminUserData?.company?.id) { // Fetch only if ID is available
        fetchEmployees();
    } else if (adminUserData !== null) { // If userData is loaded but no companyId
        setListError("Admin company information not available.");
        setLoading(false);
    }
    // If adminUserData is null (still loading initial profile), loading remains true
  }, [adminUserData?.company?.id]); // <-- Use nested ID

  const fetchEmployees = async () => {
     // Check the nested company ID (redundant check removed, handled by useEffect dependency)
     // if (!adminUserData?.company?.id) {
     //    setListError("Admin company information not available."); setLoading(false); return;
     // }
      setLoading(true); setListError(''); setSuccessMessage('');
      try {
        // Fetch employees first
        const empResponse = await apiClient.get('/employees');
        const empList = empResponse.data.map(emp => ({ ...emp, isActive: emp.isActive !== undefined ? emp.isActive : true }));
        setEmployees(empList);

        // Then fetch engagement scores
        if (empList.length > 0) {
            setLoadingScores(true);
            try {
                const scoreResponse = await apiClient.get('/engagement/scores'); // Uses admin's companyId implicitly
                // Convert array to map for easy lookup
                const scoreMap = scoreResponse.data.reduce((acc, scoreData) => {
                    acc[scoreData.employeeId] = scoreData.engagementScore;
                    return acc;
                }, {});
                setEngagementScores(scoreMap);
            } catch (scoreErr) {
                 console.error("Error fetching engagement scores:", scoreErr);
                 // Don't overwrite listError, maybe show a separate score error? For now, just log.
                 setEngagementScores({}); // Clear scores on error
            } finally {
                 setLoadingScores(false);
            }
        } else {
             setEngagementScores({}); // No employees, no scores
        }

      } catch (err) {
        console.error("Error fetching employees:", err);
        setListError(err.message || 'Failed to load employees.');
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
    // Backend uses the authenticated admin's company ID, no need to check here explicitly
    // if (!adminUserData?.company?.id) {
    //   setAddError("Cannot add employee: Admin's company ID is missing."); clearMessages(); return;
    // }

    setAdding(true); setAddError(''); setListError(''); setSuccessMessage('');
    try {
      // Call backend API to create employee (handles Auth and DB)
      const response = await apiClient.post('/employees', {
        email: newEmployeeEmail,
        password: newEmployeePassword,
        nombre: newEmployeeName.trim(),
        // companyId is implicitly taken from the authenticated Admin user on the backend
      });
      const addedEmployee = response.data; // API returns the created employee profile

      // Update local state
      setEmployees(prev => [...prev, addedEmployee]);
      setNewEmployeeName(''); setNewEmployeeEmail(''); setNewEmployeePassword('');
      setSuccessMessage(`Employee ${addedEmployee.nombre || addedEmployee.email} added successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error adding employee:", err);
      setAddError(err.message || 'Failed to add employee. Check console for details.');
      clearMessages();
    } finally {
      setAdding(false);
    }
  };

  // Edit Employee - Open Modal
  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setEditName(employee.nombre || ''); // <-- Corregido
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
      // Call backend API to update employee (handles Auth and DB)
      const response = await apiClient.put(`/employees/${editingEmployee.id}`, {
        nombre: editName.trim(),
        isActive: editIsActive,
      });
      const updatedEmployee = response.data; // API returns updated profile

      // Update local state
      setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
      closeModal();
      setSuccessMessage(`Employee "${updatedEmployee.nombre || updatedEmployee.email}" updated successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error updating employee:", err);
      setEditError(err.message || 'Failed to update employee.');
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Delete Employee (Logical Delete)
  const handleDeleteClick = async (employeeId, employeeName) => {
    // Use nombre for confirmation message
    if (window.confirm(`Are you sure you want to set employee "${employeeName || 'N/A'}" to inactive? They won't be able to log in.`)) {
      setListError(''); setSuccessMessage('');
      // TODO: Add button loading state
      try {
        // Call backend API to toggle status
        const response = await apiClient.patch(`/employees/${employeeId}/toggle-status`);
        const updatedEmployee = response.data.employee; // API returns updated employee

        // Update local state
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
        setSuccessMessage(response.data.message); // Use message from API
        clearMessages();
      } catch (err) {
        console.error("Error setting employee inactive:", err);
        setListError(err.message || `Failed to set employee "${employeeName || 'N/A'}" to inactive.`);
        clearMessages();
      }
    }
  };

   // Activate Employee
   const handleActivateClick = async (employeeId, employeeName) => {
    // Use nombre for confirmation message
    if (window.confirm(`Are you sure you want to set employee "${employeeName || 'N/A'}" to active?`)) {
      setListError(''); setSuccessMessage('');
       // TODO: Add button loading state
      try {
        // Call backend API to toggle status
        const response = await apiClient.patch(`/employees/${employeeId}/toggle-status`);
        const updatedEmployee = response.data.employee; // API returns updated employee

        // Update local state
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
        setSuccessMessage(response.data.message); // Use message from API
        clearMessages();
      } catch (err) {
        console.error("Error setting employee active:", err);
        setListError(err.message || `Failed to set employee "${employeeName || 'N/A'}" to active.`);
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

  const closeBulkModal = () => {
    setIsBulkModalOpen(false);
    setUploadFile(null);
    setParsedData([]);
    setUploading(false);
    setUploadProgress(0);
    setUploadResults({ success: [], errors: [] });
    setUploadError('');
    setIsProcessingComplete(false);
  };

  // --- Bulk Upload Handlers ---

  const handleFileChange = (event) => {
    setUploadError('');
    setParsedData([]);
    setIsProcessingComplete(false);
    setUploadResults({ success: [], errors: [] });
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') { // Basic type check
      setUploadFile(file);
      // Optionally parse immediately for preview
      parseFile(file);
    } else {
      setUploadFile(null);
      setUploadError('Please select a valid CSV file.');
    }
  };

  const parseFile = (file) => {
     if (!file) return;
     setUploadError('');
     Papa.parse(file, {
       header: true,
       skipEmptyLines: true,
       complete: (results) => {
         console.log("Parsed CSV Data:", results.data);
         // Basic Validation
         if (!results.data || results.data.length === 0) {
           setUploadError('CSV file is empty or could not be parsed.');
           setParsedData([]);
           return;
         }
         const headers = Object.keys(results.data[0]);
         const requiredHeaders = ['Nombre', 'Email']; // Case-sensitive for now
         const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));
         const hasPasswordHeader = headers.some(h => h.toLowerCase() === 'password' || h.toLowerCase() === 'contraseña');

         if (!hasRequiredHeaders) {
           setUploadError(`CSV must contain columns: ${requiredHeaders.join(', ')}.`);
           setParsedData([]);
           return;
         }
         if (hasPasswordHeader) {
            setUploadError('CSV file must NOT contain a Password/Contraseña column for security reasons.');
            setParsedData([]);
            return;
         }

         // Further validation per row (e.g., valid email format) can be added here or during processing
         const validData = results.data.filter(row => row.Email && row.Nombre); // Basic check
         if (validData.length !== results.data.length) {
             setUploadError('Some rows are missing required Name or Email values.');
             // Still set parsedData to allow processing valid rows? Or reject whole file?
             // Let's allow processing valid rows for now.
         }
         setParsedData(validData);

       },
       error: (error) => {
         console.error("Error parsing CSV:", error);
         setUploadError(`Error parsing CSV file: ${error.message}`);
         setParsedData([]);
       }
     });
  };

  // Simple random password generator (for MVP - consider stronger generation later)
  /* const generateTemporaryPassword = (length = 10) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
  } */

   const handleBulkUpload = async () => {
    // Check admin company ID before starting bulk upload
    if (!adminUserData?.company?.id) {
        setUploadError("Cannot start bulk upload: Admin's company information is missing.");
        return;
    }
    if (parsedData.length === 0) {
      setUploadError('No valid employee data to upload.');
      return;
    }
    setUploading(true);
    setUploadProgress(0); // Reset progress for API call
    setUploadResults({ success: [], errors: [] });
    setIsProcessingComplete(false);

    // Prepare data in the format expected by the backend endpoint
    const employeesToUpload = parsedData.map(row => ({
        nombre: row.Nombre?.trim(),
        email: row.Email?.trim(),
    }));

    try {
        console.log(`Sending ${employeesToUpload.length} employees to bulk upload endpoint...`);
        // Call the dedicated backend endpoint
        const response = await apiClient.post('/employees/bulk-upload', employeesToUpload);

        // Process results from the backend
        const backendResults = response.data; // Expects { success: [...], errors: [...] }
        setUploadResults(backendResults);
        console.log("Bulk upload results:", backendResults);

    } catch (err) {
        console.error("Error during bulk upload API call:", err);
        setUploadError(err.message || 'An unexpected error occurred during bulk upload.');
        // Set results to empty if the whole call failed
        setUploadResults({ success: [], errors: [{ email: 'N/A', error: err.message || 'API Call Failed' }] });
    } finally {
        setUploading(false);
        setIsProcessingComplete(true);
        setUploadProgress(100); // Mark as complete
        // Fetch updated employee list after bulk add attempt
        fetchEmployees();
    }
  };

  const handleDownloadCredentials = () => {
    if (uploadResults.success.length === 0) return;

    // Generate plain text content
    let textContent = "Fideliz - Bulk Employee Upload Credentials\n";
    textContent += "========================================\n\n";

    uploadResults.success.forEach(user => {
      textContent += `Email: ${user.email}\n`;
      textContent += `Temporary Password: ${user.tempPassword}\n`;
      textContent += `----------------------------------------\n`;
    });

    // Create Blob and download link
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "bulk_upload_credentials.txt"); // Change extension to .txt
    link.style.visibility = 'hidden';
    document.body.appendChild(link);

    link.click(); // Trigger download

    document.body.removeChild(link); // Clean up
    URL.revokeObjectURL(url); // Free up memory
  };


  // Define Tailwind classes for table cells - Refined
  const thStyle = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
       {/* Header Row */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <h1 className="text-3xl font-bold text-gray-800">Administrar Empleados</h1>
         <Button onClick={() => setIsBulkModalOpen(true)} variant="secondary" className="w-full sm:w-auto inline-flex items-center justify-center">
            <ArrowUpTrayIcon className="h-5 w-5 mr-1.5" />
            Carga Masiva de Empleados
         </Button>
       </div>


      {/* Add Employee Form - Improved Layout */}
      <form onSubmit={handleAddEmployee} className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4">
         <h2 className="text-lg font-medium text-gray-700">Agregar Nuevo Empleado</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
             <label htmlFor="new-employee-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
             <Input id="new-employee-name" type="text" value={newEmployeeName} onChange={(e) => setNewEmployeeName(e.target.value)} placeholder="Juan Pérez" required className="mt-0 w-full"/>
           </div>
           <div>
             <label htmlFor="new-employee-email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
             <Input id="new-employee-email" type="email" value={newEmployeeEmail} onChange={(e) => setNewEmployeeEmail(e.target.value)} placeholder="juan.perez@empresa.com" required className="mt-0 w-full"/>
           </div>
           <div>
             <label htmlFor="new-employee-password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
             <Input id="new-employee-password" type="password" value={newEmployeePassword} onChange={(e) => setNewEmployeePassword(e.target.value)} placeholder="Mín. 6 caracteres" required minLength="6" className="mt-0 w-full"/>
           </div>
         </div>
         {/* Use Alert for add errors */}
         {addError && <Alert type="error">{addError}</Alert>}
         <div className="flex justify-end">
           <Button type="submit" disabled={adding} variant="primary" className="inline-flex items-center">
             {adding ? <Spinner size="sm" color="text-white" className="mr-2"/> : <PlusIcon className="h-5 w-5 mr-1.5"/>}
             {adding ? 'Agregando...' : 'Agregar Empleado'}
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
                <th className={thStyle}>Nombre</th>
                <th className={thStyle}>Correo</th>
                <th className={thStyle}>Puntos</th>
                <th className={thStyle}>Puntaje de Enganche</th>
                <th className={thStyle}>Estado</th>
                <th className={`${thStyle} text-right pr-6`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`${tdStyle} text-center text-gray-500 py-6`}>
                    No se encontraron empleados para esta empresa.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className={`${tdStyle} font-medium text-gray-900`}>
                      {employee.nombre || <span className="text-gray-400 italic">Sin Nombre</span>}
                    </td>
                    <td className={`${tdStyle} text-gray-500`}>{employee.email}</td>
                    <td className={`${tdStyle} text-gray-700 font-medium`}>
                      {employee.points ?? 0}
                    </td>
                    <td className={`${tdStyle} text-center`}>
                      {loadingScores ? (
                        <Spinner size="xs"/>
                      ) : (
                        <span className={`font-semibold ${
                          engagementScores[employee.id] >= 2 ? 'text-green-600' :
                          engagementScores[employee.id] === 1 ? 'text-yellow-600' :
                          'text-gray-400'
                        }`}>
                          {engagementScores[employee.id] ?? '-'}
                        </span>
                      )}
                    </td>
                    <td className={tdStyle}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className={`${tdStyle} text-right space-x-2 pr-6`}>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleEditClick(employee)} 
                        className="inline-flex items-center"
                      >
                        <PencilSquareIcon className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      {employee.isActive ? (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDeleteClick(employee.id, employee.nombre)} 
                          className="inline-flex items-center"
                        >
                          <UserMinusIcon className="h-4 w-4 mr-1" /> Marcar Inactivo
                        </Button>
                      ) : (
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => handleActivateClick(employee.id, employee.nombre)} 
                          className="inline-flex items-center"
                        >
                          <UserPlusIcon className="h-4 w-4 mr-1" /> Marcar Activo
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
         <Modal isOpen={isModalOpen} onClose={closeModal} title={`Editar Empleado: ${editingEmployee.nombre || editingEmployee.email}`}> {/* <-- Corregido */}
             <form onSubmit={handleSaveEdit} className="space-y-4">
                 <div>
                     <label htmlFor="edit-employee-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Empleado</label>
                     <Input id="edit-employee-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="mt-0 w-full"/>
                 </div>
                 <div>
                     <label htmlFor="edit-employee-email" className="block text-sm font-medium text-gray-700 mb-1">Correo (Solo lectura)</label>
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
                        <span className="ml-2 text-sm text-gray-700">Activo (El usuario puede iniciar sesión)</span>
                    </label>
                  </div>
                  {editError && <Alert type="error">{editError}</Alert>}
                  <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
                      <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>Cancelar</Button>
                      <Button type="submit" variant="primary" disabled={saving} className="inline-flex items-center">
                        {saving ? <Spinner size="sm" color="text-white" className="mr-2"/> : <PencilSquareIcon className="h-4 w-4 mr-1.5"/>}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                 </div>
             </form>
         </Modal>
      )}

       {/* Bulk Upload Modal */}
       <Modal isOpen={isBulkModalOpen} onClose={closeBulkModal} title="Carga Masiva de Empleados (CSV)">
         <div className="space-y-4">
           {!uploading && !isProcessingComplete && (
             <>
               <p className="text-sm text-gray-600">
                 Selecciona un archivo CSV con las columnas: <strong>Nombre</strong>, <strong>Email</strong>.
                 <br />
                 <strong className="text-red-600">NO</strong> incluyas una columna de contraseña. Las contraseñas temporales serán generadas.
               </p>
               <div>
                 <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Archivo CSV</label>
                 <input
                   id="csv-upload"
                   type="file"
                   accept=".csv"
                   onChange={handleFileChange}
                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                 />
               </div>
               {uploadError && <Alert type="error">{uploadError}</Alert>}
               {parsedData.length > 0 && (
                 <div className="mt-4 p-3 bg-gray-100 rounded">
                   <p className="text-sm font-medium text-gray-700">
                     Se encontraron {parsedData.length} filas de empleados válidas para cargar.
                   </p>
                   {/* Optional: Show preview of first few rows */}
                 </div>
               )}
               <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
                 <Button type="button" variant="secondary" onClick={closeBulkModal}>Cancelar</Button>
                 <Button
                   type="button"
                   variant="primary"
                   onClick={handleBulkUpload}
                   disabled={parsedData.length === 0 || uploading}
                   className="inline-flex items-center"
                 >
                   <ArrowUpTrayIcon className="h-5 w-5 mr-1.5" />
                   Iniciar Carga
                 </Button>
               </div>
             </>
           )}

           {uploading && (
             <div className="text-center py-6">
               <Spinner size="lg" />
               <p className="mt-3 text-lg font-medium text-gray-700">Cargando empleados...</p>
               <p className="text-sm text-gray-500">Progreso: {uploadProgress.toFixed(0)}%</p>
               {/* Progress Bar */}
               <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                 <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
               </div>
             </div>
           )}

           {isProcessingComplete && (
             <div>
               <h3 className="text-lg font-medium text-gray-900 mb-3">Carga Completa</h3>
               {uploadResults.success.length > 0 && (
                 <div className="mb-4">
                   <h4 className="text-md font-semibold text-green-700 mb-2">Creados Exitosamente ({uploadResults.success.length}):</h4>
                   <div className="max-h-40 overflow-y-auto border rounded p-2 bg-green-50 text-xs space-y-1">
                     {uploadResults.success.map((s, index) => (
                       <p key={index}>
                         <strong>{s.name}</strong> ({s.email}) - Contraseña Temporal: <code className="bg-gray-200 px-1 rounded">{s.tempPassword}</code>
                       </p>
                     ))}
                   </div>
                    <p className="text-xs text-orange-600 mt-2"><strong>Importante:</strong> Por favor distribuye estas contraseñas temporales de forma segura a los empleados correspondientes.</p>
                 </div>
               )}
               {uploadResults.errors.length > 0 && (
                 <div className="mb-4">
                   <h4 className="text-md font-semibold text-red-700 mb-2">Errores ({uploadResults.errors.length}):</h4>
                   <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                     {uploadResults.errors.map((e, index) => (
                       <li key={index}><strong>{e.email}:</strong> {e.error}</li>
                     ))}
                    </ul>
                  </div>
                )}
                 {/* Download Button */}
                 {uploadResults.success.length > 0 && (
                    <div className="mt-4">
                       <Button
                         type="button"
                         variant="outline"
                         onClick={handleDownloadCredentials}
                         className="inline-flex items-center"
                       >
                         <ArrowDownTrayIcon className="h-5 w-5 mr-1.5" />
                         Descargar Credenciales (.csv)
                          </Button>
                      </div>
                   )}
                  <div className="pt-4 flex justify-end border-t border-gray-200 mt-4">
                    <Button type="button" variant="secondary" onClick={closeBulkModal}>Cerrar</Button>
                  </div>
                </div>
           )}
         </div>
       </Modal>

    </div>
  );
}

export default ManageEmployees;

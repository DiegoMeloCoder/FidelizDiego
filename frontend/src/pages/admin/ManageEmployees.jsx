import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; // Added serverTimestamp
import { initializeApp, deleteApp } from 'firebase/app'; // Added for secondary app
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Added getAuth
import { db, firebaseConfig } from '../../firebase/config'; // Import firebaseConfig, keep db for Firestore ops
import { useAuth } from '../../contexts/AuthContext.jsx';
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
    let tempApp = null; // Variable to hold the temporary app instance
    let newUser = null; // Variable to hold the created user
    try {
      // 1. Initialize temporary Firebase app
      const tempAppName = `secondary-auth-${Date.now()}`;
      tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getAuth(tempApp);

      // 2. Create Firebase Auth user using the temporary instance
      console.log("Creating user with temporary auth instance...");
      const userCredential = await createUserWithEmailAndPassword(tempAuth, newEmployeeEmail, newEmployeePassword);
      newUser = userCredential.user;
      console.log("User created successfully in temporary auth instance:", newUser.uid);

      // 3. Create Firestore user document (using the main 'db' instance)
      const userDocRef = doc(db, 'users', newUser.uid); // Use main db instance
      const newEmployeeData = {
        email: newEmployeeEmail,
        name: newEmployeeName.trim(),
        role: 'Employee',
        companyId: adminUserData.companyId,
        points: 0, // Initial points
        isActive: true, // Employees are active by default
        createdAt: serverTimestamp() // Add createdAt timestamp
      };
      await setDoc(userDocRef, newEmployeeData); // Use main db instance

      // 4. Update local state
      setEmployees(prev => [...prev, { id: newUser.uid, ...newEmployeeData, isActive: true }]); // Ensure isActive is set locally
      setNewEmployeeName(''); setNewEmployeeEmail(''); setNewEmployeePassword('');
      setSuccessMessage(`Employee ${newEmployeeData.name} added successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error adding employee:", err);
      // Handle specific auth errors from the temporary instance
      if (err.code === 'auth/email-already-in-use') {
        setAddError('This email address is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setAddError('Password is too weak (min. 6 characters).');
      } else {
         // General error (could be auth or Firestore)
        setAddError('Failed to add employee. Check console for details.');
      }
      clearMessages();
    } finally {
      setAdding(false);
       // 5. Clean up the temporary Firebase app instance regardless of success/failure
       if (tempApp) {
        try {
          await deleteApp(tempApp);
          console.log("Temporary Firebase app instance deleted.");
        } catch (deleteError) {
          console.error("Error deleting temporary Firebase app instance:", deleteError);
        }
      }
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
  const generateTemporaryPassword = (length = 10) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
  }

  const handleBulkUpload = async () => {
    if (parsedData.length === 0) {
      setUploadError('No valid employee data to upload.');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setUploadResults({ success: [], errors: [] });
    setIsProcessingComplete(false);
    const total = parsedData.length;
    let currentSuccess = [];
    let currentErrors = [];

    for (let i = 0; i < total; i++) {
      const row = parsedData[i];
      const name = row.Nombre?.trim();
      const email = row.Email?.trim();

      if (!name || !email) {
        currentErrors.push({ email: email || `Row ${i+1}`, error: 'Missing Name or Email' });
        setUploadProgress(((i + 1) / total) * 100);
        continue; // Skip this row
      }

      // Basic email format check (can be improved)
      if (!/\S+@\S+\.\S+/.test(email)) {
          currentErrors.push({ email: email, error: 'Invalid Email Format' });
          setUploadProgress(((i + 1) / total) * 100);
          continue;
      }


      const tempPassword = generateTemporaryPassword();
      let tempApp = null;
      let newUser = null;

      try {
        const tempAppName = `secondary-bulk-${Date.now()}-${i}`;
        tempApp = initializeApp(firebaseConfig, tempAppName);
        const tempAuth = getAuth(tempApp);

        console.log(`Creating user ${i+1}/${total}: ${email}`);
        const userCredential = await createUserWithEmailAndPassword(tempAuth, email, tempPassword);
        newUser = userCredential.user;

        const userDocRef = doc(db, 'users', newUser.uid);
        const newEmployeeData = {
          email: email, name: name, role: 'Employee',
          companyId: adminUserData.companyId, points: 0, isActive: true,
          createdAt: serverTimestamp()
        };
        await setDoc(userDocRef, newEmployeeData);

        currentSuccess.push({ email: email, name: name, tempPassword: tempPassword });

      } catch (err) {
        console.error(`Error adding employee ${email}:`, err);
        let errorMessage = 'Failed to create user.';
        if (err.code === 'auth/email-already-in-use') {
          errorMessage = 'Email already registered.';
        } else if (err.code === 'auth/weak-password') {
           // Should not happen with generated password, but include just in case
           errorMessage = 'Generated password was too weak (unexpected).';
        }
        currentErrors.push({ email: email, error: errorMessage });
      } finally {
        if (tempApp) {
          try { await deleteApp(tempApp); } catch (e) { console.error("Error deleting temp app", e); }
        }
        // Update progress after each attempt
        setUploadProgress(((i + 1) / total) * 100);
         // Optional delay to mitigate rate limits
         // await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    setUploadResults({ success: currentSuccess, errors: currentErrors });
    setUploading(false);
    setIsProcessingComplete(true);
    // Fetch updated employee list after bulk add
     fetchEmployees();
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
         <h1 className="text-3xl font-bold text-gray-800">Manage Employees</h1>
         <Button onClick={() => setIsBulkModalOpen(true)} variant="secondary" className="w-full sm:w-auto inline-flex items-center justify-center">
            <ArrowUpTrayIcon className="h-5 w-5 mr-1.5" />
            Bulk Upload Employees
         </Button>
       </div>


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
             {adding ? 'Adding...' : 'Add Single Employee'}
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

       {/* Bulk Upload Modal */}
       <Modal isOpen={isBulkModalOpen} onClose={closeBulkModal} title="Bulk Upload Employees (CSV)">
         <div className="space-y-4">
           {!uploading && !isProcessingComplete && (
             <>
               <p className="text-sm text-gray-600">
                 Select a CSV file with columns: <strong>Nombre</strong>, <strong>Email</strong>.
                 <br />
                 Do <strong className="text-red-600">NOT</strong> include a password column. Temporary passwords will be generated.
               </p>
               <div>
                 <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700 mb-1">Select CSV File</label>
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
                     Found {parsedData.length} valid employee rows to upload.
                   </p>
                   {/* Optional: Show preview of first few rows */}
                 </div>
               )}
               <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
                 <Button type="button" variant="secondary" onClick={closeBulkModal}>Cancel</Button>
                 <Button
                   type="button"
                   variant="primary"
                   onClick={handleBulkUpload}
                   disabled={parsedData.length === 0 || uploading}
                   className="inline-flex items-center"
                 >
                   <ArrowUpTrayIcon className="h-5 w-5 mr-1.5" />
                   Start Upload
                 </Button>
               </div>
             </>
           )}

           {uploading && (
             <div className="text-center py-6">
               <Spinner size="lg" />
               <p className="mt-3 text-lg font-medium text-gray-700">Uploading Employees...</p>
               <p className="text-sm text-gray-500">Progress: {uploadProgress.toFixed(0)}%</p>
               {/* Progress Bar */}
               <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                 <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
               </div>
             </div>
           )}

           {isProcessingComplete && (
             <div>
               <h3 className="text-lg font-medium text-gray-900 mb-3">Upload Complete</h3>
               {uploadResults.success.length > 0 && (
                 <div className="mb-4">
                   <h4 className="text-md font-semibold text-green-700 mb-2">Successfully Created ({uploadResults.success.length}):</h4>
                   <div className="max-h-40 overflow-y-auto border rounded p-2 bg-green-50 text-xs space-y-1">
                     {uploadResults.success.map((s, index) => (
                       <p key={index}>
                         <strong>{s.name}</strong> ({s.email}) - Temp Password: <code className="bg-gray-200 px-1 rounded">{s.tempPassword}</code>
                       </p>
                     ))}
                   </div>
                    <p className="text-xs text-orange-600 mt-2"><strong>Important:</strong> Please securely distribute these temporary passwords to the respective employees.</p>
                 </div>
               )}
               {uploadResults.errors.length > 0 && (
                 <div className="mb-4">
                   <h4 className="text-md font-semibold text-red-700 mb-2">Errors ({uploadResults.errors.length}):</h4>
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
                         Download Credentials (.csv)
                          </Button>
                      </div>
                   )}
                  <div className="pt-4 flex justify-end border-t border-gray-200 mt-4">
                    <Button type="button" variant="secondary" onClick={closeBulkModal}>Close</Button>
                  </div>
                </div>
           )}
         </div>
       </Modal>

    </div>
  );
}

export default ManageEmployees;

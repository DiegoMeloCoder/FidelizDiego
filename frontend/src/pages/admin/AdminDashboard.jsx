import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx'; // Updated extension
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions if needed
import { db } from '../../firebase/config'; // Import db if needed
import { useState, useEffect } from 'react'; // Import hooks if needed

function AdminDashboard() {
  const { currentUser, userData } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [loadingCompany, setLoadingCompany] = useState(true);

  // Fetch company name based on userData.companyId
  useEffect(() => {
    const fetchCompanyName = async () => {
      if (userData?.companyId) {
        setLoadingCompany(true);
        const companyDocRef = doc(db, 'companies', userData.companyId);
        try {
          const companyDocSnap = await getDoc(companyDocRef);
          if (companyDocSnap.exists()) {
            setCompanyName(companyDocSnap.data().name);
          } else {
            console.warn("Company document not found for ID:", userData.companyId);
            setCompanyName('Unknown Company');
          }
        } catch (error) {
          console.error("Error fetching company name:", error);
          setCompanyName('Error loading company');
        } finally {
          setLoadingCompany(false);
        }
      } else {
        setLoadingCompany(false); // No companyId to fetch
      }
    };

    fetchCompanyName();
  }, [userData?.companyId]); // Re-run if companyId changes

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Admin Dashboard {loadingCompany ? '...' : `- ${companyName}`}
      </h1>
      <p className="text-gray-600 mb-4">
        Welcome, {currentUser?.email || 'Admin'}! Manage employees and rewards for your company.
      </p>
      <button
        // onClick={() => alert('Assign Points functionality not implemented yet.')}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        disabled // Disabled for MVP
      >
        Assign Points (MVP: Disabled)
      </button>
      {/* Add dashboard widgets or summaries here later */}
    </div>
  );
}

export default AdminDashboard;

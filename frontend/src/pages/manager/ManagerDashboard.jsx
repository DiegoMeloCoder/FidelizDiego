import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Ensure db is exported from config
import { useAuth } from '../../contexts/AuthContext.jsx';
import Spinner from '../../components/ui/Spinner'; // Import Spinner
import { BuildingOffice2Icon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'; // Icons for stats

function ManagerDashboard() {
  const { currentUser } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const companiesCol = collection(db, 'companies');
        const companySnapshot = await getDocs(companiesCol);
        const companyList = companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCompanies(companyList);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError('Failed to load company data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const inactiveCompanies = companies.filter(c => c.status === 'inactive').length;
  // const pendingCompanies = companies.filter(c => c.status === 'pending_payment').length; // If you add this status

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
      <p className="text-gray-600 text-lg">
        Welcome back, {currentUser?.email || 'Manager'}! Overview of the platform status.
      </p>

      {loading && <div className="flex justify-center p-10"><Spinner /></div>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Total Companies Card */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <BuildingOffice2Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Companies</p>
              <p className="text-2xl font-semibold text-gray-800">{totalCompanies}</p>
            </div>
          </div>

          {/* Active Companies Card */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Companies</p>
              <p className="text-2xl font-semibold text-gray-800">{activeCompanies}</p>
            </div>
          </div>

          {/* Inactive Companies Card */}
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex items-center space-x-4">
            <div className="bg-red-100 p-3 rounded-full">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Inactive Companies</p>
              <p className="text-2xl font-semibold text-gray-800">{inactiveCompanies}</p>
            </div>
          </div>

           {/* Add more cards if needed, e.g., for pending status */}
        </div>
      )}

      {/* Placeholder for future charts or quick actions */}
      {/* <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Quick Actions</h2>
        </div> */}
    </div>
  );
}

export default ManagerDashboard;

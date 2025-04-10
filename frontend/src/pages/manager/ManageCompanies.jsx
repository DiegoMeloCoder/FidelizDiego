import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError('');
      try {
        const companiesCol = collection(db, 'companies');
        const companySnapshot = await getDocs(companiesCol);
        const companyList = companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCompanies(companyList);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError('Failed to load companies.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []); // Empty dependency array means run once on mount

  // Handle adding a new company
  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      setError('Company name cannot be empty.');
      return;
    }
    setAdding(true);
    setError('');
    try {
      const companiesCol = collection(db, 'companies');
      const newCompany = {
        name: newCompanyName.trim(),
        status: 'active', // Default status
        createdAt: serverTimestamp() // Optional: track creation time
      };
      const docRef = await addDoc(companiesCol, newCompany);
      // Add the new company to the local state immediately
      setCompanies(prevCompanies => [...prevCompanies, { id: docRef.id, ...newCompany }]);
      setNewCompanyName(''); // Clear input field
    } catch (err) {
      console.error("Error adding company:", err);
      setError('Failed to add company.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Companies</h1>

      {/* Add Company Form */}
      <form onSubmit={handleAddCompany} className="mb-6 flex items-center space-x-3">
        <input
          type="text"
          value={newCompanyName}
          onChange={(e) => setNewCompanyName(e.target.value)}
          placeholder="New Company Name"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
        <button
          type="submit"
          disabled={adding}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {adding ? 'Adding...' : 'Add Company'}
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Companies List */}
      {loading ? (
        <p>Loading companies...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                {/* Add more columns like 'Actions' later */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No companies found.</td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.id}</td>
                    {/* Actions column */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageCompanies;

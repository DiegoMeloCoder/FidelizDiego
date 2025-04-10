import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx'; // Updated extension

function EmployeeDashboard() {
  const { currentUser, userData } = useAuth(); // userData contains points

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Employee Dashboard</h1>
      <p className="text-gray-600 mb-2">
        Welcome, {userData?.name || currentUser?.email || 'Employee'}!
      </p>
      <div className="mt-4 p-4 bg-indigo-100 rounded-lg inline-block">
        <p className="text-lg font-medium text-indigo-800">
          Your Points Balance:
          <span className="ml-2 text-2xl font-bold">{userData?.points ?? 'Loading...'}</span>
        </p>
      </div>
      {/* Add recent transactions or other info later */}
    </div>
  );
}

export default EmployeeDashboard;

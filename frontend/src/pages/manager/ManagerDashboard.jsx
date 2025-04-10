import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx'; // Updated extension

function ManagerDashboard() {
  const { currentUser } = useAuth(); // Example: Get current user

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Manager Dashboard</h1>
      <p className="text-gray-600">
        Welcome, {currentUser?.email || 'Manager'}! This is the central hub for managing companies and administrators.
      </p>
      {/* Add dashboard widgets or summaries here later */}
    </div>
  );
}

export default ManagerDashboard;

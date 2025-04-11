import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../../components/ui/Button'; // Import Button if needed for actions
import { StarIcon, GiftIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'; // Icons

function EmployeeDashboard() {
  const { currentUser, userData } = useAuth(); // userData contains points

  // Determine the name to display
  const displayName = userData?.name || currentUser?.email || 'Employee';

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome, {displayName}!
      </h1>

      {/* Points Balance Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-lg flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-100 uppercase tracking-wider">Your Points Balance</p>
          <p className="text-4xl font-bold mt-1">
            {userData?.points !== undefined ? userData.points : <span className="text-2xl animate-pulse">...</span>}
          </p>
        </div>
        <StarIcon className="h-12 w-12 text-yellow-300 opacity-80" />
      </div>

      {/* Quick Actions/Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/employee/rewards" className="block group">
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-200 flex items-center space-x-4">
            <div className="bg-rose-100 p-3 rounded-full">
              <GiftIcon className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">View Rewards Catalog</p>
              <p className="text-sm text-gray-500">Browse and redeem available rewards.</p>
            </div>
          </div>
        </Link>

        <Link to="/employee/history" className="block group">
          <div className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-200 flex items-center space-x-4">
            <div className="bg-sky-100 p-3 rounded-full">
              <ClipboardDocumentListIcon className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">View My History</p>
              <p className="text-sm text-gray-500">Check your points and redemption history.</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Placeholder for recent activity feed */}
      {/* <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Recent Activity</h2>
         List recent point gains/redemptions here
      </div> */}
    </div>
  );
}

export default EmployeeDashboard;

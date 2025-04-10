import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx'; // Updated extension

function AppLayout() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // AuthProvider will detect sign-out and redirect via ProtectedRoute/RootRedirect
      console.log("User signed out successfully.");
      // Navigate to login might be needed if RootRedirect doesn't trigger reliably on logout
      navigate('/login');
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  // Basic sidebar/content structure with Tailwind
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0"> {/* Added flex-shrink-0 */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Fideliz</h2>
          {userData && <span className="text-sm text-gray-400">{userData.role}</span>}
        </div>

        {/* Scrollable Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {userData?.role === 'Manager' && (
            <>
              <Link to="/manager" className="block px-4 py-2 rounded hover:bg-gray-700">Dashboard</Link>
              <Link to="/manager/companies" className="block px-4 py-2 rounded hover:bg-gray-700">Companies</Link>
            </>
          )}
          {userData?.role === 'Admin' && (
            <>
              <Link to="/admin" className="block px-4 py-2 rounded hover:bg-gray-700">Dashboard</Link>
              <Link to="/admin/employees" className="block px-4 py-2 rounded hover:bg-gray-700">Employees</Link>
              <Link to="/admin/rewards" className="block px-4 py-2 rounded hover:bg-gray-700">Rewards</Link>
            </>
          )}
          {userData?.role === 'Employee' && (
            <>
              <Link to="/employee" className="block px-4 py-2 rounded hover:bg-gray-700">Dashboard</Link>
              <Link to="/employee/rewards" className="block px-4 py-2 rounded hover:bg-gray-700">Rewards Catalog</Link>
            </>
          )}
        </nav>

        {/* Logout Section (at the bottom, outside scrollable nav) */}
        <div className="p-4 border-t border-gray-700">
          {currentUser && (
            <div className="text-xs text-gray-400 mb-2 truncate" title={currentUser.email}>
              Logged in as: {currentUser.email}
            </div>
             )}
             {/* Refined Logout Button */}
             <button
               onClick={handleLogout}
               className="w-full flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors duration-150"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"> {/* Smaller icon */}
                 <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm12.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.586 13H9a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
            Logout
          </button>
        </div>
      </div> {/* End Sidebar */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

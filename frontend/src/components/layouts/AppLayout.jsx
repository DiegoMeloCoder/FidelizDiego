import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../ui/Button'; // Import Button

function AppLayout() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get current path

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully.");
      navigate('/login');
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  // Helper function to determine active link
  const isActive = (path) => location.pathname === path;

  // Common Link Styles
  const linkBaseClasses = "flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150";
  const activeLinkClasses = "bg-gray-950 text-white";

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-gray-200 flex flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white text-center">Fideliz</h2>
          {userData && <span className="block text-xs text-gray-500 text-center mt-1">{userData.role}</span>}
        </div>

        {/* Scrollable Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {userData?.role === 'Manager' && (
            <>
              <Link to="/manager" className={`${linkBaseClasses} ${isActive('/manager') ? activeLinkClasses : ''}`}>Dashboard</Link>
              <Link to="/manager/companies" className={`${linkBaseClasses} ${isActive('/manager/companies') ? activeLinkClasses : ''}`}>Companies</Link>
            </>
          )}
          {userData?.role === 'Admin' && (
            <>
              <Link to="/admin" className={`${linkBaseClasses} ${isActive('/admin') ? activeLinkClasses : ''}`}>Dashboard</Link>
              <Link to="/admin/employees" className={`${linkBaseClasses} ${isActive('/admin/employees') ? activeLinkClasses : ''}`}>Employees</Link>
              <Link to="/admin/rewards" className={`${linkBaseClasses} ${isActive('/admin/rewards') ? activeLinkClasses : ''}`}>Rewards</Link>
            </>
          )}
          {userData?.role === 'Employee' && (
            <>
              <Link to="/employee" className={`${linkBaseClasses} ${isActive('/employee') ? activeLinkClasses : ''}`}>Dashboard</Link>
              <Link to="/employee/rewards" className={`${linkBaseClasses} ${isActive('/employee/rewards') ? activeLinkClasses : ''}`}>Rewards Catalog</Link>
            </>
          )}
        </nav>

        {/* Logout Section */}
        <div className="mt-auto p-4 border-t border-gray-700">
          {currentUser && (
            <div className="text-xs text-gray-500 mb-2 truncate" title={currentUser.email}>
              Logged in as: {currentUser.email}
            </div>
          )}
          {/* Use Button component */}
          <Button
            onClick={handleLogout}
            variant="danger"
            size="sm"
            className="w-full justify-center" // Removed specific bg colors, rely on variant
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm12.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.586 13H9a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Logout
          </Button>
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

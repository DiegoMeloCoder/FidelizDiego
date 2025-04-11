import React, { useState } from 'react'; // Added useState for mobile menu
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../ui/Button';

function AppLayout() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully.");
      navigate('/login');
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path)); // Broader active check

  const linkBaseClasses = "flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150";
  const activeLinkClasses = "bg-gray-950 text-white";

  const sidebarContent = (
    <>
      <div className="px-4 py-5 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white text-center">Fideliz</h2>
        {userData && <span className="block text-xs text-gray-500 text-center mt-1">{userData.role}</span>}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {/* Links */}
        {userData?.role === 'Manager' && (
          <>
            <Link to="/manager" className={`${linkBaseClasses} ${isActive('/manager') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>Dashboard</Link>
            <Link to="/manager/companies" className={`${linkBaseClasses} ${isActive('/manager/companies') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>Companies</Link>
          </>
        )}
        {userData?.role === 'Admin' && (
          <>
            <Link to="/admin" className={`${linkBaseClasses} ${isActive('/admin') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>Dashboard</Link>
            <Link to="/admin/employees" className={`${linkBaseClasses} ${isActive('/admin/employees') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>Employees</Link>
            <Link to="/admin/rewards" className={`${linkBaseClasses} ${isActive('/admin/rewards') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>Rewards</Link>
            <Link to="/admin/history/points" className={`${linkBaseClasses} ${isActive('/admin/history/points') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>Points History</Link>
            <Link to="/admin/ranking" className={`${linkBaseClasses} ${isActive('/admin/ranking') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>Ranking</Link>
          </>
        )}
        {userData?.role === 'Employee' && (
          <>
            <Link to="/employee" className={`${linkBaseClasses} ${isActive('/employee') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>Dashboard</Link>
            <Link to="/employee/rewards" className={`${linkBaseClasses} ${isActive('/employee/rewards') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>Rewards Catalog</Link>
            <Link to="/employee/history" className={`${linkBaseClasses} ${isActive('/employee/history') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>My History</Link>
            <Link to="/employee/ranking" className={`${linkBaseClasses} ${isActive('/employee/ranking') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>Ranking</Link>
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
        <Button onClick={handleLogout} variant="danger" size="sm" className="w-full justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm12.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.586 13H9a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Static Sidebar for larger screens */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-gray-900 text-gray-200 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header with Menu Button */}
        <header className="md:hidden bg-gray-800 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-white">Fideliz</h2>
              </div>
              <div className="-mr-2 flex">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  type="button"
                  className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  aria-controls="mobile-menu"
                  aria-expanded={isSidebarOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {/* Icon when menu is closed. */}
                  <svg className={`${isSidebarOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  {/* Icon when menu is open. */}
                  <svg className={`${isSidebarOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar (Slide-over or similar) */}
        {/* A simple implementation: show/hide based on state */}
        <div className={`md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} id="mobile-menu">
           <div className="fixed inset-0 flex z-40"> {/* Overlay and positioning */}
                {/* Off-canvas menu */}
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-900 text-gray-200">
                    {/* Close button inside */}
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            type="button"
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <span className="sr-only">Close sidebar</span>
                            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {/* Sidebar content */}
                    {sidebarContent}
                </div>
                {/* Dummy element to close sidebar on click outside */}
                <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
           </div>
        </div>


        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4 md:p-6"> {/* Adjusted padding */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

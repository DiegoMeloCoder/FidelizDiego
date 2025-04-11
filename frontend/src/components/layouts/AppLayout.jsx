import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../ui/Button';
// Import Heroicons (assuming you'll install @heroicons/react)
import {
  HomeIcon, // Dashboard
  BuildingOffice2Icon, // Companies / Company Info
  UsersIcon, // Employees / Users
  GiftIcon, // Rewards
  ClipboardDocumentListIcon, // History / Lists
  ChartBarIcon, // Ranking
  ArrowLeftOnRectangleIcon, // Logout
  Bars3Icon, // Menu Open
  XMarkIcon, // Menu Close
} from '@heroicons/react/24/outline'; // Using outline style

function AppLayout() {
  const { currentUser, userData } = useAuth();
  // TODO: Fetch company name based on userData.companyId if needed elsewhere, or pass it down if already fetched.
  // For now, let's assume we might have companyName in userData or fetch it.
  // Example: const companyName = userData?.companyName || 'Your Company';
  const companyName = userData?.companyData?.nombre || 'Company'; // Assuming company data is fetched and stored in userData

  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully.");
      navigate('/login');
    } catch (error) {
      console.error("Failed to sign out:", error);
      // TODO: Add user feedback on error (e.g., toast notification)
    }
  };

  const isActive = (path) => {
    // Exact match for root paths like /admin, /employee, /manager
    if (path === '/admin' || path === '/employee' || path === '/manager') {
      return location.pathname === path;
    }
    // StartsWith match for nested paths
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path) && path.length > 1);
  }

  // Refined styles
  const linkBaseClasses = "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-300 hover:bg-indigo-600 hover:text-white transition-colors duration-150";
  const activeLinkClasses = "bg-indigo-700 text-white shadow-inner"; // Clearer active state
  const iconClasses = "mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-150";
  const activeIconClasses = "text-white"; // Ensure icon color matches text on active

  const sidebarContent = (
    <div className="flex flex-col h-full"> {/* Ensure flex column takes full height */}
      {/* Header Section */}
      <div className="px-4 py-5 border-b border-gray-700/50">
        <h1 className="text-2xl font-semibold text-white text-center tracking-tight">Fideliz</h1>
        {userData && (
          <div className="mt-2 text-center">
            <span className="block text-xs font-medium text-indigo-300 uppercase tracking-wider">{userData.role}</span>
            { (userData.role === 'Admin' || userData.role === 'Employee') && companyName &&
              <span className="block text-xs text-gray-400 mt-0.5 truncate" title={companyName}>
                <BuildingOffice2Icon className="inline-block h-3 w-3 mr-1 align-text-bottom text-gray-500"/>
                {companyName}
              </span>
            }
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto">
        {userData?.role === 'Manager' && (
          <>
            <Link to="/manager" className={`${linkBaseClasses} ${isActive('/manager') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <HomeIcon className={`${iconClasses} ${isActive('/manager') ? activeIconClasses : ''}`} /> Dashboard
            </Link>
            <Link to="/manager/companies" className={`${linkBaseClasses} ${isActive('/manager/companies') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <BuildingOffice2Icon className={`${iconClasses} ${isActive('/manager/companies') ? activeIconClasses : ''}`} /> Companies
            </Link>
          </>
        )}
        {userData?.role === 'Admin' && (
          <>
            <Link to="/admin" className={`${linkBaseClasses} ${isActive('/admin') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <HomeIcon className={`${iconClasses} ${isActive('/admin') ? activeIconClasses : ''}`} /> Dashboard
            </Link>
            <Link to="/admin/employees" className={`${linkBaseClasses} ${isActive('/admin/employees') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <UsersIcon className={`${iconClasses} ${isActive('/admin/employees') ? activeIconClasses : ''}`} /> Employees
            </Link>
            <Link to="/admin/rewards" className={`${linkBaseClasses} ${isActive('/admin/rewards') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <GiftIcon className={`${iconClasses} ${isActive('/admin/rewards') ? activeIconClasses : ''}`} /> Rewards
            </Link>
            <Link to="/admin/history/points" className={`${linkBaseClasses} ${isActive('/admin/history/points') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <ClipboardDocumentListIcon className={`${iconClasses} ${isActive('/admin/history/points') ? activeIconClasses : ''}`} /> Points History
            </Link>
            <Link to="/admin/ranking" className={`${linkBaseClasses} ${isActive('/admin/ranking') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <ChartBarIcon className={`${iconClasses} ${isActive('/admin/ranking') ? activeIconClasses : ''}`} /> Ranking
            </Link>
          </>
        )}
        {userData?.role === 'Employee' && (
          <>
            <Link to="/employee" className={`${linkBaseClasses} ${isActive('/employee') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <HomeIcon className={`${iconClasses} ${isActive('/employee') ? activeIconClasses : ''}`} /> Dashboard
            </Link>
            <Link to="/employee/rewards" className={`${linkBaseClasses} ${isActive('/employee/rewards') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <GiftIcon className={`${iconClasses} ${isActive('/employee/rewards') ? activeIconClasses : ''}`} /> Rewards Catalog
            </Link>
            <Link to="/employee/history" className={`${linkBaseClasses} ${isActive('/employee/history') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <ClipboardDocumentListIcon className={`${iconClasses} ${isActive('/employee/history') ? activeIconClasses : ''}`} /> My History
            </Link>
            <Link to="/employee/ranking" className={`${linkBaseClasses} ${isActive('/employee/ranking') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <ChartBarIcon className={`${iconClasses} ${isActive('/employee/ranking') ? activeIconClasses : ''}`} /> Ranking
            </Link>
          </>
        )}
      </nav>

      {/* Footer/Logout Section */}
      <div className="mt-auto p-4 border-t border-gray-700/50">
        {currentUser && (
          <div className="text-xs text-gray-400 mb-2 truncate" title={currentUser.email}>
            {currentUser.email}
          </div>
        )}
        <Button onClick={handleLogout} variant="secondary" size="sm" className="w-full justify-center !bg-gray-700 hover:!bg-gray-600 !text-gray-300 hover:!text-white">
          <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-1.5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans antialiased"> {/* Added antialiased */}
      {/* Static Sidebar for larger screens */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-gray-800 text-gray-200 flex-shrink-0 shadow-lg"> {/* Adjusted bg, added shadow */}
        {sidebarContent}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-gray-800 text-white shadow-md sticky top-0 z-10"> {/* Made header sticky */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-white tracking-tight">Fideliz</h1>
              </div>
              <div className="flex items-center">
                 {/* Optional: Show company name or role on mobile header */}
                 {userData && (
                    <span className="text-xs text-indigo-300 mr-3 hidden sm:block">
                        {userData.role} { (userData.role === 'Admin' || userData.role === 'Employee') && companyName ? `(${companyName})` : ''}
                    </span>
                 )}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  type="button"
                  className="ml-2 bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  aria-controls="mobile-menu"
                  aria-expanded={isSidebarOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon className={`${isSidebarOpen ? 'hidden' : 'block'} h-6 w-6`} aria-hidden="true" />
                  <XMarkIcon className={`${isSidebarOpen ? 'block' : 'hidden'} h-6 w-6`} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar (Slide-over with transition) */}
        <div className={`fixed inset-0 flex z-40 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transform transition-transform duration-300 ease-in-out`} role="dialog" aria-modal="true">
           {/* Off-canvas menu */}
           <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 text-gray-200 shadow-xl">
                {/* Close button inside */}
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                        type="button"
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                </div>
                {/* Sidebar content */}
                {sidebarContent}
           </div>
           {/* Overlay to close sidebar on click outside */}
           <div className="flex-shrink-0 w-14" onClick={() => setIsSidebarOpen(false)} aria-hidden="true"></div>
        </div>


        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8"> {/* Lighter bg, more padding */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

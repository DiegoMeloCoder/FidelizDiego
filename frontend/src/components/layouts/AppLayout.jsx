import React, { useState, useEffect } from 'react'; // Keep this one with useEffect
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'; // Keep the first import
import { signOut } from 'firebase/auth'; // Keep the first import
import { auth } from '../../firebase/config'; // Keep the first import
import { useAuth } from '../../contexts/AuthContext.jsx';
// Removed the duplicate imports below this line
import Button from '../ui/Button';
// Import Heroicons (assuming you'll install @heroicons/react)
import {
  HomeIcon, // Dashboard
  UserCircleIcon, // Profile
  BuildingOffice2Icon, // Companies / Company Info
  UserGroupIcon, // Admins (Manager view)
  UsersIcon, // Employees / Users
  GiftIcon, // Rewards
  DocumentMagnifyingGlassIcon, // Justifications
  ClipboardDocumentListIcon, // History / Lists
  ChartBarIcon, // Ranking
  ArrowLeftOnRectangleIcon, // Logout
  Bars3Icon, // Menu Open
  XMarkIcon, // Menu Close
  ArchiveBoxIcon, // Icon for Redemption History
  ExclamationTriangleIcon, // Icon for Anomalies
  InboxArrowDownIcon, // Icon for Reward Requests
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

  // Refined styles using brand colors - Improved contrast for dark sidebar
  const linkBaseClasses = "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-100 hover:bg-brand-primary hover:text-white transition-colors duration-150"; // Base text lighter (e.g., gray-100)
  const activeLinkClasses = "bg-brand-primary text-white shadow-inner"; // Active link uses primary color
  const iconClasses = "mr-3 flex-shrink-0 h-5 w-5 text-gray-300 group-hover:text-gray-100 transition-colors duration-150"; // Lighter base icon color (e.g., gray-300)
  const activeIconClasses = "text-white"; // Active icon remains white

  // Extract company details for easier access
  const companyLogoUrl = userData?.company?.logoUrl;
  const companyMotto = userData?.company?.motto;
  const companyDisplayName = userData?.company?.nombre || 'Company'; // Use fetched name or default
  const companyColors = userData?.company; // Get the whole company object for colors

  // --- Apply Dynamic Theme Colors ---
  useEffect(() => {
    const root = document.documentElement;
    const primary = companyColors?.primaryColor;
    const secondary = companyColors?.secondaryColor;
    const tertiary = companyColors?.tertiaryColor;

    // Function to remove existing theme properties
    const clearTheme = () => {
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-secondary');
      root.style.removeProperty('--color-tertiary');
      // Optional: remove a class if you prefer class-based theming
      // document.body.classList.remove('custom-theme');
    };

    if (primary || secondary || tertiary) {
      console.log("Applying theme colors:", { primary, secondary, tertiary });
      // Apply colors if they exist
      if (primary) root.style.setProperty('--color-primary', primary);
      if (secondary) root.style.setProperty('--color-secondary', secondary);
      if (tertiary) root.style.setProperty('--color-tertiary', tertiary);
      // Optional: add a class to body for broader CSS rules
      // document.body.classList.add('custom-theme');
    } else {
      // Clear theme if no colors are defined for the company
      clearTheme();
    }

    // Cleanup function to remove styles when component unmounts or user changes
    return () => {
      clearTheme();
    };
    // Re-run effect if any company color changes
  }, [companyColors?.primaryColor, companyColors?.secondaryColor, companyColors?.tertiaryColor]);
  // --- End Apply Dynamic Theme Colors ---


  const sidebarContent = (
    <div className="flex flex-col h-full"> {/* Ensure flex column takes full height */}
      {/* Header Section - Updated with Logo and Motto */}
      <div className="px-4 py-5 border-b border-gray-700/50 flex flex-col items-center">
        {/* Logo */}
        <div className="h-16 w-auto mb-3 flex items-center justify-center">
          {companyLogoUrl ? (
            <img src={companyLogoUrl} alt={`${companyDisplayName} Logo`} className="max-h-16 max-w-full object-contain" />
          ) : (
            // Placeholder if no logo - maybe just the app name?
             <h1 className="text-2xl font-semibold text-white tracking-tight">Fideliz</h1>
          )}
        </div>
        {/* Motto - Use a lighter, non-italic text */}
        {companyMotto && (
          <p className="text-xs text-center text-gray-300 mb-4 px-2">"{companyMotto}"</p> // Increased bottom margin, removed italic, lighter text
        )}
        {/* User Info */}
        {userData && (
          <div className="text-center w-full">
             {/* Use white or light tertiary for Role? Let's try white for emphasis */}
            <span className="block text-sm font-semibold text-white uppercase tracking-wider mb-1">{userData.role}</span> {/* Slightly larger, white, more margin */}
            {/* Display Company Name for Admin/Employee - Lighter text */}
            { (userData.role === 'Admin' || userData.role === 'Employee') &&
              <span className="block text-xs text-gray-300 mt-0.5 truncate" title={companyDisplayName}> {/* Lighter text */}
                <BuildingOffice2Icon className="inline-block h-3 w-3 mr-1 align-text-bottom text-gray-400"/> {/* Lighter icon */}
                {companyDisplayName}
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
            <Link to="/manager/admins" className={`${linkBaseClasses} ${isActive('/manager/admins') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <UserGroupIcon className={`${iconClasses} ${isActive('/manager/admins') ? activeIconClasses : ''}`} /> Admins
            </Link>
            {/* Links for Global Rewards Management - Point to /manager/rewards */}
            <Link to="/manager/rewards" className={`${linkBaseClasses} ${isActive('/manager/rewards') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <GiftIcon className={`${iconClasses} ${isActive('/manager/rewards') ? activeIconClasses : ''}`} /> Global Rewards
            </Link>
            <Link to="/manager/history/global-redemptions" className={`${linkBaseClasses} ${isActive('/manager/history/global-redemptions') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <ArchiveBoxIcon className={`${iconClasses} ${isActive('/manager/history/global-redemptions') ? activeIconClasses : ''}`} /> Global Redemptions
            </Link>
            {/* Link for Anomaly Management */}
            <Link to="/manager/anomalies" className={`${linkBaseClasses} ${isActive('/manager/anomalies') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <ExclamationTriangleIcon className={`${iconClasses} ${isActive('/manager/anomalies') ? activeIconClasses : ''}`} /> Anomalies
            </Link>
            {/* Link for Reward Request Management */}
            <Link to="/manager/reward-requests" className={`${linkBaseClasses} ${isActive('/manager/reward-requests') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <InboxArrowDownIcon className={`${iconClasses} ${isActive('/manager/reward-requests') ? activeIconClasses : ''}`} /> Reward Requests
            </Link>
          </>
        )}
        {userData?.role === 'Admin' && (
          <>
            <Link to="/admin" className={`${linkBaseClasses} ${isActive('/admin') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <HomeIcon className={`${iconClasses} ${isActive('/admin') ? activeIconClasses : ''}`} /> Dashboard
            </Link>
            <Link to="/admin/employees" className={`${linkBaseClasses} ${isActive('/admin/employees') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <UsersIcon className={`${iconClasses} ${isActive('/admin/employees') ? activeIconClasses : ''}`} /> Colaboradores
            </Link>
            <Link to="/admin/rewards" className={`${linkBaseClasses} ${isActive('/admin/rewards') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <GiftIcon className={`${iconClasses} ${isActive('/admin/rewards') ? activeIconClasses : ''}`} /> Recompensas
            </Link>
            <Link to="/admin/justifications" className={`${linkBaseClasses} ${isActive('/admin/justifications') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <DocumentMagnifyingGlassIcon className={`${iconClasses} ${isActive('/admin/justifications') ? activeIconClasses : ''}`} /> Justificaciones
            </Link>
            <Link to="/admin/history/points" className={`${linkBaseClasses} ${isActive('/admin/history/points') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <ClipboardDocumentListIcon className={`${iconClasses} ${isActive('/admin/history/points') ? activeIconClasses : ''}`} /> Historial de Puntos
            </Link>
            {/* Añadir enlace para Historial de Canjes Admin */}
            <Link to="/admin/history/redemptions" className={`${linkBaseClasses} ${isActive('/admin/history/redemptions') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <ArchiveBoxIcon className={`${iconClasses} ${isActive('/admin/history/redemptions') ? activeIconClasses : ''}`} /> Historial de Canjes
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
              <GiftIcon className={`${iconClasses} ${isActive('/employee/rewards') ? activeIconClasses : ''}`} /> Catalogo de Recompensas
            </Link>
            <Link to="/employee/history" className={`${linkBaseClasses} ${isActive('/employee/history') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <ClipboardDocumentListIcon className={`${iconClasses} ${isActive('/employee/history') ? activeIconClasses : ''}`} /> My History
            </Link>
            <Link to="/employee/ranking" className={`${linkBaseClasses} ${isActive('/employee/ranking') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <ChartBarIcon className={`${iconClasses} ${isActive('/employee/ranking') ? activeIconClasses : ''}`} /> Ranking
            </Link>
            {/* Add Profile Link */}
            <Link to="/employee/profile" className={`${linkBaseClasses} ${isActive('/employee/profile') ? activeLinkClasses : ''}`} onClick={() => setIsSidebarOpen(false)}>
              <UserCircleIcon className={`${iconClasses} ${isActive('/employee/profile') ? activeIconClasses : ''}`} /> Mi Perfil
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
    <div className="flex h-screen bg-gray-100 font-sans antialiased"> {/* Main background remains light gray */}
      {/* Static Sidebar for larger screens - Apply brand-secondary background */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-brand-secondary text-gray-200 flex-shrink-0 shadow-lg"> {/* Use brand-secondary for sidebar bg */}
        {sidebarContent}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-brand-secondary text-white shadow-md sticky top-0 z-10"> {/* Made header sticky */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-white tracking-tight">Fideliz</h1>
              </div>
              <div className="flex items-center">
                 {/* Optional: Show company name or role on mobile header - Use brand color here too? */}
                 {userData && (
                    <span className="text-xs text-brand-primary mr-3 hidden sm:block">
                        {userData.role} { (userData.role === 'Admin' || userData.role === 'Employee') && companyDisplayName ? `(${companyDisplayName})` : ''}
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
           {/* Off-canvas menu - Apply brand-secondary background */}
           <div className="relative flex-1 flex flex-col max-w-xs w-full bg-brand-secondary text-gray-200 shadow-xl"> {/* Use brand-secondary for mobile sidebar bg */}
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


        {/* Main content - Add a top border with brand-tertiary */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8 border-t-4 border-brand-tertiary"> {/* Added top border with brand-tertiary */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

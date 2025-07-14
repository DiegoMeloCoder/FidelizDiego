import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext.jsx";
import logger from "../../utils/logger.js";
import Button from "../ui/Button";
import NavItem from "../ui/NavItem";
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
  ArrowLeftEndOnRectangleIcon, // Logout
  Bars3Icon, // Menu Open
  XMarkIcon, // Menu Close
  ArchiveBoxIcon, // Icon for Redemption History
  ExclamationTriangleIcon, // Icon for Anomalies
  InboxArrowDownIcon, // Icon for Reward Requests
} from "@heroicons/react/24/outline"; // Using outline style

// --- Estructuras de Datos para la Navegación ---
const managerNavItems = [
  { to: "/manager", icon: HomeIcon, text: "Dashboard" },
  { to: "/manager/companies", icon: BuildingOffice2Icon, text: "Companies" },
  { to: "/manager/admins", icon: UserGroupIcon, text: "Admins" },
  { to: "/manager/rewards", icon: GiftIcon, text: "Global Rewards" },
  {
    to: "/manager/history/global-redemptions",
    icon: ArchiveBoxIcon,
    text: "Global Redemptions",
  },
  {
    to: "/manager/anomalies",
    icon: ExclamationTriangleIcon,
    text: "Anomalies",
  },
  {
    to: "/manager/reward-requests",
    icon: InboxArrowDownIcon,
    text: "Reward Requests",
  },
];

const adminNavItems = [
  { to: "/admin", icon: HomeIcon, text: "Panel" },
  { to: "/admin/employees", icon: UsersIcon, text: "Colaboradores" },
  { to: "/admin/rewards", icon: GiftIcon, text: "Recompensas" },
  {
    to: "/admin/justifications",
    icon: DocumentMagnifyingGlassIcon,
    text: "Justificaciones",
  },
  {
    to: "/admin/history/points",
    icon: ClipboardDocumentListIcon,
    text: "Historial de Puntos",
  },
  {
    to: "/admin/history/redemptions",
    icon: ArchiveBoxIcon,
    text: "Historial de Canjes",
  },
  { to: "/admin/ranking", icon: ChartBarIcon, text: "Ranking" },
];

const employeeNavItems = [
  { to: "/employee", icon: HomeIcon, text: "Panel" },
  { to: "/employee/rewards", icon: GiftIcon, text: "Catálogo de Recompensas" },
  {
    to: "/employee/history",
    icon: ClipboardDocumentListIcon,
    text: "Mi Historial",
  },
  { to: "/employee/ranking", icon: ChartBarIcon, text: "Ranking" },
  { to: "/employee/profile", icon: UserCircleIcon, text: "Mi Perfil" },
];

function AppLayout() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Extract company details for easier access
  const companyDisplayName = userData?.company?.nombre || "Company";

  // --- Lógica de Theming Dinámico ---
  useEffect(() => {
    const root = document.documentElement;
    const companyColors = userData?.company;

    const clearTheme = () => {
      root.style.removeProperty("--color-primary");
      root.style.removeProperty("--color-secondary");
      root.style.removeProperty("--color-tertiary");
    };

    if (companyColors) {
      logger.log("Applying theme colors:", companyColors);
      if (companyColors.primaryColor)
        root.style.setProperty("--color-primary", companyColors.primaryColor);
      if (companyColors.secondaryColor)
        root.style.setProperty(
          "--color-secondary",
          companyColors.secondaryColor
        );
      if (companyColors.tertiaryColor)
        root.style.setProperty("--color-tertiary", companyColors.tertiaryColor);
    } else {
      clearTheme();
    }

    return () => clearTheme();
  }, [userData]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logger.log("User signed out successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="px-4 py-5 border-b border-gray-700/50 flex flex-col items-center">
        <div className="h-16 w-auto mb-3 flex items-center justify-center">
          {userData?.company?.logoUrl ? (
            <img
              src={userData.company.logoUrl}
              alt={`Logo de ${userData.company.nombre}`}
              className="max-h-16 max-w-full object-contain"
            />
          ) : (
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Fideliz
            </h1>
          )}
        </div>
        {userData?.company?.motto && (
          <p className="text-xs text-center text-gray-300 mb-4 px-2">
            "{userData.company.motto}"
          </p>
        )}
        {userData && (
          <div className="text-center w-full">
            <span className="block text-sm font-semibold text-white uppercase tracking-wider mb-1">
              {userData.role}
            </span>
            {(userData.role === "Admin" || userData.role === "Employee") && (
              <span
                className="block text-xs text-gray-300 mt-0.5 truncate"
                title={userData.company?.nombre}
              >
                <BuildingOffice2Icon className="inline-block h-3 w-3 mr-1 align-text-bottom text-gray-400" />
                {userData.company?.nombre || "Company"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto">
        {userData?.role === "Manager" &&
          managerNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.text}
            </NavItem>
          ))}
        {userData?.role === "Admin" &&
          adminNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.text}
            </NavItem>
          ))}
        {userData?.role === "Employee" &&
          employeeNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              onClick={() => setIsSidebarOpen(false)}
            >
              {item.text}
            </NavItem>
          ))}
      </nav>

      {/* Footer/Logout Section */}
      <div className="mt-auto p-4 border-t border-gray-700/50">
        {currentUser && (
          <div
            className="text-xs text-gray-400 mb-2 truncate"
            title={currentUser.email}
          >
            {currentUser.email}
          </div>
        )}
        <Button
          onClick={handleLogout}
          variant="secondary"
          size="sm"
          className="w-full justify-center !bg-gray-700 hover:!bg-gray-600 !text-gray-300 hover:!text-white"
        >
          <ArrowLeftEndOnRectangleIcon className="h-4 w-4 mr-1.5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans antialiased">
      {/* Static Sidebar for larger screens */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-brand-secondary text-gray-200 flex-shrink-0 shadow-lg">
        {sidebarContent}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-brand-secondary text-white shadow-md sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Fideliz
              </h1>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                type="button"
                className="ml-2 bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isSidebarOpen}
              >
                <span className="sr-only">Abrir menú principal</span>
                <Bars3Icon
                  className={`${isSidebarOpen ? "hidden" : "block"} h-6 w-6`}
                  aria-hidden="true"
                />
                <XMarkIcon
                  className={`${isSidebarOpen ? "block" : "hidden"} h-6 w-6`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar (Slide-over) */}
        <div
          className={`fixed inset-0 flex z-40 md:hidden ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transform transition-transform duration-300 ease-in-out`}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-brand-secondary text-gray-200 shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="sr-only">Cerrar barra lateral</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            {sidebarContent}
          </div>
          <div
            className="flex-shrink-0 w-14"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8 border-t-4 border-brand-tertiary">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

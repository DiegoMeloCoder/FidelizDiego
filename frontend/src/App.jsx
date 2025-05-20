import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx"; // Updated extension
import "./App.css";

// Import Layouts
import AppLayout from "./components/layouts/AppLayout"; // Import AppLayout

// Import Components
import ProtectedRoute from "./components/ProtectedRoute";

// Import Pages
import LoginPage from "./pages/LoginPage";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManageCompanies from "./pages/manager/ManageCompanies";
import ManageAdmins from "./pages/manager/ManageAdmins";
import GlobalRedemptionHistory from "./pages/manager/history/GlobalRedemptionHistory"; // Import Manager History page
import ManageAnomalies from "./pages/manager/ManageAnomalies"; // Import Anomaly Management page
import ManageRewardRequests from "./pages/manager/ManageRewardRequests"; // Import Reward Requests page
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageEmployees from "./pages/admin/ManageEmployees";
import ManageRewards from "./pages/admin/ManageRewards";
import ManageJustifications from "./pages/admin/ManageJustifications";
import PointsHistoryAdmin from "./pages/admin/history/PointsHistoryAdmin";
import RedemptionHistoryAdmin from "./pages/admin/history/RedemptionHistoryAdmin"; // Importar historial de canjes Admin
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import AvailableRewards from "./pages/employee/AvailableRewards";
import HistoryEmployee from "./pages/employee/history/HistoryEmployee";
import ProfilePage from "./pages/employee/ProfilePage"; // Import Profile Page
import RankingPage from "./pages/shared/RankingPage"; // Import Ranking Page
import HomePage from "./pages/HomePage"; // Import the new HomePage
import ScheduleMeetingPage from "./pages/landing/ScheduleMeetingPage"; // Import ScheduleMeetingPage
import ViewDemoPage from "./pages/landing/ViewDemoPage"; // Import ViewDemoPage
import TermsAndConditionsPage from "./pages/legal/TermsAndConditionsPage"; // Import TermsAndConditionsPage
import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage"; // Import PrivacyPolicyPage
import PageNotFound from "./pages/PageNotFound"; // Import the Page Not Found

function App() {
  const { currentUser, userData, loading } = useAuth();

  const RootRedirect = () => {
    // Wait until loading is false AND we have a currentUser
    if (loading || !currentUser) {
      // If not logged in after loading, redirect to login
      if (!loading && !currentUser) {
        return <Navigate to="/login" replace />;
      }
      // Otherwise, show loading indicator while waiting for user/userData
      return (
        <div className="flex justify-center items-center h-screen">
          Loading User Data...
        </div>
      );
    }

    // At this point, loading is false and currentUser exists.
    // Now, check if userData is available before checking the role.
    if (!userData) {
      // This state might occur briefly if Firestore fetch is slow, or if the user doc doesn't exist.
      console.warn(
        "RootRedirect: currentUser exists, but userData is not yet available or missing."
      );
      // Optionally show a different loading/error state or redirect to login as a fallback
      return (
        <div className="flex justify-center items-center h-screen">
          Verifying Role...
        </div>
      ); // Or redirect to login
    }

    // Now we have currentUser and userData, proceed with role check
    console.log("RootRedirect: Redirecting based on role:", userData.role); // Add log
    switch (
      userData.role // Use userData.role directly as we've confirmed userData exists
    ) {
      case "Manager":
        return <Navigate to="/manager" replace />;
      case "Admin":
        return <Navigate to="/admin" replace />;
      case "Employee":
        return <Navigate to="/employee" replace />;
      default:
        console.warn("Unknown user role:", userData?.role);
        return <Navigate to="/login" replace />; // Fallback
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes with AppLayout */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["Manager"]}>
              <AppLayout /> {/* Render AppLayout for this route branch */}
            </ProtectedRoute>
          }
        >
          {/* Nested routes render inside AppLayout's <Outlet /> */}
          <Route index element={<ManagerDashboard />} />
          <Route path="companies" element={<ManageCompanies />} />
          <Route path="admins" element={<ManageAdmins />} />
          {/* Add route for Manager's global redemption history */}
          <Route
            path="history/global-redemptions"
            element={<GlobalRedemptionHistory />}
          />
          {/* Add route for Manager to access Reward Management (Global Rewards) */}
          {/* Note: Points to the same component as admin, but protected for Manager */}
          <Route path="rewards" element={<ManageRewards />} />
          {/* Add route for Manager Anomaly Management */}
          <Route path="anomalies" element={<ManageAnomalies />} />
          {/* Add route for Manager Reward Request Management */}
          <Route path="reward-requests" element={<ManageRewardRequests />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<ManageEmployees />} />
          {/* Keep original /admin/rewards route protected only for Admin */}
          <Route path="rewards" element={<ManageRewards />} />
          <Route path="justifications" element={<ManageJustifications />} />
          <Route path="history/points" element={<PointsHistoryAdmin />} />
          <Route
            path="history/redemptions"
            element={<RedemptionHistoryAdmin />}
          />{" "}
          {/* Añadir ruta historial canjes Admin */}
          <Route path="ranking" element={<RankingPage />} />
        </Route>

        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeDashboard />} />
          <Route path="rewards" element={<AvailableRewards />} />
          <Route path="history" element={<HistoryEmployee />} />
          <Route path="profile" element={<ProfilePage />} />{" "}
          {/* Add Profile Route */}
          <Route path="ranking" element={<RankingPage />} />{" "}
          {/* Add Ranking Route */}
          {/* Add more employee routes here */}
        </Route>

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/agendar-reunion" element={<ScheduleMeetingPage />} />
        <Route path="/demo" element={<ViewDemoPage />} />
        <Route
          path="/terminos-y-condiciones"
          element={<TermsAndConditionsPage />}
        />
        <Route path="/politica-de-privacidad" element={<PrivacyPolicyPage />} />

        {/* Intermediate route to handle redirection after login */}
        <Route path="/post-login-redirect" element={<RootRedirect />} />

        {/* Protected Routes with AppLayout */}
        {/* ... (Keep existing protected routes for /manager, /admin, /employee) ... */}

        {/* Optional: Catch-all 404 Route */}
        {/* Consider placing 404 inside AppLayout for logged-in users */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

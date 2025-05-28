import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import "./App.css";

// Import logger
import logger from "./utils/logger.js";

// Import Layouts
import AppLayout from "./components/layouts/AppLayout";

// Import Components
import ProtectedRoute from "./components/ProtectedRoute";

// Import Pages
import LoginPage from "./pages/LoginPage";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManageCompanies from "./pages/manager/ManageCompanies";
import ManageAdmins from "./pages/manager/ManageAdmins";
import GlobalRedemptionHistory from "./pages/manager/history/GlobalRedemptionHistory";
import ManageAnomalies from "./pages/manager/ManageAnomalies";
import ManageRewardRequests from "./pages/manager/ManageRewardRequests";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageEmployees from "./pages/admin/ManageEmployees";
import ManageRewards from "./pages/admin/ManageRewards";
import ManageJustifications from "./pages/admin/ManageJustifications";
import PointsHistoryAdmin from "./pages/admin/history/PointsHistoryAdmin";
import RedemptionHistoryAdmin from "./pages/admin/history/RedemptionHistoryAdmin";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import AvailableRewards from "./pages/employee/AvailableRewards";
import HistoryEmployee from "./pages/employee/history/HistoryEmployee";
import ProfilePage from "./pages/employee/ProfilePage";
import RankingPage from "./pages/shared/RankingPage";
import HomePage from "./pages/HomePage";
import ScheduleMeetingPage from "./pages/landing/ScheduleMeetingPage";
import ViewDemoPage from "./pages/landing/ViewDemoPage";
import TermsAndConditionsPage from "./pages/legal/TermsAndConditionsPage";
import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import PageNotFound from "./pages/PageNotFound";

// --- Componente de Redirección (Definido Fuera de App) ---
// Este componente decide a dónde enviar al usuario una vez que está logueado.
function RootRedirect() {
  const { currentUser, userData, loading } = useAuth();

  // 1. Mientras se carga el estado de AuthContext, mostramos un loader.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando sesión...
      </div>
    );
  }

  // 2. Si, tras cargar, NO hay usuario de Firebase (currentUser) O NO hay perfil de nuestro backend (userData),
  // la sesión no es válida. Lo enviamos al login.
  // Con el ajuste que hicimos al AuthContext, esta es ahora la comprobación más importante.
  if (!currentUser || !userData) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si llegamos aquí, tenemos toda la información necesaria. Redirigimos según el rol.
  logger.log("RootRedirect: Redirigiendo basado en el rol:", userData.role);
  switch (userData.role) {
    case "Manager":
      return <Navigate to="/manager" replace />;
    case "Admin":
      return <Navigate to="/admin" replace />;
    case "Employee":
      return <Navigate to="/employee" replace />;
    default:
      // Si el rol es desconocido, lo enviamos al login como medida de seguridad.
      console.warn("Rol de usuario desconocido:", userData.role);
      return <Navigate to="/login" replace />;
  }
}

// --- Componente Principal de la Aplicación ---
function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/agendar-reunion" element={<ScheduleMeetingPage />} />
        <Route path="/demo" element={<ViewDemoPage />} />
        <Route
          path="/terminos-y-condiciones"
          element={<TermsAndConditionsPage />}
        />
        <Route path="/politica-de-privacidad" element={<PrivacyPolicyPage />} />

        {/* Ruta Intermedia para Redirección */}
        <Route path="/post-login-redirect" element={<RootRedirect />} />

        {/* Protected Routes with AppLayout */}
        {/* Rutas Protegidas de Manager */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["Manager"]}>
              <AppLayout /> {/* Render AppLayout for this route branch */}
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerDashboard />} />
          <Route path="companies" element={<ManageCompanies />} />
          <Route path="admins" element={<ManageAdmins />} />
          <Route
            path="history/global-redemptions"
            element={<GlobalRedemptionHistory />}
          />
          <Route path="rewards" element={<ManageRewards />} />
          <Route path="anomalies" element={<ManageAnomalies />} />
          <Route path="reward-requests" element={<ManageRewardRequests />} />
        </Route>

        {/* Rutas Protegidas de Admin */}
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
          <Route path="rewards" element={<ManageRewards />} />
          <Route path="justifications" element={<ManageJustifications />} />
          <Route path="history/points" element={<PointsHistoryAdmin />} />
          <Route
            path="history/redemptions"
            element={<RedemptionHistoryAdmin />}
          />
          <Route path="ranking" element={<RankingPage />} />
        </Route>

        {/* Rutas Protegidas de Employee */}
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
          <Route path="profile" element={<ProfilePage />} />
          <Route path="ranking" element={<RankingPage />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

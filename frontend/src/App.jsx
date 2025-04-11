import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx'; // Updated extension
import './App.css';

// Import Layouts
import AppLayout from './components/layouts/AppLayout'; // Import AppLayout

// Import Components
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManageCompanies from './pages/manager/ManageCompanies'; // Import ManageCompanies
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageEmployees from './pages/admin/ManageEmployees';
import ManageRewards from './pages/admin/ManageRewards';
import PointsHistoryAdmin from './pages/admin/history/PointsHistoryAdmin';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import AvailableRewards from './pages/employee/AvailableRewards';
import HistoryEmployee from './pages/employee/history/HistoryEmployee'; // Import Employee History

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
      return <div className="flex justify-center items-center h-screen">Loading User Data...</div>;
    }

    // At this point, loading is false and currentUser exists.
    // Now, check if userData is available before checking the role.
    if (!userData) {
        // This state might occur briefly if Firestore fetch is slow, or if the user doc doesn't exist.
        console.warn("RootRedirect: currentUser exists, but userData is not yet available or missing.");
        // Optionally show a different loading/error state or redirect to login as a fallback
        return <div className="flex justify-center items-center h-screen">Verifying Role...</div>; // Or redirect to login
    }

    // Now we have currentUser and userData, proceed with role check
    console.log("RootRedirect: Redirecting based on role:", userData.role); // Add log
    switch (userData.role) { // Use userData.role directly as we've confirmed userData exists
      case 'Manager':
        return <Navigate to="/manager" replace />;
      case 'Admin':
        return <Navigate to="/admin" replace />;
      case 'Employee':
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
            <ProtectedRoute allowedRoles={['Manager']}>
              <AppLayout /> {/* Render AppLayout for this route branch */}
            </ProtectedRoute>
          }
        >
          {/* Nested routes render inside AppLayout's <Outlet /> */}
          <Route index element={<ManagerDashboard />} /> {/* Default page for /manager */}
          <Route path="companies" element={<ManageCompanies />} />
          {/* Add more manager routes here */}
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<ManageEmployees />} />
          <Route path="rewards" element={<ManageRewards />} />
          <Route path="history/points" element={<PointsHistoryAdmin />} /> {/* Add History Route */}
          {/* Add more admin routes here */}
        </Route>

        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={['Employee']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeDashboard />} />
          <Route path="rewards" element={<AvailableRewards />} />
          <Route path="history" element={<HistoryEmployee />} /> {/* Add History Route */}
          {/* Add more employee routes here */}
        </Route>

        {/* Root Route Redirect Logic */}
        <Route path="/" element={<RootRedirect />} />

        {/* Optional: Catch-all 404 Route */}
        {/* Consider placing 404 inside AppLayout for logged-in users */}
        <Route path="*" element={<div>404 Not Found</div>} />

      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx'; // Updated extension

// Props:
// - allowedRoles: Array of roles allowed to access the route (e.g., ['Admin', 'Manager'])
//                 If not provided, only checks for authentication.
// - children: Alternative way to pass the component to render (if not using <Outlet />)
function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    // Optional: Show a loading spinner or skeleton screen while auth state is loading
    return <div>Loading...</div>;
  }

  // 1. Check if user is authenticated
  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
    // 'replace' prevents the login page from being added to history stack
  }

  // 2. Check if specific roles are required and if the user has one of them
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userData || !allowedRoles.includes(userData.role)) {
      // Logged in, but doesn't have the required role
      // Redirect to a generic dashboard or an 'unauthorized' page
      // For MVP, redirecting back to login might be simplest, or to a base route '/'
      console.warn(`User role '${userData?.role}' not in allowed roles: ${allowedRoles.join(', ')}`);
      // Decide where to redirect unauthorized users. Let's redirect to login for now.
      // In a real app, you might redirect to their specific dashboard or an unauthorized page.
      return <Navigate to="/login" replace />; // Or potentially navigate based on role later
    }
  }

  // If authenticated and (if roles specified) authorized, render the child route/component
  // Use <Outlet /> in your route definition or pass children directly
  return children ? children : <Outlet />;
}

export default ProtectedRoute;

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ adminOnly = false, roles = null }) => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const location = useLocation();

  // Show a loader while verifying authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If the route is admin-only and the user is not an admin
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/app" replace />;
  }

  // If allowed roles are specified, verify the user's role
  if (roles && Array.isArray(roles) && roles.length > 0) {
    if (!roles.includes(user?.role)) {
      // Redirect based on the user's role to their corresponding dashboard
      switch (user?.role) {
        case 'admin':
          return <Navigate to="/admin" replace />;
        case 'agency':
          return <Navigate to="/agency" replace />;
        case 'model':
          return <Navigate to="/model" replace />;
        default:
          return <Navigate to="/app" replace />;
      }
    }
  }
  
  // If the user is authenticated and has the necessary permissions
  return <Outlet />;
};

export default ProtectedRoute;

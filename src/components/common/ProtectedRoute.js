import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Protected route component that checks if user is authenticated and has the required role
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 * @param {string} redirectPath - Path to redirect to if not authenticated or authorized
 * @returns {JSX.Element} - Route component
 */
const ProtectedRoute = ({ 
  allowedRoles = [], 
  redirectPath = '/login',
  children 
}) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children or outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute; 
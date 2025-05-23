import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../../features/auth/authSlice';

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
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  // Verify authentication on mount and when auth state changes
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, isLoading, dispatch]);

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    // Save the attempted URL for redirect after login
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // If there are children, render them, otherwise render the Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute; 
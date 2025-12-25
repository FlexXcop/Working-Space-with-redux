import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ 
  isAuthenticated, 
  requiredRole, 
  userRole, 
  redirectPath = '/login' 
}) => {
  // cek if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // cek if role is required and user has the required role
  if (requiredRole && requiredRole !== userRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 
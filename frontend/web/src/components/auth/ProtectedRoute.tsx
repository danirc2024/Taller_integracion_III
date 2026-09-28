import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { isGuest } = useAuth();

  // If the user is a guest (not authenticated), redirect them to the login page
  if (isGuest) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the child routes
  return <Outlet />;
}

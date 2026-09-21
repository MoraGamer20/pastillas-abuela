import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  // Check for admin authentication flag in sessionStorage
  const adminAuth = sessionStorage.getItem('adminAuth') === 'true';

  // If admin flag not set, redirect to login page
  if (!adminAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  // Admin authenticated, render child routes
  return <Outlet />;
}

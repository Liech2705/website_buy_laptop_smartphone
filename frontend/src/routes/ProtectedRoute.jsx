import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check (case-insensitive)
  if (allowedRoles.length > 0) {
    const userRole = user?.role?.toLowerCase() ?? '';
    const hasRole  = allowedRoles.some(r => r.toLowerCase() === userRole);
    if (!hasRole) {
      return <Navigate to="/403" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;

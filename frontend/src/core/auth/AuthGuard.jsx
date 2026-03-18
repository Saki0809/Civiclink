import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function AuthGuard({ children, allowedRoles = [], allowedDomains = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ minHeight: '50vh' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role access if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check domain access if specified (citizens can access all domains)
  if (allowedDomains.length > 0 && user.role !== 'citizen') {
    if (!allowedDomains.includes(user.domain)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

export function GuestGuard({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ minHeight: '50vh' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on domain
    const from = location.state?.from?.pathname;
    if (from) {
      return <Navigate to={from} replace />;
    }

    // Default redirect based on user domain
    const dashboardMap = {
      healthcare: '/healthcare',
      municipal: '/municipal',
      education: '/education',
      civilian: '/dashboard',
    };

    const redirectPath = dashboardMap[user?.domain] || '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

export default AuthGuard;

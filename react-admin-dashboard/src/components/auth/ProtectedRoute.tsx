import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<'ADMIN' | 'FLEET_MANAGER' | 'CUSTOMER'>;
}

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Optionally enforces specific user roles
 * 
 * @param children - The component to render if authorized
 * @param requiredRoles - Array of roles allowed to access this route (optional)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if requiredRoles is specified
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role)) {
      // User authenticated but not authorized for this route
      // Redirect to appropriate dashboard based on role
      const roleRedirects: Record<string, string> = {
        ADMIN: '/dashboard',
        FLEET_MANAGER: '/company',
        CUSTOMER: '/customer',
      };
      const redirectPath = roleRedirects[user.role] || '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

/**
 * Hook to programmatically check if user has required roles
 */
export const useAuthorization = (requiredRoles: Array<'ADMIN' | 'FLEET_MANAGER' | 'CUSTOMER'>) => {
  const { user } = useAuth();
  return user ? requiredRoles.includes(user.role) : false;
};

/**
 * Component to conditionally render content based on user role
 */
interface RoleBasedViewProps {
  children: React.ReactNode;
  allowedRoles: Array<'ADMIN' | 'FLEET_MANAGER' | 'CUSTOMER'>;
  fallback?: React.ReactNode;
}

export const RoleBasedView: React.FC<RoleBasedViewProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const authorized = useAuthorization(allowedRoles);
  return <>{authorized ? children : fallback}</>;
};

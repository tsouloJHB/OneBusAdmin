import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuthState } from '../../hooks/useAuthState';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'FLEET_MANAGER' | 'CUSTOMER' | 'admin' | 'operator';
  requiredRoles?: ('ADMIN' | 'FLEET_MANAGER' | 'CUSTOMER' | 'admin' | 'operator')[];
  fallbackPath?: string;
}

/**
 * Protected Route Component
 * Checks authentication and optionally enforces role-based access control
 * Supports both new JWT roles (ADMIN, FLEET_MANAGER, CUSTOMER) and legacy roles (admin, operator)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
  fallbackPath = '/login',
}) => {
  const location = useLocation();
  const { isFullyAuthenticated, isAuthenticating, user } = useAuthState();

  // Show loading spinner while authentication is being checked
  if (isAuthenticating) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isFullyAuthenticated) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role-based access control
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
          padding: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access this page.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Required role: {requiredRole}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your role: {user?.role}
        </Typography>
      </Box>
    );
  }

  // Check multiple roles access control
  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user?.role as any)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
          padding: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have permission to access this page.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Required roles: {requiredRoles.join(', ')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your role: {user?.role}
        </Typography>
      </Box>
    );
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

// Higher-order component for protecting routes with specific roles
export const withRoleProtection = (
  Component: React.ComponentType<any>,
  requiredRole?: 'ADMIN' | 'FLEET_MANAGER' | 'CUSTOMER' | 'admin' | 'operator',
  requiredRoles?: ('ADMIN' | 'FLEET_MANAGER' | 'CUSTOMER' | 'admin' | 'operator')[]
) => {
  return (props: any) => (
    <ProtectedRoute requiredRole={requiredRole} requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific protected route components for common use cases
export const AdminProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['ADMIN', 'admin']}>
    {children}
  </ProtectedRoute>
);

export const CompanyAdminProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="FLEET_MANAGER">
    {children}
  </ProtectedRoute>
);

export const OperatorProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRoles={['ADMIN', 'FLEET_MANAGER', 'admin', 'operator']}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
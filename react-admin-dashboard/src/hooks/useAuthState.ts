import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAuthToken } from './useAuthToken';

/**
 * Custom hook for managing authentication state and side effects
 * Supports both JWT roles (ADMIN, FLEET_MANAGER, CUSTOMER) and legacy roles (admin, operator)
 */
export const useAuthState = () => {
  const auth = useAuth();
  const { isTokenExpired, getValidToken } = useAuthToken();

  // Auto-refresh token before it expires
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) return;

    const checkTokenExpiration = async () => {
      try {
        await getValidToken();
      } catch (error) {
        console.warn('Token refresh failed:', error);
      }
    };

    // Check token expiration every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [auth.isAuthenticated, auth.token, getValidToken]);

  // Handle authentication errors globally
  const handleAuthError = useCallback(async (error: any) => {
    if (error?.response?.status === 401 || error?.statusCode === 401) {
      // Token expired or invalid, try to refresh
      try {
        await auth.refreshToken();
      } catch (refreshError) {
        // Refresh failed, logout user
        await auth.logout();
      }
    }
  }, [auth]);

  // Check if user is fully authenticated (not just loading)
  const isFullyAuthenticated = auth.isAuthenticated && !auth.isLoading && auth.user;

  // Check if authentication is in progress
  const isAuthenticating = auth.isLoading;

  // Get user permissions/roles - JWT roles
  const userPermissions = {
    isAdmin: auth.user?.role === 'ADMIN',
    isFleetManager: auth.user?.role === 'FLEET_MANAGER',
    isCompanyAdmin: auth.user?.role === 'FLEET_MANAGER', // Backward compatibility
    isOperator: false,
    isCustomer: auth.user?.role === 'CUSTOMER',
    canManageRoutes: auth.user?.role === 'ADMIN' || auth.user?.role === 'FLEET_MANAGER',
    canManageBuses: auth.user?.role === 'ADMIN' || auth.user?.role === 'FLEET_MANAGER',
    canViewActiveBuses: auth.user?.role !== 'CUSTOMER',
    canManageUsers: auth.user?.role === 'ADMIN',
    canManageCompanyAdmins: auth.user?.role === 'ADMIN',
    canManageCompanies: auth.user?.role === 'ADMIN',
    canManageTrackers: auth.user?.role === 'ADMIN',
    canViewMetrics: auth.user?.role === 'ADMIN',
    canViewDocumentation: auth.user?.role === 'ADMIN',
  };

  return {
    ...auth,
    isFullyAuthenticated,
    isAuthenticating,
    userPermissions,
    handleAuthError,
  };
};
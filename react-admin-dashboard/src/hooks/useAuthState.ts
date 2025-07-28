import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAuthToken } from './useAuthToken';

/**
 * Custom hook for managing authentication state and side effects
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

  // Get user permissions/roles
  const userPermissions = {
    isAdmin: auth.user?.role === 'admin',
    isOperator: auth.user?.role === 'operator',
    canManageRoutes: auth.user?.role === 'admin',
    canManageBuses: auth.user?.role === 'admin',
    canViewActiveBuses: auth.user?.role === 'admin' || auth.user?.role === 'operator',
  };

  return {
    ...auth,
    isFullyAuthenticated,
    isAuthenticating,
    userPermissions,
    handleAuthError,
  };
};
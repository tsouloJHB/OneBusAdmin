import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for token management utilities
 */
export const useAuthToken = () => {
  const { token, refreshToken, logout } = useAuth();

  // Check if token is expired (basic check)
  const isTokenExpired = useCallback((tokenString?: string): boolean => {
    if (!tokenString && !token) return true;
    
    const tokenToCheck = tokenString || token;
    if (!tokenToCheck) return true;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp < currentTime;
    } catch (error) {
      // If we can't decode the token, consider it expired
      return true;
    }
  }, [token]);

  // Get token with automatic refresh if needed
  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (!token) return null;

    if (isTokenExpired(token)) {
      try {
        await refreshToken();
        return token; // The context will be updated with new token
      } catch (error) {
        // Refresh failed, logout user
        await logout();
        return null;
      }
    }

    return token;
  }, [token, isTokenExpired, refreshToken, logout]);

  // Check if user has specific role
  const hasRole = useCallback((requiredRole: string): boolean => {
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === requiredRole || payload.roles?.includes(requiredRole);
    } catch (error) {
      return false;
    }
  }, [token]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role;
      const userRoles = payload.roles || [];
      
      return roles.includes(userRole) || roles.some(role => userRoles.includes(role));
    } catch (error) {
      return false;
    }
  }, [token]);

  return {
    token,
    isTokenExpired,
    getValidToken,
    hasRole,
    hasAnyRole,
  };
};
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from '../../hooks/useAuthState';
import { routeRequiresAuth } from '../../config/routes';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * RouteGuard component that handles navigation guards and route-based authentication
 * Checks if the current route requires authentication and redirects if necessary
 */
const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthState();
  const location = useLocation();

  console.log('RouteGuard: Current path:', location.pathname);
  console.log('RouteGuard: isAuthenticated:', isAuthenticated);
  console.log('RouteGuard: isLoading:', isLoading);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('RouteGuard: Showing loading state');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // Check if current route requires authentication
  const requiresAuth = routeRequiresAuth(location.pathname);
  console.log('RouteGuard: Route requires auth:', requiresAuth);

  // If route requires auth but user is not authenticated, redirect to login
  if (requiresAuth && !isAuthenticated) {
    console.log('RouteGuard: Redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated && location.pathname === '/login') {
    console.log('RouteGuard: Redirecting authenticated user to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('RouteGuard: Allowing access to route');
  // Allow access to the route
  return <>{children}</>;
};

export default RouteGuard;
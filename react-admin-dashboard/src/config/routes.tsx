import React, { Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

// Direct imports to avoid chunk loading issues temporarily
import SimpleDashboard from '../components/pages/SimpleDashboard';
import RoutesPage from '../components/pages/RoutesPage';
import RouteMapPage from '../components/pages/RouteMapPage';
import BusesPage from '../components/pages/BusesPage';
import ActiveBusesPage from '../components/pages/ActiveBusesPage';
import NotFoundPage from '../components/pages/NotFoundPage';

// Simple prefetch function for basic routes
const prefetchRoute = (routePath: string) => {
  // Prefetching disabled for direct imports
  console.log('Prefetch requested for:', routePath);
};

// Loading component for lazy-loaded routes with improved UX
const RouteLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      gap: 2,
    }}
    role="status"
    aria-live="polite"
  >
    <CircularProgress size={32} thickness={4} />
    <Typography variant="body2" color="text.secondary">
      Loading...
    </Typography>
  </Box>
);

// Wrapper component for routes with suspense and error handling
const LazyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<RouteLoader />}>
      {children}
    </Suspense>
  );
};

// Route configuration with metadata
export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  title: string;
  requiresAuth: boolean;
  showInNavigation: boolean;
  icon?: string;
  order?: number;
}

// Basic route configurations with direct imports
export const protectedRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: <SimpleDashboard />,
    title: 'Dashboard',
    requiresAuth: true,
    showInNavigation: true,
    icon: 'dashboard',
    order: 1,
  },
  {
    path: '/routes',
    element: <RoutesPage />,
    title: 'Routes',
    requiresAuth: true,
    showInNavigation: true,
    icon: 'route',
    order: 2,
  },
  {
    path: '/buses',
    element: <BusesPage />,
    title: 'Buses',
    requiresAuth: true,
    showInNavigation: true,
    icon: 'directions_bus',
    order: 3,
  },
  {
    path: '/buses/company/:companyId',
    element: <BusesPage />,
    title: 'Company Management',
    requiresAuth: true,
    showInNavigation: false,
  },
  {
    path: '/active-buses',
    element: <ActiveBusesPage />,
    title: 'Active Buses',
    requiresAuth: true,
    showInNavigation: true,
    icon: 'gps_fixed',
    order: 4,
  },
  {
    path: '/routes/:id/map',
    element: <RouteMapPage />,
    title: 'Route Map',
    requiresAuth: true,
    showInNavigation: false,
  },
];

// Convert route configs to React Router route objects
export const createRouteObjects = (routes: RouteConfig[]): RouteObject[] => {
  return routes.map(route => ({
    path: route.path,
    element: route.element,
  }));
};

// 404 route configuration
export const notFoundRoute: RouteConfig = {
  path: '*',
  element: <NotFoundPage />,
  title: 'Not Found',
  requiresAuth: false,
  showInNavigation: false,
};

// Get navigation routes (routes that should appear in sidebar)
export const getNavigationRoutes = (): RouteConfig[] => {
  return protectedRoutes
    .filter(route => route.showInNavigation)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

// Prefetch adjacent routes for faster navigation
export const prefetchAdjacentRoutes = (currentPath: string): void => {
  const routes = getNavigationRoutes();
  const currentIndex = routes.findIndex(route => route.path === currentPath);
  
  if (currentIndex !== -1) {
    // Prefetch next route if exists
    if (currentIndex < routes.length - 1) {
      const nextRoute = routes[currentIndex + 1];
      prefetchRoute(nextRoute.path);
    }
    
    // Prefetch previous route if exists
    if (currentIndex > 0) {
      const prevRoute = routes[currentIndex - 1];
      prefetchRoute(prevRoute.path);
    }
  }
};

// Get route by path
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return [...protectedRoutes, notFoundRoute].find(route => route.path === path);
};

// Check if route requires authentication
export const routeRequiresAuth = (path: string): boolean => {
  const route = getRouteByPath(path);
  return route?.requiresAuth ?? true; // Default to requiring auth
};
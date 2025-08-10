import React, { Suspense, lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

// Simple lazy loading for basic pages
const DashboardPage = lazy(() => import(/* webpackChunkName: "dashboard" */ '../components/pages/DashboardPage'));
const RoutesPage = lazy(() => import(/* webpackChunkName: "routes" */ '../components/pages/RoutesPage'));
const RouteMapPage = lazy(() => import(/* webpackChunkName: "route-map" */ '../components/pages/RouteMapPage'));
const BusesPage = lazy(() => import(/* webpackChunkName: "buses" */ '../components/pages/BusesPage'));
const ActiveBusesPage = lazy(() => import(/* webpackChunkName: "active-buses" */ '../components/pages/ActiveBusesPage'));

const NotFoundPage = lazy(() => import(/* webpackChunkName: "not-found" */ '../components/pages/NotFoundPage'));

// Simple prefetch function for basic routes
const prefetchRoute = (routePath: string) => {
  switch (routePath) {
    case '/dashboard':
      import(/* webpackChunkName: "dashboard" */ '../components/pages/DashboardPage');
      break;
    case '/routes':
      import(/* webpackChunkName: "routes" */ '../components/pages/RoutesPage');
      break;
    case '/routes/:id/map':
      import(/* webpackChunkName: "route-map" */ '../components/pages/RouteMapPage');
      break;
    case '/buses':
      import(/* webpackChunkName: "buses" */ '../components/pages/BusesPage');
      break;
    case '/active-buses':
      import(/* webpackChunkName: "active-buses" */ '../components/pages/ActiveBusesPage');
      break;
    default:
      break;
  }
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

// Wrapper component for lazy-loaded routes with suspense and error handling
const LazyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    // Reset error state when component mounts
    setHasError(false);
  }, [children]);

  if (hasError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
          gap: 2,
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" color="error">
          Failed to load page
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          There was a problem loading this page.
        </Typography>
        <button
          onClick={() => setHasError(false)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </Box>
    );
  }

  return (
    <Suspense fallback={<RouteLoader />}>
      {/* Use try-catch for error handling */}
      <React.Fragment>
        {children}
      </React.Fragment>
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

// Basic route configurations (removed complex route map)
export const protectedRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: (
      <LazyRoute>
        <DashboardPage />
      </LazyRoute>
    ),
    title: 'Dashboard',
    requiresAuth: true,
    showInNavigation: true,
    icon: 'dashboard',
    order: 1,
  },
  {
    path: '/routes',
    element: (
      <LazyRoute>
        <RoutesPage />
      </LazyRoute>
    ),
    title: 'Routes',
    requiresAuth: true,
    showInNavigation: true,
    icon: 'route',
    order: 2,
  },
  {
    path: '/buses',
    element: (
      <LazyRoute>
        <BusesPage />
      </LazyRoute>
    ),
    title: 'Buses',
    requiresAuth: true,
    showInNavigation: true,
    icon: 'directions_bus',
    order: 3,
  },
  {
    path: '/active-buses',
    element: (
      <LazyRoute>
        <ActiveBusesPage />
      </LazyRoute>
    ),
    title: 'Active Buses',
    requiresAuth: true,
    showInNavigation: true,
    icon: 'gps_fixed',
    order: 4,
  },
  {
    path: '/routes/:id/map',
    element: (
      <LazyRoute>
        <RouteMapPage />
      </LazyRoute>
    ),
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
  element: (
    <LazyRoute>
      <NotFoundPage />
    </LazyRoute>
  ),
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
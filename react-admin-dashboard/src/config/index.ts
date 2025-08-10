// Application configuration
export const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || '/api',
  appName: process.env.REACT_APP_APP_NAME || 'Bus Admin Dashboard',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',

  
  // API endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
    },
    routes: '/routes',
    buses: '/buses',
    activeBuses: '/buses/active',
    dashboard: '/dashboard/stats',
    tracker: '/tracker',
  },
  
  // UI configuration
  ui: {
    itemsPerPage: 10,
    refreshInterval: 30000, // 30 seconds for active buses
    debounceDelay: 300,
  },
};

// Re-export route configurations
export * from './routes';
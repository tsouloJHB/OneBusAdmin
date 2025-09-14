import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, NotificationProvider } from './contexts';
import { AppLayout } from './components/layout';
import { LoginForm, ProtectedRoute, RouteGuard, NotificationContainer, ErrorBoundary } from './components/ui';
import { protectedRoutes, notFoundRoute, createRouteObjects } from './config/routes';
import './App.css';
import './styles/accessibility.css';

// Create Material-UI theme with accessibility enhancements
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      light: '#f06292',
      dark: '#c51162',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#ffffff',
    },
    // Enhanced contrast for accessibility
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // Improved font sizes for better readability
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none', // Better for accessibility
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#B7B7B7 #F1F1F1',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F1F1F1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#B7B7B7',
            borderRadius: '4px',
          },
          // Focus visible styles for better accessibility
          '& *:focus-visible': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
          },
        },
        // Skip link for screen readers
        '.skip-link': {
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: '#1976d2',
          color: 'white',
          padding: '8px',
          textDecoration: 'none',
          borderRadius: '4px',
          zIndex: 9999,
          '&:focus': {
            top: '6px',
          },
        },
      },
    },
    // Enhanced button accessibility
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: '44px', // Minimum touch target size
          '&:focus-visible': {
            outline: '2px solid currentColor',
            outlineOffset: '2px',
          },
        },
      },
    },
    // Enhanced form field accessibility
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: '44px', // Minimum touch target size
          },
        },
      },
    },

    // Enhanced dialog accessibility
    MuiDialog: {
      styleOverrides: {
        paper: {
          '&:focus': {
            outline: 'none', // Dialog already has proper focus management
          },
        },
      },
    },
  },
});

function App() {
  console.log('App: Component rendering...');
  return (
    <ErrorBoundary level="critical" showReload={true}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* Skip link for screen readers */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <NotificationProvider>
          <AuthProvider>
            <ErrorBoundary level="page" showReload={true}>
              <Router>
                <RouteGuard>
                  <Routes>
                    {/* Login Route */}
                    <Route 
                      path="/login" 
                      element={
                        <ErrorBoundary level="component">
                          <LoginForm />
                        </ErrorBoundary>
                      } 
                    />
                    
                    {/* Root redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Protected Routes with Layout */}
                    {createRouteObjects(protectedRoutes).map((route, index) => (
                      <Route
                        key={route.path || index}
                        path={route.path}
                        element={
                          <ProtectedRoute>
                            <ErrorBoundary level="page">
                              <AppLayout>
                                <ErrorBoundary level="component">
                                  {route.element}
                                </ErrorBoundary>
                              </AppLayout>
                            </ErrorBoundary>
                          </ProtectedRoute>
                        }
                      />
                    ))}
                    
                    {/* 404 Route - must be last */}
                    <Route
                      path={notFoundRoute.path}
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary level="page">
                            <AppLayout>
                              <ErrorBoundary level="component">
                                {notFoundRoute.element}
                              </ErrorBoundary>
                            </AppLayout>
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </RouteGuard>
              </Router>
            </ErrorBoundary>
          </AuthProvider>
          {/* Global notification container */}
          <NotificationContainer />
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider, NotificationProvider } from './contexts';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/layout';
import { ProtectedRoute, NotificationContainer, ErrorBoundary } from './components/ui';
import { protectedRoutes, notFoundRoute } from './config/routes';
import LoginPage from './components/pages/LoginPage';
import './App.css';
import './styles/accessibility.css';

function App() {
  console.log('App: Component rendering...');
  console.log('App: Starting ErrorBoundary render');

  try {
    console.log('App: About to return JSX');
    return (
      <ErrorBoundary level="critical" showReload={true}>
        <ThemeProvider>
          <CssBaseline />
          {/* Skip link for screen readers */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <NotificationProvider>
            <AuthProvider>
              <Router>
                <Routes>
                  {/* Login Route - No authentication required */}
                  <Route
                    path="/login"
                    element={<LoginPage />}
                  />

                  {/* Protected Routes with Layout */}
                  {protectedRoutes.map((route, index) => (
                    <Route
                      key={route.path || index}
                      path={route.path}
                      element={
                        <ProtectedRoute requiredRoles={route.allowedRoles as any}>
                          <AppLayout>
                            {route.element}
                          </AppLayout>
                        </ProtectedRoute>
                      }
                    />
                  ))}

                  {/* Root redirect - must come after other routes */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* 404 Route - must be last */}
                  <Route
                    path={notFoundRoute.path}
                    element={
                      <ProtectedRoute>
                        <AppLayout>
                          {notFoundRoute.element}
                        </AppLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Router>
              {/* Global notification container */}
              <NotificationContainer />
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('App: Error during render:', error);
    return <div style={{ color: 'red', padding: '20px' }}>Error: {String(error)}</div>;
  }
}

export default App;

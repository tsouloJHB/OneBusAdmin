import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider, NotificationProvider } from './contexts';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/layout';
import { LoginForm, ProtectedRoute, RouteGuard, NotificationContainer, ErrorBoundary } from './components/ui';
import { protectedRoutes, notFoundRoute, createRouteObjects } from './config/routes';
import './App.css';
import './styles/accessibility.css';

function App() {
  console.log('App: Component rendering...');
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

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RouteGuard from '../RouteGuard';
import { AuthProvider } from '../../../contexts/AuthContext';
import * as authHooks from '../../../hooks/useAuthState';
import * as routeConfig from '../../../config/routes';

// Mock the useAuthState hook
jest.mock('../../../hooks/useAuthState');
const mockUseAuthState = authHooks.useAuthState as jest.Mock;

// Mock the routeRequiresAuth function
jest.mock('../../../config/routes', () => ({
  routeRequiresAuth: jest.fn(),
}));
const mockRouteRequiresAuth = routeConfig.routeRequiresAuth as jest.Mock;

describe('RouteGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when authentication is loading', () => {
    mockUseAuthState.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to login when route requires auth and user is not authenticated', () => {
    mockUseAuthState.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    mockRouteRequiresAuth.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <RouteGuard>
                <div>Dashboard Content</div>
              </RouteGuard>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('redirects to dashboard when authenticated user tries to access login page', () => {
    mockUseAuthState.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <RouteGuard>
                <div>Login Page</div>
              </RouteGuard>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('allows access to protected route when user is authenticated', () => {
    mockUseAuthState.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    mockRouteRequiresAuth.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('allows access to public route when user is not authenticated', () => {
    mockUseAuthState.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    mockRouteRequiresAuth.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/public']}>
        <RouteGuard>
          <div>Public Content</div>
        </RouteGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('checks if the current route requires authentication', () => {
    mockUseAuthState.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    mockRouteRequiresAuth.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      </MemoryRouter>
    );

    expect(mockRouteRequiresAuth).toHaveBeenCalledWith('/dashboard');
  });
});
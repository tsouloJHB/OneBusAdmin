import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import * as authHooks from '../../../hooks/useAuthState';
import * as tokenHooks from '../../../hooks/useAuthToken';

// Mock the useAuthState hook
jest.mock('../../../hooks/useAuthState');
const mockUseAuthState = authHooks.useAuthState as jest.Mock;

// Mock the useAuthToken hook
jest.mock('../../../hooks/useAuthToken');
const mockUseAuthToken = tokenHooks.useAuthToken as jest.Mock;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner when authentication is in progress', () => {
    mockUseAuthState.mockReturnValue({
      isFullyAuthenticated: false,
      isAuthenticating: true,
      user: null,
      userPermissions: {},
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuthState.mockReturnValue({
      isFullyAuthenticated: false,
      isAuthenticating: false,
      user: null,
      userPermissions: {},
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    mockUseAuthState.mockReturnValue({
      isFullyAuthenticated: true,
      isAuthenticating: false,
      user: { role: 'ADMIN' },
      userPermissions: { isAdmin: true },
    });
    mockUseAuthToken.mockReturnValue({
      hasRole: () => true,
      hasAnyRole: () => true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows access denied when user does not have required role', () => {
    mockUseAuthState.mockReturnValue({
      isFullyAuthenticated: true,
      isAuthenticating: false,
      user: { role: 'CUSTOMER' },
      userPermissions: { isAdmin: false, isOperator: true },
    });
    mockUseAuthToken.mockReturnValue({
      hasRole: (role: string) => role === 'CUSTOMER',
      hasAnyRole: (roles: string[]) => roles.includes('CUSTOMER'),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="admin">
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Required role: admin')).toBeInTheDocument();
    expect(screen.getByText('Your role: operator')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('shows access denied when user does not have any required roles', () => {
    mockUseAuthState.mockReturnValue({
      isFullyAuthenticated: true,
      isAuthenticating: false,
      user: { role: 'CUSTOMER' },
      userPermissions: { isAdmin: false, isOperator: false },
    });
    mockUseAuthToken.mockReturnValue({
      hasRole: () => false,
      hasAnyRole: () => false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRoles={['ADMIN', 'COMPANY_ADMIN']}>
          <div>Staff Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Required roles: admin, operator')).toBeInTheDocument();
    expect(screen.getByText('Your role: guest')).toBeInTheDocument();
    expect(screen.queryByText('Staff Content')).not.toBeInTheDocument();
  });

  it('redirects to custom fallback path when specified', () => {
    mockUseAuthState.mockReturnValue({
      isFullyAuthenticated: false,
      isAuthenticating: false,
      user: null,
      userPermissions: {},
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute fallbackPath="/custom-login">
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/custom-login" element={<div>Custom Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Custom Login Page')).toBeInTheDocument();
  });

  describe('AdminProtectedRoute', () => {
    it('allows access for admin users', () => {
      mockUseAuthState.mockReturnValue({
        isFullyAuthenticated: true,
        isAuthenticating: false,
        user: { role: 'ADMIN' },
        userPermissions: { isAdmin: true },
      });
      mockUseAuthToken.mockReturnValue({
        hasRole: (role: string) => role === 'ADMIN',
        hasAnyRole: (roles: string[]) => roles.includes('ADMIN'),
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('denies access for non-admin users', () => {
      mockUseAuthState.mockReturnValue({
        isFullyAuthenticated: true,
        isAuthenticating: false,
        user: { role: 'CUSTOMER' },
        userPermissions: { isAdmin: false, isOperator: true },
      });
      mockUseAuthToken.mockReturnValue({
        hasRole: (role: string) => role === 'CUSTOMER',
        hasAnyRole: (roles: string[]) => roles.includes('CUSTOMER'),
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('OperatorProtectedRoute', () => {
    it('allows access for operators', () => {
      mockUseAuthState.mockReturnValue({
        isFullyAuthenticated: true,
        isAuthenticating: false,
        user: { role: 'COMPANY_ADMIN' },
        userPermissions: { isAdmin: false, isOperator: true },
      });
      mockUseAuthToken.mockReturnValue({
        hasRole: (role: string) => role === 'COMPANY_ADMIN',
        hasAnyRole: (roles: string[]) => roles.includes('COMPANY_ADMIN'),
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRoles={['COMPANY_ADMIN']}>
            <div>Operator Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Operator Content')).toBeInTheDocument();
    });

    it('allows access for admins (since they have higher privileges)', () => {
      mockUseAuthState.mockReturnValue({
        isFullyAuthenticated: true,
        isAuthenticating: false,
        user: { role: 'ADMIN' },
        userPermissions: { isAdmin: true, isOperator: false },
      });
      mockUseAuthToken.mockReturnValue({
        hasRole: (role: string) => role === 'ADMIN',
        hasAnyRole: (roles: string[]) => roles.includes('ADMIN'),
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRoles={['COMPANY_ADMIN', 'ADMIN']}>
            <div>Operator Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Operator Content')).toBeInTheDocument();
    });

    it('denies access for guests', () => {
      mockUseAuthState.mockReturnValue({
        isFullyAuthenticated: true,
        isAuthenticating: false,
        user: { role: 'CUSTOMER' },
        userPermissions: { isAdmin: false, isOperator: false },
      });
      mockUseAuthToken.mockReturnValue({
        hasRole: () => false,
        hasAnyRole: () => false,
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRoles={['COMPANY_ADMIN']}>
            <div>Operator Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });
});
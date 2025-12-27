import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService');
const mockAuthService = authService as jest.Mocked<typeof authService>;

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isLoading ? 'Loading' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-info">
        {user ? `${user.fullName} (${user.role})` : 'No user'}
      </div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should provide initial unauthenticated state', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.isAuthenticated.mockReturnValue(false);

    renderWithProvider(<TestComponent />);

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Loading');

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
  });

  it('should provide authenticated state when user is logged in', async () => {
    const mockUser = {
      id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const,
      isActive: true,
      lastLogin: new Date(),
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.isAuthenticated.mockReturnValue(true);

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('Test User (ADMIN)');
  });

  it('should handle login', async () => {
    const mockUser = {
      id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const,
      isActive: true,
      lastLogin: new Date(),
    };

    const mockLoginResponse = {
      user: mockUser,
      token: 'mock-token',
    };

    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.login.mockResolvedValue(mockLoginResponse);

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    // Mock authenticated state after login
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.isAuthenticated.mockReturnValue(true);

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        emailOrUsername: 'test@example.com',
        password: 'password',
      });
    });
  });

  it('should handle logout', async () => {
    const mockUser = {
      id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN' as const,
      isActive: true,
      lastLogin: new Date(),
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.logout.mockResolvedValue();

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Mock unauthenticated state after logout
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.isAuthenticated.mockReturnValue(false);

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('should handle authentication errors gracefully', async () => {
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('Network error'));
    mockAuthService.isAuthenticated.mockReturnValue(false);

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
  });

  it('should handle login errors', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalled();
    });

    // Should remain unauthenticated after failed login
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });
});
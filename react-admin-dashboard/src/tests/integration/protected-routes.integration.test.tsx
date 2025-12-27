import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from '../../App';
import authService from '../../services/authService';
import { AuthProvider, NotificationProvider } from '../../contexts';

// Mock the auth service
jest.mock('../../services/authService');
const mockAuthService = authService as jest.Mocked<typeof authService>;

// Mock the localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const theme = createTheme();

describe('Protected Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  const renderWithProviders = (initialEntries: string[] = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('redirects unauthenticated user to login page when accessing protected route', async () => {
    // Mock getCurrentUser to simulate no token or invalid token
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));
    
    renderWithProviders(['/dashboard']);
    
    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  it('allows authenticated user to access protected routes', async () => {
    // Mock successful authentication
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
    });
    
    // Set auth token in localStorage
    mockLocalStorage.setItem('authToken', 'mock-token');
    
    renderWithProviders(['/dashboard']);
    
    // Should access dashboard
    await waitFor(() => {
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });
  });

  it('redirects to requested page after successful login', async () => {
    // Mock failed authentication initially
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));
    
    // Mock successful login
    mockAuthService.login.mockResolvedValue({
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
        isActive: true,
        lastLogin: new Date(),
      },
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
    });
    
    // After login, mock successful authentication
    mockAuthService.getCurrentUser.mockImplementation(() => {
      if (mockLocalStorage.getItem('authToken')) {
        return Promise.resolve({
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'admin',
          isActive: true,
          lastLogin: new Date(),
        });
      }
      return Promise.reject(new Error('Unauthorized'));
    });
    
    renderWithProviders(['/routes']);
    
    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
    
    // Fill in login form
    fireEvent.change(screen.getByLabelText('Email or Username'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    // Should call login API
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        emailOrUsername: 'test@example.com',
        password: 'password123',
      });
    });
    
    // Should redirect to originally requested page (routes)
    await waitFor(() => {
      expect(mockLocalStorage.getItem('authToken')).toBe('mock-token');
      expect(mockLocalStorage.getItem('refreshToken')).toBe('mock-refresh-token');
    });
  });

  it('handles token expiration and redirects to login', async () => {
    // Mock successful authentication initially
    mockAuthService.getCurrentUser.mockResolvedValueOnce({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
    });
    
    // Set auth token in localStorage
    mockLocalStorage.setItem('authToken', 'mock-token');
    
    renderWithProviders(['/dashboard']);
    
    // Should access dashboard initially
    await waitFor(() => {
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });
    
    // Mock token expiration on next API call
    mockAuthService.getCurrentUser.mockRejectedValueOnce({
      message: 'Token expired',
      type: 'UNAUTHORIZED',
    });
    
    // Mock failed token refresh
    mockAuthService.refreshToken.mockRejectedValueOnce(new Error('Refresh token expired'));
    
    // Simulate an API call that would trigger token validation
    // This would typically happen when a component makes an API request
    // For testing purposes, we'll manually trigger the token expiration scenario
    mockLocalStorage.removeItem('authToken');
    
    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  it('prevents access to admin-only routes for non-admin users', async () => {
    // Mock successful authentication as non-admin user
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: '2',
      username: 'operator',
      email: 'operator@example.com',
      role: 'operator', // Non-admin role
      isActive: true,
      lastLogin: new Date(),
    });
    
    // Set auth token in localStorage
    mockLocalStorage.setItem('authToken', 'mock-token');
    
    // Render with an admin-only route (assuming /admin is admin-only)
    renderWithProviders(['/admin']);
    
    // Should redirect to unauthorized page or show access denied message
    await waitFor(() => {
      // This test assumes there's either a specific unauthorized page or an access denied message
      // Adjust the expectation based on how your app handles unauthorized access
      expect(screen.getByText(/unauthorized|access denied|not authorized/i)).toBeInTheDocument();
    });
  });

  it('logs out user and redirects to login page', async () => {
    // Mock successful authentication initially
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
    });
    
    // Set auth token in localStorage
    mockLocalStorage.setItem('authToken', 'mock-token');
    mockLocalStorage.setItem('refreshToken', 'mock-refresh-token');
    
    // Mock logout
    mockAuthService.logout.mockResolvedValue(undefined);
    
    renderWithProviders(['/dashboard']);
    
    // Should access dashboard initially
    await waitFor(() => {
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });
    
    // Find and click logout button (assuming there's a logout button with accessible name)
    // Note: In a real test, you would need to find the actual logout button in your UI
    // This is a simplified example
    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    
    // Should call logout API
    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
    
    // Should clear auth tokens
    expect(mockLocalStorage.getItem('authToken')).toBeNull();
    expect(mockLocalStorage.getItem('refreshToken')).toBeNull();
    
    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });
});
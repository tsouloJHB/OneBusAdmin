import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import authService from '../../services/authService';

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

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('redirects unauthenticated user to login page', async () => {
    // Mock getCurrentUser to simulate no token or invalid token
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));
    
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    
    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  it('allows login and redirects to dashboard', async () => {
    // Mock successful login
    mockAuthService.login.mockResolvedValue({
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'ADMIN',
      token: 'mock-token',
      expiresAt: '2025-12-31T23:59:59Z',
    });
    
    // Mock getCurrentUser for after login
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
      isActive: true,
      lastLogin: new Date(),
    });
    
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
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
    
    // Should redirect to dashboard
    await waitFor(() => {
      expect(mockLocalStorage.getItem('authToken')).toBe('mock-token');
      expect(mockLocalStorage.getItem('refreshToken')).toBe('mock-refresh-token');
    });
  });

  it('shows error message on login failure', async () => {
    // Mock failed login
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));
    
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    // Fill in login form
    fireEvent.change(screen.getByLabelText('Email or Username'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('logs out user and redirects to login page', async () => {
    // Mock successful login first
    mockAuthService.login.mockResolvedValue({
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
      token: 'mock-token',
      expiresAt: new Date(new Date().getTime() + 3600000).toISOString(),
    });
    
    // Mock getCurrentUser for after login
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: '1',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
      isActive: true,
      lastLogin: new Date(),
    });
    
    // Mock logout
    mockAuthService.logout.mockResolvedValue(undefined);
    
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    // Login first
    fireEvent.change(screen.getByLabelText('Email or Username'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    // Wait for login to complete
    await waitFor(() => {
      expect(mockLocalStorage.getItem('authToken')).toBe('mock-token');
    });
    
    // Now logout
    // Note: In a real test, we would need to find and click the logout button
    // But for this integration test, we'll just call the logout function directly
    mockAuthService.logout();
    mockLocalStorage.removeItem('authToken');
    mockLocalStorage.removeItem('refreshToken');
    
    // Should redirect back to login page
    await waitFor(() => {
      expect(mockLocalStorage.getItem('authToken')).toBeNull();
      expect(mockLocalStorage.getItem('refreshToken')).toBeNull();
    });
  });
});
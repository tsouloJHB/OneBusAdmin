import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppLayout } from '../AppLayout';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock the auth service
jest.mock('../../../services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn().mockResolvedValue({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
    }),
    logout: jest.fn().mockResolvedValue(undefined),
  },
}));

const theme = createTheme();

const renderAppLayout = (children = <div>Test Content</div>) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Mock window.matchMedia for responsive tests
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('AppLayout Component', () => {
  beforeEach(() => {
    // Reset to desktop view by default
    mockMatchMedia(false);
  });

  test('renders main application layout with header and sidebar', () => {
    renderAppLayout();
    
    // Check header elements
    expect(screen.getByText('Bus Admin Dashboard')).toBeInTheDocument();
    
    // Check sidebar navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Routes')).toBeInTheDocument();
    expect(screen.getByText('Buses')).toBeInTheDocument();
    expect(screen.getByText('Active Buses')).toBeInTheDocument();
    
    // Check main content area
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('displays user menu with username and logout option', async () => {
    renderAppLayout();
    
    // Wait for auth to load and find user menu button
    await waitFor(() => {
      expect(screen.getByText('Welcome, testuser')).toBeInTheDocument();
    });
    
    // Click on user avatar to open menu
    const userButton = screen.getByLabelText('account of current user');
    fireEvent.click(userButton);
    
    // Check menu items
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('handles mobile responsive layout', () => {
    // Mock mobile viewport
    mockMatchMedia(true);
    
    renderAppLayout();
    
    // Mobile menu button should be visible
    const mobileMenuButton = screen.getByLabelText('open drawer');
    expect(mobileMenuButton).toBeInTheDocument();
    
    // Click mobile menu button
    fireEvent.click(mobileMenuButton);
    
    // Navigation should still be accessible
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('adapts layout for different screen sizes', () => {
    // Test desktop layout
    mockMatchMedia(false);
    renderAppLayout();
    
    // Mobile menu button should not be visible on desktop
    expect(screen.queryByLabelText('open drawer')).not.toBeInTheDocument();
    
    // Re-render for mobile
    mockMatchMedia(true);
    renderAppLayout();
    
    // Mobile menu button should be visible
    expect(screen.getByLabelText('open drawer')).toBeInTheDocument();
  });

  test('provides proper responsive sidebar navigation', () => {
    renderAppLayout();
    
    // Check that sidebar contains all required navigation sections
    const navigationItems = [
      'Dashboard',
      'Routes', 
      'Buses',
      'Active Buses',
      'Settings'
    ];
    
    navigationItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test('renders children content in main area', () => {
    const testContent = <div data-testid="custom-content">Custom Page Content</div>;
    renderAppLayout(testContent);
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom Page Content')).toBeInTheDocument();
  });

  test('handles logout functionality', async () => {
    renderAppLayout();
    
    // Wait for auth to load
    await waitFor(() => {
      expect(screen.getByText('Welcome, testuser')).toBeInTheDocument();
    });
    
    // Open user menu
    const userButton = screen.getByLabelText('account of current user');
    fireEvent.click(userButton);
    
    // Click logout
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // Logout should be called (mocked)
    // In real implementation, this would redirect to login
  });

  test('maintains proper layout structure', () => {
    renderAppLayout();
    
    // Check that main content area has proper spacing for fixed header
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
    
    // Verify layout structure
    expect(screen.getByText('Bus Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
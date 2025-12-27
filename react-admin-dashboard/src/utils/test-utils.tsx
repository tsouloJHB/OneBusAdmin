import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import NotificationContext from '../contexts/NotificationContext';

// Mock auth context values
const mockAuthContextValue = {
  isAuthenticated: true,
  user: { id: '1', fullName: 'Test User', email: 'test@example.com', role: 'ADMIN' as const, isActive: true, lastLogin: new Date() },
  token: 'mock-token',
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
};

// Mock notification context values
const mockNotificationContextValue = {
  notifications: [],
  showNotification: jest.fn(),
  hideNotification: jest.fn(),
  clearAllNotifications: jest.fn(),
};

// All providers wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContextValue}>
        <NotificationContext.Provider value={mockNotificationContextValue}>
          {children}
        </NotificationContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Export mock context values for direct usage in tests
export { mockAuthContextValue, mockNotificationContextValue };
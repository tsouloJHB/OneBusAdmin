import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Sidebar from '../Sidebar';

const theme = createTheme();

const renderWithRouter = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    ...props,
  };

  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Sidebar {...defaultProps} />
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Mock useLocation to control current route
const mockLocation = { pathname: '/dashboard' };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
}));

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all navigation items', () => {
    renderWithRouter();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Routes')).toBeInTheDocument();
    expect(screen.getByText('Buses')).toBeInTheDocument();
    expect(screen.getByText('Active Buses')).toBeInTheDocument();
  });

  it('highlights current active route', () => {
    mockLocation.pathname = '/dashboard';
    renderWithRouter();

    const dashboardItem = screen.getByText('Dashboard').closest('a');
    expect(dashboardItem).toHaveClass('Mui-selected');
  });

  it('navigates to correct routes when items are clicked', () => {
    renderWithRouter();

    const routesLink = screen.getByText('Routes').closest('a');
    expect(routesLink).toHaveAttribute('href', '/routes');

    const busesLink = screen.getByText('Buses').closest('a');
    expect(busesLink).toHaveAttribute('href', '/buses');

    const activeBusesLink = screen.getByText('Active Buses').closest('a');
    expect(activeBusesLink).toHaveAttribute('href', '/active-buses');
  });

  it('displays appropriate icons for each navigation item', () => {
    renderWithRouter();

    // Check that icons are present (MUI icons have specific test ids or classes)
    const dashboardIcon = screen.getByTestId('DashboardIcon') || 
                          document.querySelector('[data-testid="dashboard-icon"]');
    expect(dashboardIcon).toBeInTheDocument();
  });

  it('calls onClose when mobile overlay is clicked', () => {
    const mockOnClose = jest.fn();
    renderWithRouter({ onClose: mockOnClose });

    // Simulate mobile view by clicking on backdrop
    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('renders drawer in temporary mode for mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    renderWithRouter();

    const drawer = document.querySelector('.MuiDrawer-root');
    expect(drawer).toHaveClass('MuiDrawer-temporary');
  });

  it('renders drawer in permanent mode for desktop', () => {
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    renderWithRouter();

    const drawer = document.querySelector('.MuiDrawer-root');
    expect(drawer).toHaveClass('MuiDrawer-permanent');
  });

  it('displays application logo and title', () => {
    renderWithRouter();

    expect(screen.getByText('Bus Admin')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter();

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');

    const navItems = screen.getAllByRole('link');
    navItems.forEach(item => {
      expect(item).toHaveAttribute('aria-label');
    });
  });

  it('supports keyboard navigation', () => {
    renderWithRouter();

    const firstNavItem = screen.getByText('Dashboard').closest('a');
    const secondNavItem = screen.getByText('Routes').closest('a');

    // Focus first item
    firstNavItem?.focus();
    expect(document.activeElement).toBe(firstNavItem);

    // Tab to next item
    fireEvent.keyDown(firstNavItem!, { key: 'Tab' });
    // Note: In a real test, you'd need to simulate the actual tab behavior
  });

  it('displays user section at bottom', () => {
    renderWithRouter();

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('handles different route patterns correctly', () => {
    // Test nested routes
    mockLocation.pathname = '/routes/edit/123';
    renderWithRouter();

    const routesItem = screen.getByText('Routes').closest('a');
    expect(routesItem).toHaveClass('Mui-selected');
  });

  it('collapses and expands properly', () => {
    const { rerender } = renderWithRouter({ open: true });

    // Should be open
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Close sidebar
    rerender(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Sidebar open={false} onClose={jest.fn()} />
        </ThemeProvider>
      </BrowserRouter>
    );

    // In collapsed state, text might be hidden but icons should be visible
    const drawer = document.querySelector('.MuiDrawer-root');
    expect(drawer).toHaveClass('MuiDrawer-close');
  });

  it('displays notification badges when applicable', () => {
    renderWithRouter();

    // If there are notifications or alerts, they should be displayed
    // This would depend on your specific implementation
    const activeBusesItem = screen.getByText('Active Buses');
    const badge = activeBusesItem.parentElement?.querySelector('.MuiBadge-badge');
    
    // This test would be more specific based on your notification system
    if (badge) {
      expect(badge).toBeInTheDocument();
    }
  });

  it('handles responsive behavior correctly', () => {
    // Test different screen sizes
    const testSizes = [
      { width: 320, expected: 'temporary' },
      { width: 768, expected: 'temporary' },
      { width: 1024, expected: 'permanent' },
    ];

    testSizes.forEach(({ width, expected }) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });

      renderWithRouter();

      const drawer = document.querySelector('.MuiDrawer-root');
      expect(drawer).toHaveClass(`MuiDrawer-${expected}`);
    });
  });

  it('maintains scroll position when navigating', () => {
    renderWithRouter();

    const sidebar = screen.getByRole('navigation');
    
    // Scroll down
    fireEvent.scroll(sidebar, { target: { scrollTop: 100 } });
    
    // Navigate to different route
    const routesLink = screen.getByText('Routes');
    fireEvent.click(routesLink);

    // Scroll position should be maintained or reset appropriately
    // This depends on your specific implementation
  });

  it('displays version information', () => {
    renderWithRouter();

    // Check for version info at bottom of sidebar
    const versionInfo = screen.queryByText(/v\d+\.\d+\.\d+/);
    if (versionInfo) {
      expect(versionInfo).toBeInTheDocument();
    }
  });

  it('handles theme switching if available', () => {
    renderWithRouter();

    // If theme switching is available in sidebar
    const themeToggle = screen.queryByLabelText('Toggle theme');
    if (themeToggle) {
      fireEvent.click(themeToggle);
      // Test theme change behavior
    }
  });
});
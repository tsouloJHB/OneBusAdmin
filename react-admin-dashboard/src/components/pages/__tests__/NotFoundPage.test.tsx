import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NotFoundPage from '../NotFoundPage';

const theme = createTheme();

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('NotFoundPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders 404 error message and description', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('The page you are looking for does not exist or has been moved.')).toBeInTheDocument();
  });

  it('displays navigation buttons', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByRole('button', { name: 'Go to Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
  });

  it('navigates to dashboard when dashboard button is clicked', () => {
    renderWithRouter(<NotFoundPage />);

    const dashboardButton = screen.getByRole('button', { name: 'Go to Dashboard' });
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates back when go back button is clicked', () => {
    renderWithRouter(<NotFoundPage />);

    const backButton = screen.getByRole('button', { name: 'Go Back' });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('displays helpful suggestions', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText('Here are some helpful links:')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Routes')).toBeInTheDocument();
    expect(screen.getByText('Buses')).toBeInTheDocument();
    expect(screen.getByText('Active Buses')).toBeInTheDocument();
  });

  it('has proper navigation links', () => {
    renderWithRouter(<NotFoundPage />);

    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');

    const routesLink = screen.getByRole('link', { name: 'Routes' });
    expect(routesLink).toHaveAttribute('href', '/routes');

    const busesLink = screen.getByRole('link', { name: 'Buses' });
    expect(busesLink).toHaveAttribute('href', '/buses');

    const activeBusesLink = screen.getByRole('link', { name: 'Active Buses' });
    expect(activeBusesLink).toHaveAttribute('href', '/active-buses');
  });

  it('has proper accessibility attributes', () => {
    renderWithRouter(<NotFoundPage />);

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', '404 error page');

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('404');

    const subheading = screen.getByRole('heading', { level: 2 });
    expect(subheading).toHaveTextContent('Page Not Found');
  });

  it('displays error illustration or icon', () => {
    renderWithRouter(<NotFoundPage />);

    // Check for error icon or illustration
    const errorIcon = screen.getByTestId('error-icon') || screen.getByLabelText('404 error');
    expect(errorIcon).toBeInTheDocument();
  });

  it('has responsive design elements', () => {
    renderWithRouter(<NotFoundPage />);

    const container = screen.getByRole('main');
    expect(container).toHaveClass('MuiContainer-root');

    // Check that content is centered
    const centerBox = container.querySelector('.MuiBox-root');
    expect(centerBox).toBeInTheDocument();
  });

  it('displays current URL information', () => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { pathname: '/non-existent-page' },
      writable: true,
    });

    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText(/non-existent-page/)).toBeInTheDocument();
  });

  it('provides search functionality', () => {
    renderWithRouter(<NotFoundPage />);

    const searchInput = screen.getByPlaceholderText('Search for a page...');
    expect(searchInput).toBeInTheDocument();

    const searchButton = screen.getByRole('button', { name: 'Search' });
    expect(searchButton).toBeInTheDocument();
  });

  it('handles search functionality', () => {
    renderWithRouter(<NotFoundPage />);

    const searchInput = screen.getByPlaceholderText('Search for a page...');
    fireEvent.change(searchInput, { target: { value: 'dashboard' } });

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    // Should navigate to search results or dashboard
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('displays recent pages if available', () => {
    // Mock localStorage with recent pages
    const mockRecentPages = [
      { path: '/dashboard', title: 'Dashboard' },
      { path: '/routes', title: 'Routes' },
    ];

    Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockRecentPages));

    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText('Recent Pages:')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Routes')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    renderWithRouter(<NotFoundPage />);

    const dashboardButton = screen.getByRole('button', { name: 'Go to Dashboard' });
    
    // Focus the button
    dashboardButton.focus();
    expect(document.activeElement).toBe(dashboardButton);

    // Press Enter
    fireEvent.keyDown(dashboardButton, { key: 'Enter', code: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('displays contact information for support', () => {
    renderWithRouter(<NotFoundPage />);

    expect(screen.getByText(/If you believe this is an error/)).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  it('has proper meta information for SEO', () => {
    renderWithRouter(<NotFoundPage />);

    // Check that the page has proper title structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('404');

    // Check for proper semantic structure
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });
});
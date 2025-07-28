import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DashboardPage from '../DashboardPage';
import { dashboardService } from '../../../services/dashboardService';

// Mock the dashboard service
jest.mock('../../../services/dashboardService');
const mockDashboardService = dashboardService as jest.Mocked<typeof dashboardService>;

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard title and welcome message', () => {
    mockDashboardService.getDashboardStats.mockResolvedValue({
      totalRoutes: 5,
      totalBuses: 10,
      activeBuses: 8,
      totalUsers: 3,
      recentActivity: []
    });

    renderWithTheme(<DashboardPage />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the Bus Admin Dashboard')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    mockDashboardService.getDashboardStats.mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<DashboardPage />);
    
    expect(screen.getByText('Total Routes')).toBeInTheDocument();
    expect(screen.getByText('Total Buses')).toBeInTheDocument();
    expect(screen.getByText('Active Buses')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('displays statistics when data is loaded', async () => {
    const mockStats = {
      totalRoutes: 5,
      totalBuses: 10,
      activeBuses: 8,
      totalUsers: 3,
      recentActivity: []
    };

    mockDashboardService.getDashboardStats.mockResolvedValue(mockStats);

    renderWithTheme(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('displays error message when API call fails', async () => {
    mockDashboardService.getDashboardStats.mockRejectedValue(new Error('API Error'));

    renderWithTheme(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('displays recent activity when available', async () => {
    const mockStats = {
      totalRoutes: 5,
      totalBuses: 10,
      activeBuses: 8,
      totalUsers: 3,
      recentActivity: [
        {
          id: '1',
          type: 'route_created' as const,
          description: 'New route created',
          timestamp: new Date('2024-01-01'),
          userId: 'user1',
          userName: 'John Doe'
        }
      ]
    };

    mockDashboardService.getDashboardStats.mockResolvedValue(mockStats);

    renderWithTheme(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('New route created')).toBeInTheDocument();
      expect(screen.getByText('by John Doe')).toBeInTheDocument();
    });
  });
});
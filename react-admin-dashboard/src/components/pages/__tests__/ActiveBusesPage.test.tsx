import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ActiveBusesPage from '../ActiveBusesPage';
import { activeBusService } from '../../../services/activeBusService';
import { routeService } from '../../../services/routeService';
import { ActiveBus } from '../../../types';

// Mock the services
jest.mock('../../../services/activeBusService');
jest.mock('../../../services/routeService');

const mockActiveBusService = activeBusService as jest.Mocked<typeof activeBusService>;
const mockRouteService = routeService as jest.Mocked<typeof routeService>;

const theme = createTheme();

const mockActiveBuses: ActiveBus[] = [
  {
    id: '1',
    bus: {
      id: 'bus1',
      busNumber: 'BUS001',
      capacity: 50,
      model: 'Mercedes Citaro',
      year: 2020,
      status: 'active',
      assignedRouteId: 'route1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    route: {
      id: 'route1',
      name: 'Downtown Express',
      startPoint: 'Central Station',
      endPoint: 'Airport',
      stops: [
        {
          id: 'stop1',
          name: 'Main Street',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          order: 1,
        },
      ],
      schedule: [],
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    currentLocation: { lat: 40.7128, lng: -74.0060 },
    nextStop: {
      id: 'stop1',
      name: 'Main Street',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      order: 1,
    },
    estimatedArrival: new Date('2024-01-01T10:30:00'),
    passengerCount: 25,
    status: 'on_route',
    lastUpdated: new Date('2024-01-01T10:00:00'),
  },
  {
    id: '2',
    bus: {
      id: 'bus2',
      busNumber: 'BUS002',
      capacity: 40,
      model: 'Volvo 7900',
      year: 2019,
      status: 'active',
      assignedRouteId: 'route2',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
    route: {
      id: 'route2',
      name: 'University Line',
      startPoint: 'Campus',
      endPoint: 'City Center',
      stops: [],
      schedule: [],
      isActive: true,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
    currentLocation: { lat: 40.7589, lng: -73.9851 },
    nextStop: {
      id: 'stop2',
      name: 'University Gate',
      coordinates: { lat: 40.7589, lng: -73.9851 },
      order: 1,
    },
    estimatedArrival: new Date('2024-01-01T10:45:00'),
    passengerCount: 15,
    status: 'at_stop',
    lastUpdated: new Date('2024-01-01T10:15:00'),
  },
];

const mockRoutes = [
  { id: 'route1', name: 'Downtown Express' },
  { id: 'route2', name: 'University Line' },
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ActiveBusesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockActiveBusService.getActiveBuses.mockResolvedValue(mockActiveBuses);
    mockRouteService.getRoutesForSelect.mockResolvedValue(mockRoutes);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders page title and active buses list', async () => {
    renderWithTheme(<ActiveBusesPage />);

    expect(screen.getByText('Active Buses')).toBeInTheDocument();
    expect(screen.getByText('Monitor real-time bus locations and status')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('BUS001')).toBeInTheDocument();
      expect(screen.getByText('BUS002')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    mockActiveBusService.getActiveBuses.mockImplementation(() => new Promise(() => {}));
    
    renderWithTheme(<ActiveBusesPage />);

    expect(screen.getByText('Loading active buses...')).toBeInTheDocument();
  });

  it('displays error state when API call fails', async () => {
    mockActiveBusService.getActiveBuses.mockRejectedValue(new Error('Failed to load active buses'));

    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load active buses')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('displays empty state when no active buses found', async () => {
    mockActiveBusService.getActiveBuses.mockResolvedValue([]);

    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(screen.getByText('No active buses found')).toBeInTheDocument();
      expect(screen.getByText('There are currently no buses in operation.')).toBeInTheDocument();
    });
  });

  it('shows bus status indicators correctly', async () => {
    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(screen.getByText('On Route')).toBeInTheDocument();
      expect(screen.getByText('At Stop')).toBeInTheDocument();
    });
  });

  it('displays passenger count and capacity', async () => {
    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(screen.getByText('25/50 passengers')).toBeInTheDocument();
      expect(screen.getByText('15/40 passengers')).toBeInTheDocument();
    });
  });

  it('shows estimated arrival times', async () => {
    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(screen.getByText(/10:30 AM/)).toBeInTheDocument();
      expect(screen.getByText(/10:45 AM/)).toBeInTheDocument();
    });
  });

  it('displays next stop information', async () => {
    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(screen.getByText('Next: Main Street')).toBeInTheDocument();
      expect(screen.getByText('Next: University Gate')).toBeInTheDocument();
    });
  });

  it('auto-refreshes data every 30 seconds', async () => {
    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(2);
    });
  });

  it('allows manual refresh', async () => {
    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(1);
    });

    const refreshButton = screen.getByLabelText('Refresh data');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(2);
    });
  });

  it('filters buses by route', async () => {
    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(screen.getByText('BUS001')).toBeInTheDocument();
      expect(screen.getByText('BUS002')).toBeInTheDocument();
    });

    // Open route filter
    const routeFilter = screen.getByLabelText('Filter by route');
    fireEvent.mouseDown(routeFilter);

    // Select Downtown Express
    const downtownOption = screen.getByText('Downtown Express');
    fireEvent.click(downtownOption);

    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledWith({
        routeId: 'route1',
      });
    });
  });

  it('filters buses by status', async () => {
    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(screen.getByText('BUS001')).toBeInTheDocument();
      expect(screen.getByText('BUS002')).toBeInTheDocument();
    });

    // Open status filter
    const statusFilter = screen.getByLabelText('Filter by status');
    fireEvent.mouseDown(statusFilter);

    // Select "On Route"
    const onRouteOption = screen.getByText('On Route');
    fireEvent.click(onRouteOption);

    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledWith({
        status: 'on_route',
      });
    });
  });

  it('searches buses by bus number', async () => {
    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(screen.getByText('BUS001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by bus number...');
    fireEvent.change(searchInput, { target: { value: 'BUS001' } });

    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledWith({
        search: 'BUS001',
      });
    });
  });

  it('clears all filters', async () => {
    renderWithTheme(<ActiveBusesPage />);

    // Apply some filters first
    const routeFilter = screen.getByLabelText('Filter by route');
    fireEvent.mouseDown(routeFilter);
    fireEvent.click(screen.getByText('Downtown Express'));

    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledWith({
        routeId: 'route1',
      });
    });

    // Clear filters
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledWith({});
    });
  });

  it('handles retry after error', async () => {
    mockActiveBusService.getActiveBuses.mockRejectedValueOnce(new Error('Network error'));

    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Mock successful retry
    mockActiveBusService.getActiveBuses.mockResolvedValue(mockActiveBuses);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('BUS001')).toBeInTheDocument();
    });
  });

  it('shows last updated timestamp', async () => {
    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });

  it('displays responsive layout on mobile', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(screen.getByText('BUS001')).toBeInTheDocument();
    });

    // Check that mobile-specific layout is applied
    const busCards = screen.getAllByRole('article');
    expect(busCards.length).toBeGreaterThan(0);
  });

  it('has proper accessibility attributes', async () => {
    renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Active buses page');

      const refreshButton = screen.getByLabelText('Refresh data');
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh data');

      const searchInput = screen.getByPlaceholderText('Search by bus number...');
      expect(searchInput).toHaveAttribute('aria-label', 'Search buses');
    });
  });

  it('stops auto-refresh when component unmounts', async () => {
    const { unmount } = renderWithTheme(<ActiveBusesPage />);

    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Fast-forward time after unmount
    jest.advanceTimersByTime(30000);

    // Should not call the service again
    expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(1);
  });
});
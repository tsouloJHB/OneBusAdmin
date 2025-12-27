import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider, NotificationProvider } from '../../contexts';
import { ActiveBusesPage } from '../../components/pages';
import activeBusService from '../../services/activeBusService';
import routeService from '../../services/routeService';

// Mock the services
jest.mock('../../services/activeBusService');
jest.mock('../../services/routeService');
const mockActiveBusService = activeBusService as jest.Mocked<typeof activeBusService>;
const mockRouteService = routeService as jest.Mocked<typeof routeService>;

// Mock auth context
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => ({
    isAuthenticated: true,
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
    },
    token: 'mock-token',
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  }),
}));

// Mock setInterval and clearInterval
jest.useFakeTimers();

const theme = createTheme();

// Sample data
const mockActiveBuses = [
  {
    id: 'active1',
    bus: {
      id: 'bus1',
      busNumber: 'B001',
      capacity: 40,
      model: 'Mercedes Sprinter',
      year: 2022,
      status: 'active' as const,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    route: {
      id: 1,
      name: 'Downtown Express',
      startPoint: 'Central Station',
      endPoint: 'Business District',
      stops: [],
      schedule: [],
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    currentLocation: {
      lat: 40.7128,
      lng: -74.006,
    },
    nextStop: {
      id: 'stop1',
      name: 'City Hall',
      coordinates: { lat: 40.7138, lng: -74.0059 },
      order: 2,
    },
    estimatedArrival: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    passengerCount: 25,
    status: 'on_route' as const,
    lastUpdated: new Date(),
  },
  {
    id: 'active2',
    bus: {
      id: 'bus2',
      busNumber: 'B002',
      capacity: 30,
      model: 'Ford Transit',
      year: 2021,
      status: 'active' as const,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
    route: {
      id: 2,
      name: 'Airport Shuttle',
      startPoint: 'Central Station',
      endPoint: 'International Airport',
      stops: [],
      schedule: [],
      isActive: true,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
    currentLocation: {
      lat: 40.7228,
      lng: -74.016,
    },
    nextStop: {
      id: 'stop2',
      name: 'Airport Terminal',
      coordinates: { lat: 40.6413, lng: -73.7781 },
      order: 2,
    },
    estimatedArrival: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    passengerCount: 20,
    status: 'delayed' as const,
    lastUpdated: new Date(),
  },
];

const mockRoutes = [
  {
    id: 1,
    name: 'Downtown Express',
    startPoint: 'Central Station',
    endPoint: 'Business District',
    stops: [],
    schedule: [],
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 2,
    name: 'Airport Shuttle',
    startPoint: 'Central Station',
    endPoint: 'International Airport',
    stops: [],
    schedule: [],
    isActive: true,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
];

describe('Active Buses Monitoring Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    mockActiveBusService.getActiveBuses.mockResolvedValue(mockActiveBuses);
    mockRouteService.getRoutesForSelect.mockResolvedValue(mockRoutes.map(route => ({
      id: route.id.toString(),
      name: route.name,
    })));
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <NotificationProvider>
              {component}
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('loads and displays active buses', async () => {
    renderWithProviders(<ActiveBusesPage />);
    
    // Should call API to get active buses
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalled();
    });
    
    // Should display active buses
    await waitFor(() => {
      expect(screen.getByText('Bus B001')).toBeInTheDocument();
      expect(screen.getByText('Bus B002')).toBeInTheDocument();
      expect(screen.getByText('Mercedes Sprinter')).toBeInTheDocument();
      expect(screen.getByText('Ford Transit')).toBeInTheDocument();
      expect(screen.getByText('Route: Downtown Express')).toBeInTheDocument();
      expect(screen.getByText('Route: Airport Shuttle')).toBeInTheDocument();
      expect(screen.getByText('ON ROUTE')).toBeInTheDocument();
      expect(screen.getByText('DELAYED')).toBeInTheDocument();
    });
    
    // Should display passenger counts
    await waitFor(() => {
      expect(screen.getByText('25/40')).toBeInTheDocument();
      expect(screen.getByText('20/30')).toBeInTheDocument();
    });
    
    // Should display next stops
    await waitFor(() => {
      expect(screen.getByText('Next: City Hall')).toBeInTheDocument();
      expect(screen.getByText('Next: Airport Terminal')).toBeInTheDocument();
    });
  });

  it('refreshes data automatically at intervals', async () => {
    renderWithProviders(<ActiveBusesPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(1);
    });
    
    // Fast forward 30 seconds (default refresh interval)
    act(() => {
      jest.advanceTimersByTime(30000);
    });
    
    // Should call API again
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(2);
    });
    
    // Fast forward another 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });
    
    // Should call API again
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(3);
    });
  });

  it('refreshes data manually when refresh button is clicked', async () => {
    renderWithProviders(<ActiveBusesPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(1);
    });
    
    // Find and click refresh button
    const refreshButton = await screen.findByLabelText('Refresh active buses');
    fireEvent.click(refreshButton);
    
    // Should call API again
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(2);
    });
  });

  it('filters active buses by route', async () => {
    // Mock filtered response
    mockActiveBusService.getActiveBuses.mockImplementation((filters: any) => {
      if (filters?.routeId === 'route1') {
        return Promise.resolve([mockActiveBuses[0]]);
      }
      return Promise.resolve(mockActiveBuses);
    });
    
    renderWithProviders(<ActiveBusesPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(1);
      expect(mockRouteService.getRoutesForSelect).toHaveBeenCalled();
    });
    
    // Open route filter dropdown
    const routeFilter = await screen.findByLabelText('Route');
    fireEvent.mouseDown(routeFilter);
    
    // Select Downtown Express route
    const downtownOption = await screen.findByText('Downtown Express');
    fireEvent.click(downtownOption);
    
    // Should call API with route filter
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledWith(expect.objectContaining({
        routeId: 'route1',
      }));
    });
    
    // Should display only filtered buses
    await waitFor(() => {
      expect(screen.getByText('Bus B001')).toBeInTheDocument();
      expect(screen.queryByText('Bus B002')).not.toBeInTheDocument();
    });
  });

  it('filters active buses by status', async () => {
    // Mock filtered response
    mockActiveBusService.getActiveBuses.mockImplementation((filters: any) => {
      if (filters?.status === 'delayed') {
        return Promise.resolve([mockActiveBuses[1]]);
      }
      return Promise.resolve(mockActiveBuses);
    });
    
    renderWithProviders(<ActiveBusesPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(1);
    });
    
    // Open status filter dropdown
    const statusFilter = await screen.findByLabelText('Status');
    fireEvent.mouseDown(statusFilter);
    
    // Select Delayed status
    const delayedOption = await screen.findByText('Delayed');
    fireEvent.click(delayedOption);
    
    // Should call API with status filter
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledWith(expect.objectContaining({
        status: 'delayed',
      }));
    });
    
    // Should display only filtered buses
    await waitFor(() => {
      expect(screen.queryByText('Bus B001')).not.toBeInTheDocument();
      expect(screen.getByText('Bus B002')).toBeInTheDocument();
    });
  });

  it('filters active buses by search term', async () => {
    // Mock filtered response
    mockActiveBusService.getActiveBuses.mockImplementation((filters: any) => {
      if (filters?.search === 'B001') {
        return Promise.resolve([mockActiveBuses[0]]);
      }
      return Promise.resolve(mockActiveBuses);
    });
    
    renderWithProviders(<ActiveBusesPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(1);
    });
    
    // Enter search term
    const searchInput = await screen.findByLabelText('Search buses or routes');
    fireEvent.change(searchInput, { target: { value: 'B001' } });
    
    // Wait for debounce
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    
    // Should call API with search filter
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledWith(expect.objectContaining({
        search: 'B001',
      }));
    });
    
    // Should display only filtered buses
    await waitFor(() => {
      expect(screen.getByText('Bus B001')).toBeInTheDocument();
      expect(screen.queryByText('Bus B002')).not.toBeInTheDocument();
    });
  });

  it('displays empty state when no active buses are found', async () => {
    // Mock empty response
    mockActiveBusService.getActiveBuses.mockResolvedValue([]);
    
    renderWithProviders(<ActiveBusesPage />);
    
    // Should display empty state
    await waitFor(() => {
      expect(screen.getByText('No Active Buses')).toBeInTheDocument();
      expect(screen.getByText('There are currently no buses active on any routes.')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    mockActiveBusService.getActiveBuses.mockRejectedValue({
      message: 'Failed to fetch active buses',
      type: 'NETWORK_ERROR',
    });
    
    renderWithProviders(<ActiveBusesPage />);
    
    // Should display error message
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch active buses')).toBeInTheDocument();
    });
    
    // Should show retry button
    const retryButton = await screen.findByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    // Mock successful response for retry
    mockActiveBusService.getActiveBuses.mockResolvedValue(mockActiveBuses);
    
    // Click retry button
    fireEvent.click(retryButton);
    
    // Should call API again
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(2);
    });
    
    // Should display buses after successful retry
    await waitFor(() => {
      expect(screen.getByText('Bus B001')).toBeInTheDocument();
      expect(screen.getByText('Bus B002')).toBeInTheDocument();
    });
  });

  it('clears filters when clear button is clicked', async () => {
    renderWithProviders(<ActiveBusesPage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledTimes(1);
    });
    
    // Apply filters
    const searchInput = await screen.findByLabelText('Search buses or routes');
    fireEvent.change(searchInput, { target: { value: 'B001' } });
    
    // Wait for debounce
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    
    // Open status filter dropdown
    const statusFilter = await screen.findByLabelText('Status');
    fireEvent.mouseDown(statusFilter);
    
    // Select Delayed status
    const delayedOption = await screen.findByText('Delayed');
    fireEvent.click(delayedOption);
    
    // Reset API mock call count
    mockActiveBusService.getActiveBuses.mockClear();
    
    // Find and click clear button
    const clearButton = await screen.findByText('Clear');
    fireEvent.click(clearButton);
    
    // Should call API without filters
    await waitFor(() => {
      expect(mockActiveBusService.getActiveBuses).toHaveBeenCalledWith({});
    });
    
    // Search input should be cleared
    expect((searchInput as HTMLInputElement).value).toBe('');
  });
});
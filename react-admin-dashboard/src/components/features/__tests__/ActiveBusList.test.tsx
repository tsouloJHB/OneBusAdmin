import React from 'react';
import { render, screen, fireEvent } from '../../../utils/test-utils';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ActiveBusList from '../ActiveBusList';
import { ActiveBus } from '../../../types';

// Create a theme for testing
const theme = createTheme();

// Mock data for testing
const mockActiveBuses: ActiveBus[] = [
  {
    id: '1',
    bus: {
      id: 'bus1',
      busNumber: 'BUS001',
      capacity: 40,
      model: 'Mercedes Citaro',
      year: 2020,
      status: 'active',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    },
    route: {
      id: 'route1',
      name: 'Downtown Express',
      startPoint: 'Central Station',
      endPoint: 'Business District',
      stops: [],
      schedule: [],
      isActive: true,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    },
    currentLocation: {
      lat: 40.7128,
      lng: -74.006
    },
    nextStop: {
      id: 'stop1',
      name: 'City Hall',
      coordinates: { lat: 40.7138, lng: -74.0059 },
      order: 2
    },
    estimatedArrival: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    passengerCount: 25,
    status: 'on_route',
    lastUpdated: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
  },
  {
    id: '2',
    bus: {
      id: 'bus2',
      busNumber: 'BUS002',
      capacity: 35,
      model: 'Volvo 7900',
      year: 2019,
      status: 'active',
      createdAt: new Date('2022-11-10'),
      updatedAt: new Date('2023-02-20')
    },
    route: {
      id: 'route2',
      name: 'Airport Shuttle',
      startPoint: 'Downtown Terminal',
      endPoint: 'International Airport',
      stops: [],
      schedule: [],
      isActive: true,
      createdAt: new Date('2023-02-10'),
      updatedAt: new Date('2023-02-10')
    },
    currentLocation: {
      lat: 40.7228,
      lng: -74.016
    },
    nextStop: {
      id: 'stop2',
      name: 'Airport Terminal',
      coordinates: { lat: 40.6413, lng: -73.7781 },
      order: 2
    },
    estimatedArrival: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    passengerCount: 30,
    status: 'delayed',
    lastUpdated: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
  },
  {
    id: '3',
    bus: {
      id: 'bus3',
      busNumber: 'BUS003',
      capacity: 30,
      model: 'MAN Lion\'s City',
      year: 2018,
      status: 'active',
      createdAt: new Date('2021-05-22'),
      updatedAt: new Date('2023-03-15')
    },
    route: {
      id: 'route3',
      name: 'City Loop',
      startPoint: 'Central Park',
      endPoint: 'Central Park',
      stops: [],
      schedule: [],
      isActive: true,
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2023-03-20')
    },
    currentLocation: {
      lat: 40.7828,
      lng: -73.966
    },
    nextStop: {
      id: 'stop3',
      name: 'Museum Stop',
      coordinates: { lat: 40.7813, lng: -73.9740 },
      order: 3
    },
    estimatedArrival: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    passengerCount: 15,
    status: 'at_stop',
    lastUpdated: new Date(Date.now() - 1 * 60 * 1000) // 1 minute ago
  }
];

// Default props for the component
const defaultProps = {
  buses: mockActiveBuses,
  loading: false,
  error: null,
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  lastUpdated: new Date()
};

// Helper function to render the component with theme
const renderWithTheme = (props = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <ActiveBusList {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('ActiveBusList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the Date.now() to return a consistent value for testing
    jest.spyOn(Date, 'now').mockImplementation(() => 1625097600000); // July 1, 2021
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the active buses list with data', () => {
    renderWithTheme();
    
    // Check if header is rendered
    expect(screen.getByText('Active Buses (3)')).toBeInTheDocument();
    
    // Check if bus data is rendered
    expect(screen.getByText('Bus BUS001')).toBeInTheDocument();
    expect(screen.getByText('Bus BUS002')).toBeInTheDocument();
    expect(screen.getByText('Bus BUS003')).toBeInTheDocument();
    
    // Check if bus models are rendered
    expect(screen.getByText('Mercedes Citaro')).toBeInTheDocument();
    expect(screen.getByText('Volvo 7900')).toBeInTheDocument();
    expect(screen.getByText('MAN Lion\'s City')).toBeInTheDocument();
    
    // Check if route names are rendered
    expect(screen.getByText('Route: Downtown Express')).toBeInTheDocument();
    expect(screen.getByText('Route: Airport Shuttle')).toBeInTheDocument();
    expect(screen.getByText('Route: City Loop')).toBeInTheDocument();
    
    // Check if route endpoints are rendered
    expect(screen.getByText('Central Station → Business District')).toBeInTheDocument();
    expect(screen.getByText('Downtown Terminal → International Airport')).toBeInTheDocument();
    expect(screen.getByText('Central Park → Central Park')).toBeInTheDocument();
    
    // Check if next stops are rendered
    expect(screen.getByText('Next: City Hall')).toBeInTheDocument();
    expect(screen.getByText('Next: Airport Terminal')).toBeInTheDocument();
    expect(screen.getByText('Next: Museum Stop')).toBeInTheDocument();
    
    // Check if status chips are rendered
    expect(screen.getByText('ON ROUTE')).toBeInTheDocument();
    expect(screen.getByText('DELAYED')).toBeInTheDocument();
    expect(screen.getByText('AT STOP')).toBeInTheDocument();
    
    // Check if passenger counts are rendered
    expect(screen.getByText('25/40')).toBeInTheDocument();
    expect(screen.getByText('30/35')).toBeInTheDocument();
    expect(screen.getByText('15/30')).toBeInTheDocument();
    
    // Check if capacity percentages are rendered
    expect(screen.getByText('63%')).toBeInTheDocument();
    expect(screen.getByText('86%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays loading skeleton when loading and no data', () => {
    renderWithTheme({ buses: [], loading: true });
    
    // Check for loading indicator (CardSkeleton)
    expect(screen.getByText('Active Buses')).toBeInTheDocument();
    // We can't easily check for the skeleton itself, but we can verify the header is there
    // and the empty state message is not shown
    expect(screen.queryByText('No Active Buses')).not.toBeInTheDocument();
  });

  it('displays error component when error occurs and no data', () => {
    const error = { 
      type: 'NETWORK_ERROR', 
      message: 'Failed to fetch active buses' 
    };
    
    renderWithTheme({ buses: [], error });
    
    // Check for error message
    expect(screen.getByText('Failed to fetch active buses')).toBeInTheDocument();
    
    // Check for retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    // Test retry functionality
    fireEvent.click(retryButton);
    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
  });

  it('displays error banner when error occurs but has cached data', () => {
    const error = { 
      type: 'NETWORK_ERROR', 
      message: 'Failed to refresh data' 
    };
    
    renderWithTheme({ error });
    
    // Check for error banner
    expect(screen.getByText('Failed to refresh data')).toBeInTheDocument();
    
    // Check that data is still displayed
    expect(screen.getByText('Bus BUS001')).toBeInTheDocument();
    expect(screen.getByText('Bus BUS002')).toBeInTheDocument();
  });

  it('displays empty state when no active buses are found', () => {
    renderWithTheme({ buses: [] });
    
    // Check for empty state message
    expect(screen.getByText('No Active Buses')).toBeInTheDocument();
    expect(screen.getByText('There are currently no buses active on any routes.')).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    renderWithTheme();
    
    // Find and click the refresh button
    const refreshButton = screen.getByLabelText('Refresh active buses');
    fireEvent.click(refreshButton);
    
    // Check if onRefresh was called
    expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);
  });

  it('formats location coordinates correctly', () => {
    renderWithTheme();
    
    // Check if coordinates are formatted correctly
    expect(screen.getByText('40.7128, -74.0060')).toBeInTheDocument();
    expect(screen.getByText('40.7228, -74.0160')).toBeInTheDocument();
    expect(screen.getByText('40.7828, -73.9660')).toBeInTheDocument();
  });

  it('shows last updated time', () => {
    const lastUpdated = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
    renderWithTheme({ lastUpdated });
    
    // Check if last updated time is shown
    expect(screen.getByText('Updated 10m ago')).toBeInTheDocument();
  });

  it('shows "Just now" for very recent updates', () => {
    const lastUpdated = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    renderWithTheme({ lastUpdated });
    
    // Check if "Just now" is shown for recent updates
    expect(screen.getByText('Updated Just now')).toBeInTheDocument();
  });

  it('shows hours for older updates', () => {
    const lastUpdated = new Date(Date.now() - 120 * 60 * 1000); // 120 minutes ago
    renderWithTheme({ lastUpdated });
    
    // Check if hours are shown for older updates
    expect(screen.getByText('Updated 2h ago')).toBeInTheDocument();
  });

  it('disables refresh button when loading', () => {
    renderWithTheme({ loading: true });
    
    // Check if refresh button is disabled when loading
    const refreshButton = screen.getByLabelText('Refresh active buses');
    expect(refreshButton).toBeDisabled();
  });
});
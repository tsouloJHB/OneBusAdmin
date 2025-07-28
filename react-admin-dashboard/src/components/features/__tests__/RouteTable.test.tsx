import React from 'react';
import { render, screen, fireEvent, within } from '../../../utils/test-utils';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RouteTable from '../RouteTable';
import { Route, RouteFilters } from '../../../types';

// Create a theme for testing
const theme = createTheme();

// Mock data for testing
const mockRoutes: Route[] = [
  {
    id: '1',
    name: 'Downtown Express',
    startPoint: 'Central Station',
    endPoint: 'Business District',
    stops: [
      {
        id: 'stop1',
        name: 'Central Station',
        coordinates: { lat: 40.7128, lng: -74.006 },
        order: 1
      },
      {
        id: 'stop2',
        name: 'City Hall',
        coordinates: { lat: 40.7138, lng: -74.0059 },
        order: 2
      },
      {
        id: 'stop3',
        name: 'Business District',
        coordinates: { lat: 40.7148, lng: -74.0058 },
        order: 3
      }
    ],
    schedule: [
      {
        id: 'sched1',
        departureTime: '08:00',
        arrivalTime: '08:30',
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      {
        id: 'sched2',
        departureTime: '17:00',
        arrivalTime: '17:30',
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    ],
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Airport Shuttle',
    startPoint: 'Downtown Terminal',
    endPoint: 'International Airport',
    stops: [
      {
        id: 'stop4',
        name: 'Downtown Terminal',
        coordinates: { lat: 40.7228, lng: -74.016 },
        order: 1
      },
      {
        id: 'stop5',
        name: 'International Airport',
        coordinates: { lat: 40.6413, lng: -73.7781 },
        order: 2
      }
    ],
    schedule: [
      {
        id: 'sched3',
        departureTime: '06:00',
        arrivalTime: '07:00',
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    ],
    isActive: true,
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-02-10')
  },
  {
    id: '3',
    name: 'Weekend Beach Route',
    startPoint: 'City Center',
    endPoint: 'Ocean Beach',
    stops: [],
    schedule: [],
    isActive: false,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2023-03-20')
  }
];

// Default props for the component
const defaultProps = {
  routes: mockRoutes,
  loading: false,
  error: null,
  totalCount: mockRoutes.length,
  page: 0,
  pageSize: 10,
  filters: {} as RouteFilters,
  onPageChange: jest.fn(),
  onPageSizeChange: jest.fn(),
  onSortChange: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onRetry: jest.fn()
};

// Helper function to render the component with theme
const renderWithTheme = (props = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <RouteTable {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('RouteTable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the table with route data', () => {
    renderWithTheme();
    
    // Check if table headers are rendered
    expect(screen.getByText('Route Name')).toBeInTheDocument();
    expect(screen.getByText('Start Point')).toBeInTheDocument();
    expect(screen.getByText('End Point')).toBeInTheDocument();
    expect(screen.getByText('Stops')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Check if route data is rendered
    expect(screen.getByText('Downtown Express')).toBeInTheDocument();
    expect(screen.getByText('Airport Shuttle')).toBeInTheDocument();
    expect(screen.getByText('Weekend Beach Route')).toBeInTheDocument();
    
    expect(screen.getByText('Central Station')).toBeInTheDocument();
    expect(screen.getByText('Downtown Terminal')).toBeInTheDocument();
    expect(screen.getByText('City Center')).toBeInTheDocument();
    
    expect(screen.getByText('Business District')).toBeInTheDocument();
    expect(screen.getByText('International Airport')).toBeInTheDocument();
    expect(screen.getByText('Ocean Beach')).toBeInTheDocument();
    
    // Check stops and schedule formatting
    expect(screen.getByText('3 stops')).toBeInTheDocument();
    expect(screen.getByText('2 stops')).toBeInTheDocument();
    expect(screen.getByText('No stops')).toBeInTheDocument();
    
    expect(screen.getByText('2 times')).toBeInTheDocument();
    expect(screen.getByText('1 time')).toBeInTheDocument();
    expect(screen.getByText('No schedule')).toBeInTheDocument();
    
    // Check status chips
    const activeChips = screen.getAllByText('Active');
    expect(activeChips).toHaveLength(2);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('displays loading skeleton when loading and no data', () => {
    renderWithTheme({ routes: [], loading: true });
    
    // Check for loading indicator
    expect(screen.getByText('Loading routes...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error component when error occurs and no data', () => {
    const error = { 
      type: 'NETWORK_ERROR', 
      message: 'Failed to fetch routes' 
    };
    
    renderWithTheme({ routes: [], error });
    
    // Check for error message
    expect(screen.getByText('Failed to fetch routes')).toBeInTheDocument();
    
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
    expect(screen.getByText('Downtown Express')).toBeInTheDocument();
    expect(screen.getByText('Airport Shuttle')).toBeInTheDocument();
  });

  it('displays empty state when no routes are found', () => {
    renderWithTheme({ routes: [] });
    
    // Check for empty state message
    expect(screen.getByText('No routes found')).toBeInTheDocument();
    expect(screen.getByText('Create your first route to get started')).toBeInTheDocument();
  });

  it('displays different empty state message when filtering with no results', () => {
    renderWithTheme({ 
      routes: [],
      filters: { search: 'nonexistent' }
    });
    
    // Check for empty state message with search context
    expect(screen.getByText('No routes found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    renderWithTheme();
    
    // Find and click the edit button for the first route
    const editButtons = screen.getAllByLabelText(/Edit route/);
    fireEvent.click(editButtons[0]);
    
    // Check if onEdit was called with the correct route
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockRoutes[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    renderWithTheme();
    
    // Find and click the delete button for the first route
    const deleteButtons = screen.getAllByLabelText(/Delete route/);
    fireEvent.click(deleteButtons[0]);
    
    // Check if onDelete was called with the correct route ID
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockRoutes[0].id);
  });

  it('calls onView when view button is clicked', () => {
    const onView = jest.fn();
    renderWithTheme({ onView });
    
    // Find and click the view button for the first route
    const viewButtons = screen.getAllByLabelText(/View route/);
    fireEvent.click(viewButtons[0]);
    
    // Check if onView was called with the correct route
    expect(onView).toHaveBeenCalledWith(mockRoutes[0]);
  });

  it('calls onSortChange when sorting is changed', () => {
    renderWithTheme();
    
    // Find and click the sortable column header (Route Name)
    const routeNameHeader = screen.getByText('Route Name').closest('div');
    if (routeNameHeader) {
      fireEvent.click(routeNameHeader);
    }
    
    // Check if onSortChange was called with the correct parameters
    expect(defaultProps.onSortChange).toHaveBeenCalledWith('name', 'asc');
  });

  it('calls onPageChange when page is changed', () => {
    renderWithTheme({ totalCount: 100 }); // Ensure we have enough items for pagination
    
    // Find and click the next page button
    const nextPageButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextPageButton);
    
    // Check if onPageChange was called with the correct page number
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageSizeChange when page size is changed', () => {
    renderWithTheme();
    
    // Open the rows per page dropdown
    const rowsPerPageButton = screen.getByLabelText('Rows per page:');
    fireEvent.mouseDown(rowsPerPageButton);
    
    // Select a different page size (25)
    const option25 = screen.getByRole('option', { name: '25' });
    fireEvent.click(option25);
    
    // Check if onPageSizeChange was called with the correct page size
    expect(defaultProps.onPageSizeChange).toHaveBeenCalledWith(25);
  });

  it('formats stops count correctly', () => {
    renderWithTheme();
    
    // Check singular form
    const routeWithOneStop = {
      ...mockRoutes[0],
      id: '4',
      name: 'Single Stop Route',
      stops: [mockRoutes[0].stops[0]]
    };
    
    renderWithTheme({ routes: [routeWithOneStop] });
    expect(screen.getByText('1 stop')).toBeInTheDocument();
  });

  it('formats schedule count correctly', () => {
    renderWithTheme();
    
    // Check singular form
    const routeWithOneSchedule = {
      ...mockRoutes[0],
      id: '4',
      name: 'Single Schedule Route',
      schedule: [mockRoutes[0].schedule[0]]
    };
    
    renderWithTheme({ routes: [routeWithOneSchedule] });
    expect(screen.getByText('1 time')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithTheme();
    
    // Check if the table has proper ARIA attributes
    const table = screen.getByLabelText('Routes table');
    expect(table).toBeInTheDocument();
  });
});
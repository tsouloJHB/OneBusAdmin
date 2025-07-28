import React from 'react';
import { render, screen, fireEvent, within } from '../../../utils/test-utils';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import BusTable from '../BusTable';
import { Bus, BusFilters } from '../../../types';

// Create a theme for testing
const theme = createTheme();

// Mock data for testing
const mockBuses: Bus[] = [
  {
    id: '1',
    busNumber: 'BUS001',
    capacity: 40,
    model: 'Mercedes Citaro',
    year: 2020,
    status: 'active',
    assignedRouteId: '101',
    assignedRoute: {
      id: '101',
      name: 'Downtown Express',
      startPoint: 'Central Station',
      endPoint: 'Business District',
      stops: [],
      schedule: [],
      isActive: true,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    },
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: '2',
    busNumber: 'BUS002',
    capacity: 35,
    model: 'Volvo 7900',
    year: 2019,
    status: 'maintenance',
    createdAt: new Date('2022-11-10'),
    updatedAt: new Date('2023-02-20')
  },
  {
    id: '3',
    busNumber: 'BUS003',
    capacity: 30,
    model: 'MAN Lion\'s City',
    year: 2018,
    status: 'retired',
    createdAt: new Date('2021-05-22'),
    updatedAt: new Date('2023-03-15')
  }
];

// Default props for the component
const defaultProps = {
  buses: mockBuses,
  loading: false,
  error: null,
  totalCount: mockBuses.length,
  page: 0,
  pageSize: 10,
  filters: {} as BusFilters,
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
      <BusTable {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('BusTable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the table with bus data', () => {
    renderWithTheme();
    
    // Check if table headers are rendered
    expect(screen.getByText('Bus Number')).toBeInTheDocument();
    expect(screen.getByText('Model')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Assigned Route')).toBeInTheDocument();
    
    // Check if bus data is rendered
    expect(screen.getByText('BUS001')).toBeInTheDocument();
    expect(screen.getByText('Mercedes Citaro')).toBeInTheDocument();
    expect(screen.getByText('BUS002')).toBeInTheDocument();
    expect(screen.getByText('Volvo 7900')).toBeInTheDocument();
    expect(screen.getByText('BUS003')).toBeInTheDocument();
    expect(screen.getByText('MAN Lion\'s City')).toBeInTheDocument();
    
    // Check status chips
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
    expect(screen.getByText('Retired')).toBeInTheDocument();
    
    // Check assigned route
    expect(screen.getByText('Downtown Express')).toBeInTheDocument();
    expect(screen.getByText('Not assigned')).toBeInTheDocument();
  });

  it('displays loading skeleton when loading and no data', () => {
    renderWithTheme({ buses: [], loading: true });
    
    // Check for loading indicator
    expect(screen.getByText('Loading buses...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error component when error occurs and no data', () => {
    const error = { 
      type: 'NETWORK_ERROR', 
      message: 'Failed to fetch buses' 
    };
    
    renderWithTheme({ buses: [], error });
    
    // Check for error message
    expect(screen.getByText('Failed to fetch buses')).toBeInTheDocument();
    
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
    expect(screen.getByText('BUS001')).toBeInTheDocument();
    expect(screen.getByText('Mercedes Citaro')).toBeInTheDocument();
  });

  it('displays empty state when no buses are found', () => {
    renderWithTheme({ buses: [] });
    
    // Check for empty state message
    expect(screen.getByText('No buses found')).toBeInTheDocument();
    expect(screen.getByText('Add your first bus to get started')).toBeInTheDocument();
  });

  it('displays different empty state message when filtering with no results', () => {
    renderWithTheme({ 
      buses: [],
      filters: { search: 'nonexistent' }
    });
    
    // Check for empty state message with search context
    expect(screen.getByText('No buses found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    renderWithTheme();
    
    // Find and click the edit button for the first bus
    const editButtons = screen.getAllByLabelText(/Edit bus/);
    fireEvent.click(editButtons[0]);
    
    // Check if onEdit was called with the correct bus
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockBuses[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    renderWithTheme();
    
    // Find and click the delete button for a non-active bus (index 2 - retired)
    const deleteButtons = screen.getAllByLabelText(/Delete bus/);
    fireEvent.click(deleteButtons[1]); // Index 1 is the retired bus
    
    // Check if onDelete was called with the correct bus ID
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockBuses[2].id);
  });

  it('disables delete button for active buses', () => {
    renderWithTheme();
    
    // Find all delete buttons
    const deleteButtons = screen.getAllByLabelText(/Delete bus/);
    
    // Check if the delete button for the active bus is disabled
    expect(deleteButtons[0]).toBeDisabled();
    
    // Check if delete buttons for non-active buses are not disabled
    expect(deleteButtons[1]).not.toBeDisabled();
  });

  it('calls onView when view button is clicked', () => {
    const onView = jest.fn();
    renderWithTheme({ onView });
    
    // Find and click the view button for the first bus
    const viewButtons = screen.getAllByLabelText(/View bus/);
    fireEvent.click(viewButtons[0]);
    
    // Check if onView was called with the correct bus
    expect(onView).toHaveBeenCalledWith(mockBuses[0]);
  });

  it('calls onSortChange when sorting is changed', () => {
    renderWithTheme();
    
    // Find and click the sortable column header (Bus Number)
    const busNumberHeader = screen.getByText('Bus Number').closest('div');
    if (busNumberHeader) {
      fireEvent.click(busNumberHeader);
    }
    
    // Check if onSortChange was called with the correct parameters
    expect(defaultProps.onSortChange).toHaveBeenCalledWith('busNumber', 'asc');
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

  it('has proper accessibility attributes', () => {
    renderWithTheme();
    
    // Check if the table has proper ARIA attributes
    const table = screen.getByLabelText('Buses data table');
    expect(table).toBeInTheDocument();
    
    // Check if loading state has proper ARIA attributes
    renderWithTheme({ loading: true });
    const loadingElement = screen.getByLabelText('Loading buses');
    expect(loadingElement).toHaveAttribute('role', 'status');
    expect(loadingElement).toHaveAttribute('aria-live', 'polite');
  });
});
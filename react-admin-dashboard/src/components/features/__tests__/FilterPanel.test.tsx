import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../utils/test-utils';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FilterPanel from '../FilterPanel';
import { ActiveBusFilters, Route } from '../../../types';

// Create a theme for testing
const theme = createTheme();

// Mock routes data
const mockRoutes: Route[] = [
  {
    id: '1',
    name: 'Downtown Express',
    startPoint: 'Central Station',
    endPoint: 'Business District',
    stops: [],
    schedule: [],
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Airport Shuttle',
    startPoint: 'Downtown Terminal',
    endPoint: 'International Airport',
    stops: [],
    schedule: [],
    isActive: true,
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-02-10')
  }
];

// Default props for the component
const defaultProps = {
  filters: {} as ActiveBusFilters,
  onFiltersChange: jest.fn(),
  routes: mockRoutes,
  loading: false,
  totalCount: 10,
  filteredCount: 10
};

// Helper function to render the component with theme
const renderWithTheme = (props = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <FilterPanel {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('FilterPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the filter panel with all controls', () => {
    renderWithTheme();
    
    // Check if filter title is rendered
    expect(screen.getByText('Filters')).toBeInTheDocument();
    
    // Check if search field is rendered
    expect(screen.getByLabelText('Search buses or routes')).toBeInTheDocument();
    
    // Check if route filter is rendered
    expect(screen.getByLabelText('Route')).toBeInTheDocument();
    
    // Check if status filter is rendered
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    
    // Check if count is displayed
    expect(screen.getByText('10 of 10 buses')).toBeInTheDocument();
  });

  it('updates search filter with debounce', async () => {
    renderWithTheme();
    
    // Find search input
    const searchInput = screen.getByLabelText('Search buses or routes');
    
    // Type in search input
    fireEvent.change(searchInput, { target: { value: 'bus001' } });
    
    // Check that onFiltersChange hasn't been called yet (debounce)
    expect(defaultProps.onFiltersChange).not.toHaveBeenCalled();
    
    // Fast-forward debounce timer
    jest.advanceTimersByTime(300);
    
    // Check that onFiltersChange has been called with the correct filters
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      search: 'bus001'
    });
  });

  it('updates route filter immediately', () => {
    renderWithTheme();
    
    // Find route select
    const routeSelect = screen.getByLabelText('Route');
    
    // Open the select dropdown
    fireEvent.mouseDown(routeSelect);
    
    // Select a route
    const routeOption = screen.getByText('Downtown Express');
    fireEvent.click(routeOption);
    
    // Check that onFiltersChange has been called with the correct filters
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      routeId: '1'
    });
  });

  it('updates status filter immediately', () => {
    renderWithTheme();
    
    // Find status select
    const statusSelect = screen.getByLabelText('Status');
    
    // Open the select dropdown
    fireEvent.mouseDown(statusSelect);
    
    // Select a status
    const statusOption = screen.getByText('Delayed');
    fireEvent.click(statusOption);
    
    // Check that onFiltersChange has been called with the correct filters
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      status: 'delayed'
    });
  });

  it('displays active filters as chips', async () => {
    const filters: ActiveBusFilters = {
      search: 'bus001',
      routeId: '1',
      status: 'on_route'
    };
    
    renderWithTheme({ filters });
    
    // Check that filter count chip is displayed
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Check that active filters are displayed as chips
    expect(screen.getByText('Search: "bus001"')).toBeInTheDocument();
    expect(screen.getByText('Route: Downtown Express')).toBeInTheDocument();
    expect(screen.getByText('Status: on route')).toBeInTheDocument();
  });

  it('clears individual filters when chip delete is clicked', () => {
    const filters: ActiveBusFilters = {
      search: 'bus001',
      routeId: '1',
      status: 'on_route'
    };
    
    renderWithTheme({ filters });
    
    // Find and click the delete button on the search chip
    const searchChip = screen.getByText('Search: "bus001"');
    const searchChipDeleteButton = searchChip.parentElement?.querySelector('[aria-label="delete"]');
    if (searchChipDeleteButton) {
      fireEvent.click(searchChipDeleteButton);
    }
    
    // Check that onFiltersChange has been called with the correct filters
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      routeId: '1',
      status: 'on_route',
      search: undefined
    });
    
    // Find and click the delete button on the route chip
    const routeChip = screen.getByText('Route: Downtown Express');
    const routeChipDeleteButton = routeChip.parentElement?.querySelector('[aria-label="delete"]');
    if (routeChipDeleteButton) {
      fireEvent.click(routeChipDeleteButton);
    }
    
    // Check that onFiltersChange has been called with the correct filters
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      search: 'bus001',
      status: 'on_route',
      routeId: undefined
    });
    
    // Find and click the delete button on the status chip
    const statusChip = screen.getByText('Status: on route');
    const statusChipDeleteButton = statusChip.parentElement?.querySelector('[aria-label="delete"]');
    if (statusChipDeleteButton) {
      fireEvent.click(statusChipDeleteButton);
    }
    
    // Check that onFiltersChange has been called with the correct filters
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      search: 'bus001',
      routeId: '1',
      status: undefined
    });
  });

  it('clears all filters when clear button is clicked', () => {
    const filters: ActiveBusFilters = {
      search: 'bus001',
      routeId: '1',
      status: 'on_route'
    };
    
    renderWithTheme({ filters });
    
    // Find and click the clear button
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    // Check that onFiltersChange has been called with empty filters
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({});
  });

  it('clears search when clear icon in search field is clicked', () => {
    const filters: ActiveBusFilters = {
      search: 'bus001'
    };
    
    renderWithTheme({ filters });
    
    // Find and click the clear icon in search field
    const clearSearchButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearSearchButton);
    
    // Check that search field is cleared
    const searchInput = screen.getByLabelText('Search buses or routes') as HTMLInputElement;
    expect(searchInput.value).toBe('');
    
    // Fast-forward debounce timer
    jest.advanceTimersByTime(300);
    
    // Check that onFiltersChange has been called with empty search
    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      search: undefined
    });
  });

  it('disables controls when loading', () => {
    renderWithTheme({ loading: true });
    
    // Check that search field is disabled
    const searchInput = screen.getByLabelText('Search buses or routes');
    expect(searchInput).toBeDisabled();
    
    // Check that route select is disabled
    const routeSelect = screen.getByLabelText('Route');
    expect(routeSelect).toBeDisabled();
    
    // Check that status select is disabled
    const statusSelect = screen.getByLabelText('Status');
    expect(statusSelect).toBeDisabled();
  });

  it('shows filtered count correctly', () => {
    renderWithTheme({ totalCount: 10, filteredCount: 5 });
    
    // Check that filtered count is displayed correctly
    expect(screen.getByText('5 of 10 buses')).toBeInTheDocument();
  });

  it('shows "All Routes" as default in route select', () => {
    renderWithTheme();
    
    // Open the route select dropdown
    const routeSelect = screen.getByLabelText('Route');
    fireEvent.mouseDown(routeSelect);
    
    // Check that "All Routes" is an option
    expect(screen.getByText('All Routes')).toBeInTheDocument();
  });

  it('shows "All Status" as default in status select', () => {
    renderWithTheme();
    
    // Open the status select dropdown
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);
    
    // Check that "All Status" is an option
    expect(screen.getByText('All Status')).toBeInTheDocument();
  });

  it('updates local search value when filters change externally', () => {
    const { rerender } = renderWithTheme({ filters: { search: '' } });
    
    // Check initial search input value
    const searchInput = screen.getByLabelText('Search buses or routes') as HTMLInputElement;
    expect(searchInput.value).toBe('');
    
    // Update filters externally
    rerender(
      <ThemeProvider theme={theme}>
        <FilterPanel 
          {...defaultProps} 
          filters={{ search: 'external search' }} 
        />
      </ThemeProvider>
    );
    
    // Check that search input value is updated
    expect(searchInput.value).toBe('external search');
  });
});
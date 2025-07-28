import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoutesPage from '../RoutesPage';
import { routeService } from '../../../services/routeService';
import { Route } from '../../../types';

// Mock the route service
jest.mock('../../../services/routeService');
const mockRouteService = routeService as jest.Mocked<typeof routeService>;

// Mock the feature components
jest.mock('../../features', () => ({
  RouteTable: ({ routes, loading, error, onEdit, onDelete }: any) => (
    <div data-testid="route-table">
      {loading && <div>Loading routes...</div>}
      {error && <div>Error: {error}</div>}
      {routes.map((route: Route) => (
        <div key={route.id} data-testid={`route-${route.id}`}>
          <span>{route.name}</span>
          <button onClick={() => onEdit(route)}>Edit</button>
          <button onClick={() => onDelete(route.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
  RouteForm: ({ open, route, onClose, onSubmit }: any) => (
    open ? (
      <div data-testid="route-form">
        <h2>{route ? 'Edit Route' : 'Create Route'}</h2>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSubmit({ name: 'Test Route', startPoint: 'A', endPoint: 'B', isActive: true, stops: [], schedule: [] })}>
          Submit
        </button>
      </div>
    ) : null
  ),
}));

// Mock data
const mockRoutes: Route[] = [
  {
    id: '1',
    name: 'Route A',
    startPoint: 'Downtown',
    endPoint: 'Airport',
    stops: [],
    schedule: [],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Route B',
    startPoint: 'Mall',
    endPoint: 'University',
    stops: [],
    schedule: [],
    isActive: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

const mockPaginatedResponse = {
  data: mockRoutes,
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
  },
};

describe('RoutesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteService.getRoutes.mockResolvedValue(mockPaginatedResponse);
  });

  it('renders the page title and add button', async () => {
    render(<RoutesPage />);

    expect(screen.getByText('Routes Management')).toBeInTheDocument();
    expect(screen.getByText('Add Route')).toBeInTheDocument();
  });

  it('loads and displays routes on mount', async () => {
    render(<RoutesPage />);

    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalledWith(
        expect.objectContaining({
          search: '',
          isActive: undefined,
          sortBy: 'name',
          sortOrder: 'asc',
        }),
        1,
        10
      );
    });

    expect(screen.getByTestId('route-table')).toBeInTheDocument();
  });

  it('opens create form when add button is clicked', async () => {
    render(<RoutesPage />);

    const addButton = screen.getByText('Add Route');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('route-form')).toBeInTheDocument();
      expect(screen.getByText('Create Route')).toBeInTheDocument();
    });
  });

  it('opens edit form when edit button is clicked', async () => {
    render(<RoutesPage />);

    // Wait for routes to load
    await waitFor(() => {
      expect(screen.getByTestId('route-table')).toBeInTheDocument();
    });

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId('route-form')).toBeInTheDocument();
      expect(screen.getByText('Edit Route')).toBeInTheDocument();
    });
  });

  it('handles route creation successfully', async () => {
    mockRouteService.createRoute.mockResolvedValue(mockRoutes[0]);
    render(<RoutesPage />);

    // Open create form
    const addButton = screen.getByText('Add Route');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('route-form')).toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRouteService.createRoute).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Route',
          startPoint: 'A',
          endPoint: 'B',
          isActive: true,
        })
      );
    });

    // Check that success notification is shown
    await waitFor(() => {
      expect(screen.getByText('Route created successfully')).toBeInTheDocument();
    });
  });

  it('handles route update successfully', async () => {
    mockRouteService.updateRoute.mockResolvedValue(mockRoutes[0]);
    render(<RoutesPage />);

    // Wait for routes to load and open edit form
    await waitFor(() => {
      expect(screen.getByTestId('route-table')).toBeInTheDocument();
    });

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId('route-form')).toBeInTheDocument();
    });

    // Submit form
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRouteService.updateRoute).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          name: 'Test Route',
          startPoint: 'A',
          endPoint: 'B',
          isActive: true,
        })
      );
    });

    // Check that success notification is shown
    await waitFor(() => {
      expect(screen.getByText('Route updated successfully')).toBeInTheDocument();
    });
  });

  it('opens delete confirmation dialog', async () => {
    render(<RoutesPage />);

    // Wait for routes to load
    await waitFor(() => {
      expect(screen.getByTestId('route-table')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this route? This action cannot be undone.')).toBeInTheDocument();
    });
  });

  it('handles route deletion successfully', async () => {
    mockRouteService.deleteRoute.mockResolvedValue();
    render(<RoutesPage />);

    // Wait for routes to load and open delete dialog
    await waitFor(() => {
      expect(screen.getByTestId('route-table')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    });

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockRouteService.deleteRoute).toHaveBeenCalledWith('1');
    });

    // Check that success notification is shown
    await waitFor(() => {
      expect(screen.getByText('Route deleted successfully')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    render(<RoutesPage />);

    const searchInput = screen.getByPlaceholderText('Search routes...');
    fireEvent.change(searchInput, { target: { value: 'Route A' } });

    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Route A',
        }),
        1,
        10
      );
    });
  });

  it('handles status filter functionality', async () => {
    render(<RoutesPage />);

    // Open status filter dropdown
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);

    // Select "Active Only"
    const activeOption = screen.getByText('Active Only');
    fireEvent.click(activeOption);

    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
        1,
        10
      );
    });
  });

  it('displays error message when route loading fails', async () => {
    const errorMessage = 'Failed to load routes';
    mockRouteService.getRoutes.mockRejectedValue(new Error(errorMessage));
    
    render(<RoutesPage />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching routes', async () => {
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    mockRouteService.getRoutes.mockReturnValue(promise as any);
    
    render(<RoutesPage />);

    // Should show loading state
    expect(screen.getByText('Loading routes...')).toBeInTheDocument();

    // Resolve the promise
    resolvePromise!(mockPaginatedResponse);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading routes...')).not.toBeInTheDocument();
    });
  });

  it('closes form when close button is clicked', async () => {
    render(<RoutesPage />);

    // Open form
    const addButton = screen.getByText('Add Route');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('route-form')).toBeInTheDocument();
    });

    // Close form
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('route-form')).not.toBeInTheDocument();
    });
  });

  it('cancels delete operation', async () => {
    render(<RoutesPage />);

    // Wait for routes to load and open delete dialog
    await waitFor(() => {
      expect(screen.getByTestId('route-table')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    });

    // Cancel deletion
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    });

    // Ensure delete service was not called
    expect(mockRouteService.deleteRoute).not.toHaveBeenCalled();
  });
});
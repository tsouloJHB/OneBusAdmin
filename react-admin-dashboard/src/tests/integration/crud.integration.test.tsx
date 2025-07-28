import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider, NotificationProvider } from '../../contexts';
import { BusesPage } from '../../components/pages';
import { busService } from '../../services/busService';
import { routeService } from '../../services/routeService';

// Mock the services
jest.mock('../../services/busService');
jest.mock('../../services/routeService');
const mockBusService = busService as jest.Mocked<typeof busService>;
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

const theme = createTheme();

// Sample data
const mockBuses = [
  {
    id: 'bus1',
    busNumber: 'B001',
    capacity: 40,
    model: 'Mercedes Sprinter',
    year: 2022,
    status: 'active' as const,
    assignedRouteId: 'route1',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 'bus2',
    busNumber: 'B002',
    capacity: 30,
    model: 'Ford Transit',
    year: 2021,
    status: 'maintenance' as const,
    assignedRouteId: 'route2',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
];

const mockRoutes = [
  {
    id: 'route1',
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
    id: 'route2',
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

describe('CRUD Operations Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    mockBusService.getBuses.mockResolvedValue({
      data: mockBuses,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    });
    
    mockRouteService.getRoutes.mockResolvedValue({
      data: mockRoutes,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    });
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

  it('loads and displays buses', async () => {
    renderWithProviders(<BusesPage />);
    
    // Should call API to get buses
    await waitFor(() => {
      expect(mockBusService.getBuses).toHaveBeenCalled();
    });
    
    // Should display buses in the table
    await waitFor(() => {
      expect(screen.getByText('B001')).toBeInTheDocument();
      expect(screen.getByText('B002')).toBeInTheDocument();
    });
  });

  it('creates a new bus', async () => {
    // Mock create bus API
    mockBusService.createBus.mockResolvedValue({
      id: 'bus3',
      busNumber: 'B003',
      capacity: 35,
      model: 'Toyota Coaster',
      year: 2023,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    renderWithProviders(<BusesPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(mockBusService.getBuses).toHaveBeenCalled();
    });
    
    // Click add bus button
    const addButton = await screen.findByText('Add Bus');
    fireEvent.click(addButton);
    
    // Fill in form
    await waitFor(() => {
      const busNumberInput = screen.getByLabelText('Bus Number');
      fireEvent.change(busNumberInput, { target: { value: 'B003' } });
      
      const capacityInput = screen.getByLabelText('Capacity');
      fireEvent.change(capacityInput, { target: { value: '35' } });
      
      const modelInput = screen.getByLabelText('Model');
      fireEvent.change(modelInput, { target: { value: 'Toyota Coaster' } });
      
      const yearInput = screen.getByLabelText('Year');
      fireEvent.change(yearInput, { target: { value: '2023' } });
    });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(submitButton);
    
    // Should call create API
    await waitFor(() => {
      expect(mockBusService.createBus).toHaveBeenCalledWith({
        busNumber: 'B003',
        capacity: 35,
        model: 'Toyota Coaster',
        year: 2023,
        status: 'active',
      });
    });
    
    // Should refresh bus list
    await waitFor(() => {
      expect(mockBusService.getBuses).toHaveBeenCalledTimes(2);
    });
  });

  it('updates an existing bus', async () => {
    // Mock update bus API
    mockBusService.updateBus.mockResolvedValue({
      ...mockBuses[0],
      capacity: 45,
      updatedAt: new Date(),
    } as any);
    
    renderWithProviders(<BusesPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(mockBusService.getBuses).toHaveBeenCalled();
    });
    
    // Click edit button for first bus
    const editButtons = await screen.findAllByLabelText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Update capacity
    await waitFor(() => {
      const capacityInput = screen.getByLabelText('Capacity');
      fireEvent.change(capacityInput, { target: { value: '45' } });
    });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(submitButton);
    
    // Should call update API
    await waitFor(() => {
      expect(mockBusService.updateBus).toHaveBeenCalledWith({
        id: 'bus1',
        capacity: 45,
      });
    });
    
    // Should refresh bus list
    await waitFor(() => {
      expect(mockBusService.getBuses).toHaveBeenCalledTimes(2);
    });
  });

  it('deletes a bus', async () => {
    // Mock delete bus API
    mockBusService.deleteBus.mockResolvedValue(undefined);
    
    renderWithProviders(<BusesPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(mockBusService.getBuses).toHaveBeenCalled();
    });
    
    // Click delete button for first bus
    const deleteButtons = await screen.findAllByLabelText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Confirm deletion
    const confirmButton = await screen.findByRole('button', { name: 'Delete' });
    fireEvent.click(confirmButton);
    
    // Should call delete API
    await waitFor(() => {
      expect(mockBusService.deleteBus).toHaveBeenCalledWith('bus1');
    });
    
    // Should refresh bus list
    await waitFor(() => {
      expect(mockBusService.getBuses).toHaveBeenCalledTimes(2);
    });
  });
});
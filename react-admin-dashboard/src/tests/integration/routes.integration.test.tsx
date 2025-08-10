import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider, NotificationProvider } from '../../contexts';
import { RoutesPage } from '../../components/pages';
import { routeService } from '../../services/routeService';

// Mock the services
jest.mock('../../services/routeService');
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
const mockRoutes = [
  {
    id: 1,
    name: 'Downtown Express',
    startPoint: 'Central Station',
    endPoint: 'Business District',
    stops: [
      {
        id: 1,
        name: 'Central Station',
        latitude: 40.7128,
        longitude: -74.006,
        order: 1,
        routeId: 1
      },
      {
        id: 2,
        name: 'City Hall',
        latitude: 40.7138,
        longitude: -74.0059,
        order: 2,
        routeId: 1
      },
      {
        id: 3,
        name: 'Business District',
        latitude: 40.7148,
        longitude: -74.0058,
        order: 3,
        routeId: 1
      }
    ],
    schedule: [
      {
        id: 'sched1',
        departureTime: '08:00',
        arrivalTime: '08:30',
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    ],
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 2,
    name: 'Airport Shuttle',
    startPoint: 'Downtown Terminal',
    endPoint: 'International Airport',
    stops: [
      {
        id: 4,
        name: 'Downtown Terminal',
        latitude: 40.7228,
        longitude: -74.016,
        order: 1,
        routeId: 2
      },
      {
        id: 5,
        name: 'International Airport',
        latitude: 40.6413,
        longitude: -73.7781,
        order: 2,
        routeId: 2
      }
    ],
    schedule: [
      {
        id: 'sched2',
        departureTime: '06:00',
        arrivalTime: '07:00',
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    ],
    isActive: true,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
];

describe('Routes Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API responses
    mockRouteService.getRoutes.mockResolvedValue({
      data: mockRoutes,
      pagination: {
        page: 0,
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

  it('loads and displays routes', async () => {
    renderWithProviders(<RoutesPage />);
    
    // Should call API to get routes
    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalled();
    });
    
    // Should display routes in the table
    await waitFor(() => {
      expect(screen.getByText('Downtown Express')).toBeInTheDocument();
      expect(screen.getByText('Airport Shuttle')).toBeInTheDocument();
      expect(screen.getByText('Central Station')).toBeInTheDocument();
      expect(screen.getByText('International Airport')).toBeInTheDocument();
    });
    
    // Should display stop counts
    await waitFor(() => {
      expect(screen.getByText('3 stops')).toBeInTheDocument();
      expect(screen.getByText('2 stops')).toBeInTheDocument();
    });
  });

  it('creates a new route', async () => {
    // Mock create route API
    mockRouteService.createRoute.mockResolvedValue({
      id: 3,
      name: 'Beach Express',
      startPoint: 'City Center',
      endPoint: 'Ocean Beach',
      stops: [
        {
          id: 6,
          name: 'City Center',
          latitude: 40.7128,
          longitude: -74.006,
          order: 1,
          routeId: 3
        },
        {
          id: 7,
          name: 'Ocean Beach',
          latitude: 40.7028,
          longitude: -74.016,
          order: 2,
          routeId: 3
        }
      ],
      schedule: [
        {
          id: 'sched3',
          departureTime: '09:00',
          arrivalTime: '09:30',
          daysOfWeek: ['Saturday', 'Sunday']
        }
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    renderWithProviders(<RoutesPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalled();
    });
    
    // Click add route button
    const addButton = await screen.findByText('Add Route');
    fireEvent.click(addButton);
    
    // Fill in form
    await waitFor(() => {
      // Basic information
      const nameInput = screen.getByLabelText('Route Name');
      fireEvent.change(nameInput, { target: { value: 'Beach Express' } });
      
      const startPointInput = screen.getByLabelText('Start Point');
      fireEvent.change(startPointInput, { target: { value: 'City Center' } });
      
      const endPointInput = screen.getByLabelText('End Point');
      fireEvent.change(endPointInput, { target: { value: 'Ocean Beach' } });
      
      // Add stops
      const addStopButton = screen.getByText('Add Stop');
      fireEvent.click(addStopButton);
      
      // Fill in first stop
      const stopNameInputs = screen.getAllByLabelText('Stop Name');
      fireEvent.change(stopNameInputs[0], { target: { value: 'City Center' } });
      
      const latInputs = screen.getAllByLabelText('Latitude');
      fireEvent.change(latInputs[0], { target: { value: '40.7128' } });
      
      const lngInputs = screen.getAllByLabelText('Longitude');
      fireEvent.change(lngInputs[0], { target: { value: '-74.006' } });
      
      // Add second stop
      fireEvent.click(addStopButton);
      
      // Fill in second stop
      const updatedStopNameInputs = screen.getAllByLabelText('Stop Name');
      fireEvent.change(updatedStopNameInputs[1], { target: { value: 'Ocean Beach' } });
      
      const updatedLatInputs = screen.getAllByLabelText('Latitude');
      fireEvent.change(updatedLatInputs[1], { target: { value: '40.7028' } });
      
      const updatedLngInputs = screen.getAllByLabelText('Longitude');
      fireEvent.change(updatedLngInputs[1], { target: { value: '-74.016' } });
      
      // Update schedule
      const departureTimeInput = screen.getByLabelText('Departure Time');
      fireEvent.change(departureTimeInput, { target: { value: '09:00' } });
      
      const arrivalTimeInput = screen.getByLabelText('Arrival Time');
      fireEvent.change(arrivalTimeInput, { target: { value: '09:30' } });
      
      // Uncheck weekdays
      const mondayCheckbox = screen.getByLabelText('Monday');
      fireEvent.click(mondayCheckbox);
      
      const tuesdayCheckbox = screen.getByLabelText('Tuesday');
      fireEvent.click(tuesdayCheckbox);
      
      const wednesdayCheckbox = screen.getByLabelText('Wednesday');
      fireEvent.click(wednesdayCheckbox);
      
      const thursdayCheckbox = screen.getByLabelText('Thursday');
      fireEvent.click(thursdayCheckbox);
      
      const fridayCheckbox = screen.getByLabelText('Friday');
      fireEvent.click(fridayCheckbox);
      
      // Check weekend days
      const saturdayCheckbox = screen.getByLabelText('Saturday');
      fireEvent.click(saturdayCheckbox);
      
      const sundayCheckbox = screen.getByLabelText('Sunday');
      fireEvent.click(sundayCheckbox);
    });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Create Route' });
    fireEvent.click(submitButton);
    
    // Should call create API
    await waitFor(() => {
      expect(mockRouteService.createRoute).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Beach Express',
        startPoint: 'City Center',
        endPoint: 'Ocean Beach',
        isActive: true,
        stops: [
          {
            name: 'City Center',
            coordinates: { lat: 40.7128, lng: -74.006 },
            order: 1
          },
          {
            name: 'Ocean Beach',
            coordinates: { lat: 40.7028, lng: -74.016 },
            order: 2
          }
        ],
        schedule: [
          {
            departureTime: '09:00',
            arrivalTime: '09:30',
            daysOfWeek: ['Saturday', 'Sunday']
          }
        ]
      }));
    });
    
    // Should refresh route list
    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalledTimes(2);
    });
  });

  it('updates an existing route', async () => {
    // Mock update route API
    mockRouteService.updateRoute.mockResolvedValue({
      ...mockRoutes[0],
      name: 'Downtown Express Updated',
      updatedAt: new Date(),
    });
    
    renderWithProviders(<RoutesPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalled();
    });
    
    // Click edit button for first route
    const editButtons = await screen.findAllByLabelText(/Edit route/);
    fireEvent.click(editButtons[0]);
    
    // Update route name
    await waitFor(() => {
      const nameInput = screen.getByLabelText('Route Name');
      fireEvent.change(nameInput, { target: { value: 'Downtown Express Updated' } });
    });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Update Route' });
    fireEvent.click(submitButton);
    
    // Should call update API
    await waitFor(() => {
      expect(mockRouteService.updateRoute).toHaveBeenCalledWith(expect.objectContaining({
        id: 'route1',
        name: 'Downtown Express Updated',
      }));
    });
    
    // Should refresh route list
    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalledTimes(2);
    });
  });

  it('deletes a route', async () => {
    // Mock delete route API
    mockRouteService.deleteRoute.mockResolvedValue(undefined);
    
    renderWithProviders(<RoutesPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalled();
    });
    
    // Click delete button for first route
    const deleteButtons = await screen.findAllByLabelText(/Delete route/);
    fireEvent.click(deleteButtons[0]);
    
    // Confirm deletion in the dialog
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: 'Delete' });
      fireEvent.click(confirmButton);
    });
    
    // Should call delete API
    await waitFor(() => {
      expect(mockRouteService.deleteRoute).toHaveBeenCalledWith('route1');
    });
    
    // Should refresh route list
    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalledTimes(2);
    });
  });

  it('filters routes by search term', async () => {
    // Mock filtered routes response
    const filteredRoutes = [mockRoutes[0]]; // Only Downtown Express
    mockRouteService.getRoutes.mockImplementation((params) => {
      if (params?.search === 'Downtown') {
        return Promise.resolve({
          data: filteredRoutes,
          pagination: {
            page: 0,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        });
      }
      return Promise.resolve({
        data: mockRoutes,
        pagination: {
          page: 0,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });
    
    renderWithProviders(<RoutesPage />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalled();
    });
    
    // Enter search term
    const searchInput = await screen.findByPlaceholderText('Search routes...');
    fireEvent.change(searchInput, { target: { value: 'Downtown' } });
    
    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Should call API with search parameter
    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalledWith(expect.objectContaining({
        search: 'Downtown',
      }));
    });
    
    // Should display only filtered routes
    await waitFor(() => {
      expect(screen.getByText('Downtown Express')).toBeInTheDocument();
      expect(screen.queryByText('Airport Shuttle')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    mockRouteService.getRoutes.mockRejectedValue({
      message: 'Failed to fetch routes',
      type: 'NETWORK_ERROR',
    });
    
    renderWithProviders(<RoutesPage />);
    
    // Should display error message
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch routes')).toBeInTheDocument();
    });
    
    // Should show retry button
    const retryButton = await screen.findByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    // Mock successful response for retry
    mockRouteService.getRoutes.mockResolvedValue({
      data: mockRoutes,
      pagination: {
        page: 0,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    });
    
    // Click retry button
    fireEvent.click(retryButton);
    
    // Should call API again
    await waitFor(() => {
      expect(mockRouteService.getRoutes).toHaveBeenCalledTimes(2);
    });
    
    // Should display routes after successful retry
    await waitFor(() => {
      expect(screen.getByText('Downtown Express')).toBeInTheDocument();
      expect(screen.getByText('Airport Shuttle')).toBeInTheDocument();
    });
  });
});
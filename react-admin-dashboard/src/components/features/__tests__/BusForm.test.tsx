import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../utils/test-utils';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import BusForm from '../BusForm';
import { Bus } from '../../../types';
import { routeService } from '../../../services';

// Mock the route service
jest.mock('../../../services', () => ({
  routeService: {
    getRoutesForSelect: jest.fn()
  }
}));

const mockRouteService = routeService as jest.Mocked<typeof routeService>;

// Create a theme for testing
const theme = createTheme();

// Mock bus data for editing
const mockBus: Bus = {
  id: '1',
  busNumber: 'BUS001',
  capacity: 40,
  model: 'Mercedes Citaro',
  year: 2020,
  status: 'active',
  assignedRouteId: '101',
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2023-01-15')
};

// Mock routes data
const mockRoutes = [
  { id: '101', name: 'Downtown Express' },
  { id: '102', name: 'Airport Shuttle' }
];

// Default props for the component
const defaultProps = {
  open: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockResolvedValue(undefined),
  loading: false
};

// Helper function to render the component with theme
const renderWithTheme = (props = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <BusForm {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('BusForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteService.getRoutesForSelect.mockResolvedValue(mockRoutes);
  });

  it('renders the form with correct title for new bus', async () => {
    renderWithTheme();
    
    // Check if the title is correct
    expect(screen.getByText('Add New Bus')).toBeInTheDocument();
    
    // Check if form fields are rendered
    expect(screen.getByLabelText('Bus number')).toBeInTheDocument();
    expect(screen.getByLabelText('Bus model')).toBeInTheDocument();
    expect(screen.getByLabelText('Manufacturing year')).toBeInTheDocument();
    expect(screen.getByLabelText('Passenger capacity')).toBeInTheDocument();
    
    // Check if status select is rendered
    expect(screen.getByLabelText('Status *')).toBeInTheDocument();
    
    // Check if route select is rendered
    await waitFor(() => {
      expect(screen.getByLabelText('Assigned Route (Optional)')).toBeInTheDocument();
    });
    
    // Check if buttons are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Add Bus')).toBeInTheDocument();
  });

  it('renders the form with correct title and pre-filled data for editing', async () => {
    renderWithTheme({ bus: mockBus });
    
    // Check if the title is correct
    expect(screen.getByText('Edit Bus')).toBeInTheDocument();
    
    // Check if form fields are pre-filled
    const busNumberInput = screen.getByLabelText('Bus number') as HTMLInputElement;
    expect(busNumberInput.value).toBe('BUS001');
    
    const modelInput = screen.getByLabelText('Bus model') as HTMLInputElement;
    expect(modelInput.value).toBe('Mercedes Citaro');
    
    const yearInput = screen.getByLabelText('Manufacturing year') as HTMLInputElement;
    expect(yearInput.value).toBe('2020');
    
    const capacityInput = screen.getByLabelText('Passenger capacity') as HTMLInputElement;
    expect(capacityInput.value).toBe('40');
    
    // Check if update button is rendered
    expect(screen.getByText('Update Bus')).toBeInTheDocument();
  });

  it('loads available routes when form opens', async () => {
    renderWithTheme();
    
    // Check if route service was called
    expect(mockRouteService.getRoutesForSelect).toHaveBeenCalled();
    
    // Wait for routes to load
    await waitFor(() => {
      expect(screen.getByText('No route assigned')).toBeInTheDocument();
    });
    
    // Open the route select dropdown
    const routeSelect = screen.getByLabelText('Assigned Route (Optional)');
    fireEvent.mouseDown(routeSelect);
    
    // Check if routes are rendered in the dropdown
    await waitFor(() => {
      expect(screen.getByText('Downtown Express')).toBeInTheDocument();
      expect(screen.getByText('Airport Shuttle')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    renderWithTheme();
    
    // Clear required fields
    const busNumberInput = screen.getByLabelText('Bus number');
    fireEvent.change(busNumberInput, { target: { value: '' } });
    fireEvent.blur(busNumberInput);
    
    const modelInput = screen.getByLabelText('Bus model');
    fireEvent.change(modelInput, { target: { value: '' } });
    fireEvent.blur(modelInput);
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText('Bus number is required')).toBeInTheDocument();
      expect(screen.getByText('Model is required')).toBeInTheDocument();
    });
    
    // Check if submit button is disabled
    expect(screen.getByText('Add Bus').closest('button')).toBeDisabled();
  });

  it('validates bus number format', async () => {
    renderWithTheme();
    
    // Enter invalid bus number
    const busNumberInput = screen.getByLabelText('Bus number');
    fireEvent.change(busNumberInput, { target: { value: 'invalid-bus' } });
    fireEvent.blur(busNumberInput);
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Bus number must contain only uppercase letters and numbers')).toBeInTheDocument();
    });
    
    // Enter valid bus number
    fireEvent.change(busNumberInput, { target: { value: 'BUS123' } });
    fireEvent.blur(busNumberInput);
    
    // Check if validation error is cleared
    await waitFor(() => {
      expect(screen.queryByText('Bus number must contain only uppercase letters and numbers')).not.toBeInTheDocument();
    });
  });

  it('validates capacity range', async () => {
    renderWithTheme();
    
    // Enter invalid capacity (too low)
    const capacityInput = screen.getByLabelText('Passenger capacity');
    fireEvent.change(capacityInput, { target: { value: '5' } });
    fireEvent.blur(capacityInput);
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Capacity must be at least 10 passengers')).toBeInTheDocument();
    });
    
    // Enter invalid capacity (too high)
    fireEvent.change(capacityInput, { target: { value: '250' } });
    fireEvent.blur(capacityInput);
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Capacity must not exceed 200 passengers')).toBeInTheDocument();
    });
    
    // Enter valid capacity
    fireEvent.change(capacityInput, { target: { value: '50' } });
    fireEvent.blur(capacityInput);
    
    // Check if validation error is cleared
    await waitFor(() => {
      expect(screen.queryByText('Capacity must be at least 10 passengers')).not.toBeInTheDocument();
      expect(screen.queryByText('Capacity must not exceed 200 passengers')).not.toBeInTheDocument();
    });
  });

  it('validates year range', async () => {
    renderWithTheme();
    
    // Enter invalid year (too old)
    const yearInput = screen.getByLabelText('Manufacturing year');
    fireEvent.change(yearInput, { target: { value: '1980' } });
    fireEvent.blur(yearInput);
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Year must be 1990 or later')).toBeInTheDocument();
    });
    
    // Enter invalid year (future)
    const futureYear = new Date().getFullYear() + 2;
    fireEvent.change(yearInput, { target: { value: futureYear.toString() } });
    fireEvent.blur(yearInput);
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(`Year must not exceed ${new Date().getFullYear() + 1}`)).toBeInTheDocument();
    });
    
    // Enter valid year
    fireEvent.change(yearInput, { target: { value: '2020' } });
    fireEvent.blur(yearInput);
    
    // Check if validation error is cleared
    await waitFor(() => {
      expect(screen.queryByText('Year must be 1990 or later')).not.toBeInTheDocument();
      expect(screen.queryByText(`Year must not exceed ${new Date().getFullYear() + 1}`)).not.toBeInTheDocument();
    });
  });

  it('disables route selection when status is retired', async () => {
    renderWithTheme();
    
    // Wait for routes to load
    await waitFor(() => {
      expect(mockRouteService.getRoutesForSelect).toHaveBeenCalled();
    });
    
    // Change status to retired
    const statusSelect = screen.getByLabelText('Status *');
    fireEvent.mouseDown(statusSelect);
    const retiredOption = screen.getByText('Retired');
    fireEvent.click(retiredOption);
    
    // Check if route select is disabled
    await waitFor(() => {
      const routeSelect = screen.getByLabelText('Assigned Route (Optional)');
      expect(routeSelect).toBeDisabled();
      expect(screen.getByText('Retired buses cannot be assigned to routes')).toBeInTheDocument();
    });
  });

  it('submits the form with valid data for new bus', async () => {
    renderWithTheme();
    
    // Fill in form fields
    const busNumberInput = screen.getByLabelText('Bus number');
    fireEvent.change(busNumberInput, { target: { value: 'BUS123' } });
    
    const modelInput = screen.getByLabelText('Bus model');
    fireEvent.change(modelInput, { target: { value: 'Volvo 7900' } });
    
    const yearInput = screen.getByLabelText('Manufacturing year');
    fireEvent.change(yearInput, { target: { value: '2022' } });
    
    const capacityInput = screen.getByLabelText('Passenger capacity');
    fireEvent.change(capacityInput, { target: { value: '45' } });
    
    // Select a route
    await waitFor(() => {
      expect(mockRouteService.getRoutesForSelect).toHaveBeenCalled();
    });
    
    const routeSelect = screen.getByLabelText('Assigned Route (Optional)');
    fireEvent.mouseDown(routeSelect);
    const routeOption = screen.getByText('Downtown Express');
    fireEvent.click(routeOption);
    
    // Submit the form
    const submitButton = screen.getByText('Add Bus');
    fireEvent.click(submitButton);
    
    // Check if onSubmit was called with the correct data
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        busNumber: 'BUS123',
        model: 'Volvo 7900',
        year: 2022,
        capacity: 45,
        status: 'active',
        assignedRouteId: '101'
      });
    });
    
    // Check if onClose was called
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('submits the form with valid data for editing bus', async () => {
    renderWithTheme({ bus: mockBus });
    
    // Modify form fields
    const modelInput = screen.getByLabelText('Bus model');
    fireEvent.change(modelInput, { target: { value: 'Mercedes Citaro Updated' } });
    
    const capacityInput = screen.getByLabelText('Passenger capacity');
    fireEvent.change(capacityInput, { target: { value: '50' } });
    
    // Change status
    const statusSelect = screen.getByLabelText('Status *');
    fireEvent.mouseDown(statusSelect);
    const maintenanceOption = screen.getByText('Maintenance');
    fireEvent.click(maintenanceOption);
    
    // Submit the form
    const submitButton = screen.getByText('Update Bus');
    fireEvent.click(submitButton);
    
    // Check if onSubmit was called with the correct data
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        id: '1',
        busNumber: 'BUS001',
        model: 'Mercedes Citaro Updated',
        year: 2020,
        capacity: 50,
        status: 'maintenance',
        assignedRouteId: '101'
      });
    });
    
    // Check if onClose was called
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles form submission error', async () => {
    const onSubmitWithError = jest.fn().mockRejectedValue({
      type: 'VALIDATION_ERROR',
      message: 'Bus number already exists'
    });
    
    renderWithTheme({ onSubmit: onSubmitWithError });
    
    // Fill in form fields
    const busNumberInput = screen.getByLabelText('Bus number');
    fireEvent.change(busNumberInput, { target: { value: 'BUS123' } });
    
    const modelInput = screen.getByLabelText('Bus model');
    fireEvent.change(modelInput, { target: { value: 'Volvo 7900' } });
    
    const yearInput = screen.getByLabelText('Manufacturing year');
    fireEvent.change(yearInput, { target: { value: '2022' } });
    
    const capacityInput = screen.getByLabelText('Passenger capacity');
    fireEvent.change(capacityInput, { target: { value: '45' } });
    
    // Submit the form
    const submitButton = screen.getByText('Add Bus');
    fireEvent.click(submitButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Bus number already exists')).toBeInTheDocument();
    });
    
    // Check if onClose was not called
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('handles route loading error', async () => {
    mockRouteService.getRoutesForSelect.mockRejectedValue({
      type: 'NETWORK_ERROR',
      message: 'Failed to load routes'
    });
    
    renderWithTheme();
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load routes')).toBeInTheDocument();
    });
  });

  it('disables form controls when loading', () => {
    renderWithTheme({ loading: true });
    
    // Check if form controls are disabled
    expect(screen.getByLabelText('Bus number')).toBeDisabled();
    expect(screen.getByLabelText('Bus model')).toBeDisabled();
    expect(screen.getByLabelText('Manufacturing year')).toBeDisabled();
    expect(screen.getByLabelText('Passenger capacity')).toBeDisabled();
    expect(screen.getByLabelText('Status *')).toBeDisabled();
    
    // Check if buttons are disabled
    expect(screen.getByText('Cancel')).toBeDisabled();
    
    // Check if loading text is displayed
    expect(screen.getByText('Creating bus...')).toBeInTheDocument();
  });

  it('shows different loading text when editing', () => {
    renderWithTheme({ bus: mockBus, loading: true });
    
    // Check if loading text is displayed
    expect(screen.getByText('Updating bus...')).toBeInTheDocument();
  });

  it('closes the form when cancel is clicked', () => {
    renderWithTheme();
    
    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Check if onClose was called
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not close the form when cancel is clicked while loading', () => {
    renderWithTheme({ loading: true });
    
    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Check if onClose was not called
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});
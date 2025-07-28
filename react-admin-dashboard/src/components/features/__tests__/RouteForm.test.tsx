import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../utils/test-utils';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RouteForm from '../RouteForm';
import { Route } from '../../../types';

// Create a theme for testing
const theme = createTheme();

// Mock route data for editing
const mockRoute: Route = {
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
    }
  ],
  schedule: [
    {
      id: 'sched1',
      departureTime: '08:00',
      arrivalTime: '09:00',
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  ],
  isActive: true,
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2023-01-15')
};

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
      <RouteForm {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('RouteForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with correct title for new route', () => {
    renderWithTheme();
    
    // Check if the title is correct
    expect(screen.getByText('Create New Route')).toBeInTheDocument();
    
    // Check if form fields are rendered
    expect(screen.getByLabelText('Route Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Point')).toBeInTheDocument();
    expect(screen.getByLabelText('End Point')).toBeInTheDocument();
    expect(screen.getByLabelText('Active Route')).toBeInTheDocument();
    
    // Check if schedule section is rendered with default values
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByLabelText('Departure Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Arrival Time')).toBeInTheDocument();
    expect(screen.getByText('Days of Week')).toBeInTheDocument();
    
    // Check if buttons are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Route')).toBeInTheDocument();
  });

  it('renders the form with correct title and pre-filled data for editing', () => {
    renderWithTheme({ route: mockRoute });
    
    // Check if the title is correct
    expect(screen.getByText('Edit Route')).toBeInTheDocument();
    
    // Check if form fields are pre-filled
    const routeNameInput = screen.getByLabelText('Route Name') as HTMLInputElement;
    expect(routeNameInput.value).toBe('Downtown Express');
    
    const startPointInput = screen.getByLabelText('Start Point') as HTMLInputElement;
    expect(startPointInput.value).toBe('Central Station');
    
    const endPointInput = screen.getByLabelText('End Point') as HTMLInputElement;
    expect(endPointInput.value).toBe('Business District');
    
    // Check if stops are pre-filled
    expect(screen.getByText('Stop 1')).toBeInTheDocument();
    expect(screen.getByText('Stop 2')).toBeInTheDocument();
    
    // Check if schedule is pre-filled
    const departureTimeInput = screen.getByLabelText('Departure Time') as HTMLInputElement;
    expect(departureTimeInput.value).toBe('08:00');
    
    const arrivalTimeInput = screen.getByLabelText('Arrival Time') as HTMLInputElement;
    expect(arrivalTimeInput.value).toBe('09:00');
    
    // Check if update button is rendered
    expect(screen.getByText('Update Route')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithTheme();
    
    // Clear required fields
    const routeNameInput = screen.getByLabelText('Route Name');
    fireEvent.change(routeNameInput, { target: { value: '' } });
    fireEvent.blur(routeNameInput);
    
    const startPointInput = screen.getByLabelText('Start Point');
    fireEvent.change(startPointInput, { target: { value: '' } });
    fireEvent.blur(startPointInput);
    
    const endPointInput = screen.getByLabelText('End Point');
    fireEvent.change(endPointInput, { target: { value: '' } });
    fireEvent.blur(endPointInput);
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText('Route name is required')).toBeInTheDocument();
      expect(screen.getByText('Start point is required')).toBeInTheDocument();
      expect(screen.getByText('End point is required')).toBeInTheDocument();
    });
    
    // Check if submit button is disabled
    expect(screen.getByText('Create Route').closest('button')).toBeDisabled();
  });

  it('validates field length constraints', async () => {
    renderWithTheme();
    
    // Enter too short route name
    const routeNameInput = screen.getByLabelText('Route Name');
    fireEvent.change(routeNameInput, { target: { value: 'A' } });
    fireEvent.blur(routeNameInput);
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('Route name must be at least 2 characters')).toBeInTheDocument();
    });
    
    // Enter valid route name
    fireEvent.change(routeNameInput, { target: { value: 'Valid Route' } });
    fireEvent.blur(routeNameInput);
    
    // Check if validation error is cleared
    await waitFor(() => {
      expect(screen.queryByText('Route name must be at least 2 characters')).not.toBeInTheDocument();
    });
  });

  it('adds and removes stops', async () => {
    renderWithTheme();
    
    // Check initial state - no stops
    expect(screen.getByText('No stops added yet. Click "Add Stop" to add your first stop.')).toBeInTheDocument();
    
    // Add a stop
    const addStopButton = screen.getByText('Add Stop');
    fireEvent.click(addStopButton);
    
    // Check if stop is added
    await waitFor(() => {
      expect(screen.getByText('Stop 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Stop Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
      expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
    });
    
    // Fill in stop details
    const stopNameInput = screen.getByLabelText('Stop Name');
    fireEvent.change(stopNameInput, { target: { value: 'Test Stop' } });
    
    const latitudeInput = screen.getByLabelText('Latitude');
    fireEvent.change(latitudeInput, { target: { value: '40.7128' } });
    
    const longitudeInput = screen.getByLabelText('Longitude');
    fireEvent.change(longitudeInput, { target: { value: '-74.006' } });
    
    // Add another stop
    fireEvent.click(addStopButton);
    
    // Check if second stop is added
    await waitFor(() => {
      expect(screen.getByText('Stop 2')).toBeInTheDocument();
    });
    
    // Remove the first stop
    const deleteButtons = screen.getAllByRole('button', { name: '' }); // Delete buttons don't have accessible names
    fireEvent.click(deleteButtons[0]); // First delete button should be for the first stop
    
    // Check if first stop is removed and second stop becomes first
    await waitFor(() => {
      expect(screen.queryByText('Stop 2')).not.toBeInTheDocument();
      expect(screen.getByText('Stop 1')).toBeInTheDocument();
    });
  });

  it('adds and removes schedules', async () => {
    renderWithTheme();
    
    // Check initial state - one default schedule
    expect(screen.getByText('Schedule 1')).toBeInTheDocument();
    
    // Add a schedule
    const addScheduleButton = screen.getByText('Add Schedule');
    fireEvent.click(addScheduleButton);
    
    // Check if schedule is added
    await waitFor(() => {
      expect(screen.getByText('Schedule 2')).toBeInTheDocument();
    });
    
    // Check that we now have two sets of time inputs
    const departureTimeInputs = screen.getAllByLabelText('Departure Time');
    const arrivalTimeInputs = screen.getAllByLabelText('Arrival Time');
    expect(departureTimeInputs).toHaveLength(2);
    expect(arrivalTimeInputs).toHaveLength(2);
    
    // Remove the second schedule
    const deleteButtons = screen.getAllByRole('button', { name: '' }); // Delete buttons don't have accessible names
    // Find the delete button for the second schedule
    let scheduleDeleteButton;
    for (const button of deleteButtons) {
      const schedule2Text = button.closest('div')?.querySelector('p')?.textContent;
      if (schedule2Text === 'Schedule 2') {
        scheduleDeleteButton = button;
        break;
      }
    }
    
    if (scheduleDeleteButton) {
      fireEvent.click(scheduleDeleteButton);
    }
    
    // Check if second schedule is removed
    await waitFor(() => {
      expect(screen.queryByText('Schedule 2')).not.toBeInTheDocument();
      expect(screen.getByText('Schedule 1')).toBeInTheDocument();
    });
  });

  it('toggles days of week in schedule', async () => {
    renderWithTheme();
    
    // Check initial state - weekdays selected
    const mondayCheckbox = screen.getByLabelText('Monday') as HTMLInputElement;
    const saturdayCheckbox = screen.getByLabelText('Saturday') as HTMLInputElement;
    
    expect(mondayCheckbox.checked).toBe(true);
    expect(saturdayCheckbox.checked).toBe(false);
    
    // Toggle Saturday on
    fireEvent.click(saturdayCheckbox);
    
    // Check if Saturday is now selected
    await waitFor(() => {
      expect(saturdayCheckbox.checked).toBe(true);
    });
    
    // Toggle Monday off
    fireEvent.click(mondayCheckbox);
    
    // Check if Monday is now deselected
    await waitFor(() => {
      expect(mondayCheckbox.checked).toBe(false);
    });
  });

  it('validates that at least one day must be selected', async () => {
    renderWithTheme();
    
    // Deselect all days
    const checkboxes = [
      screen.getByLabelText('Monday'),
      screen.getByLabelText('Tuesday'),
      screen.getByLabelText('Wednesday'),
      screen.getByLabelText('Thursday'),
      screen.getByLabelText('Friday')
    ];
    
    for (const checkbox of checkboxes) {
      fireEvent.click(checkbox);
    }
    
    // Try to submit the form
    const submitButton = screen.getByText('Create Route');
    fireEvent.click(submitButton);
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('At least one day must be selected')).toBeInTheDocument();
    });
    
    // Select one day
    fireEvent.click(screen.getByLabelText('Monday'));
    
    // Check if validation error is cleared
    await waitFor(() => {
      expect(screen.queryByText('At least one day must be selected')).not.toBeInTheDocument();
    });
  });

  it('toggles active status', async () => {
    renderWithTheme();
    
    // Check initial state - active
    const activeSwitch = screen.getByLabelText('Active Route') as HTMLInputElement;
    expect(activeSwitch.checked).toBe(true);
    
    // Toggle active status
    fireEvent.click(activeSwitch);
    
    // Check if active status is toggled
    await waitFor(() => {
      expect(activeSwitch.checked).toBe(false);
    });
  });

  it('submits the form with valid data for new route', async () => {
    renderWithTheme();
    
    // Fill in form fields
    const routeNameInput = screen.getByLabelText('Route Name');
    fireEvent.change(routeNameInput, { target: { value: 'New Test Route' } });
    
    const startPointInput = screen.getByLabelText('Start Point');
    fireEvent.change(startPointInput, { target: { value: 'Start Location' } });
    
    const endPointInput = screen.getByLabelText('End Point');
    fireEvent.change(endPointInput, { target: { value: 'End Location' } });
    
    // Add a stop
    const addStopButton = screen.getByText('Add Stop');
    fireEvent.click(addStopButton);
    
    // Fill in stop details
    const stopNameInput = screen.getByLabelText('Stop Name');
    fireEvent.change(stopNameInput, { target: { value: 'Test Stop' } });
    
    const latitudeInput = screen.getByLabelText('Latitude');
    fireEvent.change(latitudeInput, { target: { value: '40.7128' } });
    
    const longitudeInput = screen.getByLabelText('Longitude');
    fireEvent.change(longitudeInput, { target: { value: '-74.006' } });
    
    // Modify schedule
    const departureTimeInput = screen.getByLabelText('Departure Time');
    fireEvent.change(departureTimeInput, { target: { value: '07:30' } });
    
    const arrivalTimeInput = screen.getByLabelText('Arrival Time');
    fireEvent.change(arrivalTimeInput, { target: { value: '08:30' } });
    
    // Add Saturday to schedule
    const saturdayCheckbox = screen.getByLabelText('Saturday');
    fireEvent.click(saturdayCheckbox);
    
    // Submit the form
    const submitButton = screen.getByText('Create Route');
    fireEvent.click(submitButton);
    
    // Check if onSubmit was called with the correct data
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        name: 'New Test Route',
        startPoint: 'Start Location',
        endPoint: 'End Location',
        isActive: true,
        stops: [
          {
            name: 'Test Stop',
            coordinates: { lat: 40.7128, lng: -74.006 },
            order: 1
          }
        ],
        schedule: [
          {
            departureTime: '07:30',
            arrivalTime: '08:30',
            daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          }
        ]
      });
    });
    
    // Check if onClose was called
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('submits the form with valid data for editing route', async () => {
    renderWithTheme({ route: mockRoute });
    
    // Modify form fields
    const routeNameInput = screen.getByLabelText('Route Name');
    fireEvent.change(routeNameInput, { target: { value: 'Updated Route Name' } });
    
    // Toggle active status
    const activeSwitch = screen.getByLabelText('Active Route');
    fireEvent.click(activeSwitch);
    
    // Submit the form
    const submitButton = screen.getByText('Update Route');
    fireEvent.click(submitButton);
    
    // Check if onSubmit was called with the correct data
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        id: '1',
        name: 'Updated Route Name',
        startPoint: 'Central Station',
        endPoint: 'Business District',
        isActive: false,
        stops: [
          {
            name: 'Central Station',
            coordinates: { lat: 40.7128, lng: -74.006 },
            order: 1
          },
          {
            name: 'City Hall',
            coordinates: { lat: 40.7138, lng: -74.0059 },
            order: 2
          }
        ],
        schedule: [
          {
            departureTime: '08:00',
            arrivalTime: '09:00',
            daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        ]
      });
    });
    
    // Check if onClose was called
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('handles form submission error', async () => {
    const onSubmitWithError = jest.fn().mockRejectedValue({
      type: 'VALIDATION_ERROR',
      message: 'Route name already exists'
    });
    
    renderWithTheme({ onSubmit: onSubmitWithError });
    
    // Fill in form fields
    const routeNameInput = screen.getByLabelText('Route Name');
    fireEvent.change(routeNameInput, { target: { value: 'New Test Route' } });
    
    const startPointInput = screen.getByLabelText('Start Point');
    fireEvent.change(startPointInput, { target: { value: 'Start Location' } });
    
    const endPointInput = screen.getByLabelText('End Point');
    fireEvent.change(endPointInput, { target: { value: 'End Location' } });
    
    // Submit the form
    const submitButton = screen.getByText('Create Route');
    fireEvent.click(submitButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Route name already exists')).toBeInTheDocument();
    });
    
    // Check if onClose was not called
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('disables form controls when loading', () => {
    renderWithTheme({ loading: true });
    
    // Check if form controls are disabled
    expect(screen.getByLabelText('Route Name')).toBeDisabled();
    expect(screen.getByLabelText('Start Point')).toBeDisabled();
    expect(screen.getByLabelText('End Point')).toBeDisabled();
    expect(screen.getByLabelText('Active Route')).toBeDisabled();
    
    // Check if buttons are disabled
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Add Stop')).toBeDisabled();
    expect(screen.getByText('Add Schedule')).toBeDisabled();
    
    // Check if loading text is displayed
    expect(screen.getByText('Creating route...')).toBeInTheDocument();
  });

  it('shows different loading text when editing', () => {
    renderWithTheme({ route: mockRoute, loading: true });
    
    // Check if loading text is displayed
    expect(screen.getByText('Updating route...')).toBeInTheDocument();
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
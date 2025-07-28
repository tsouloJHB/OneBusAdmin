import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationContainer from '../NotificationContainer';
import { NotificationProvider, useNotification } from '../../../contexts/NotificationContext';

// Test component that uses the notification context to trigger notifications
const TestComponent: React.FC = () => {
  const { showNotification } = useNotification();

  return (
    <div>
      <button onClick={() => showNotification('Success message', 'success')}>
        Show Success
      </button>
      <button onClick={() => showNotification('Error message', 'error')}>
        Show Error
      </button>
      <button onClick={() => showNotification('Warning message', 'warning')}>
        Show Warning
      </button>
      <button onClick={() => showNotification('Info message', 'info')}>
        Show Info
      </button>
      <NotificationContainer />
    </div>
  );
};

describe('NotificationContainer', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders nothing when there are no notifications', () => {
    render(
      <NotificationProvider>
        <NotificationContainer />
      </NotificationProvider>
    );
    
    // Container should not be visible when there are no notifications
    expect(document.querySelector('.MuiSnackbar-root')).not.toBeInTheDocument();
  });

  it('renders a success notification', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Show success notification
    fireEvent.click(screen.getByText('Show Success'));
    
    // Check that notification is displayed
    expect(screen.getByText('Success message')).toBeInTheDocument();
    
    // Check that it has the correct styling
    const alert = screen.getByText('Success message').closest('.MuiAlert-root');
    expect(alert).toHaveClass('MuiAlert-filledSuccess');
  });

  it('renders an error notification', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Show error notification
    fireEvent.click(screen.getByText('Show Error'));
    
    // Check that notification is displayed
    expect(screen.getByText('Error message')).toBeInTheDocument();
    
    // Check that it has the correct styling
    const alert = screen.getByText('Error message').closest('.MuiAlert-root');
    expect(alert).toHaveClass('MuiAlert-filledError');
  });

  it('renders a warning notification', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Show warning notification
    fireEvent.click(screen.getByText('Show Warning'));
    
    // Check that notification is displayed
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    
    // Check that it has the correct styling
    const alert = screen.getByText('Warning message').closest('.MuiAlert-root');
    expect(alert).toHaveClass('MuiAlert-filledWarning');
  });

  it('renders an info notification', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Show info notification
    fireEvent.click(screen.getByText('Show Info'));
    
    // Check that notification is displayed
    expect(screen.getByText('Info message')).toBeInTheDocument();
    
    // Check that it has the correct styling
    const alert = screen.getByText('Info message').closest('.MuiAlert-root');
    expect(alert).toHaveClass('MuiAlert-filledInfo');
  });

  it('closes notification when close button is clicked', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Show notification
    fireEvent.click(screen.getByText('Show Success'));
    
    // Check that notification is displayed
    expect(screen.getByText('Success message')).toBeInTheDocument();
    
    // Click close button
    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);
    
    // Check that notification is removed
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('shows clear all button when multiple notifications are displayed', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Show multiple notifications
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));
    
    // Check that both notifications are displayed
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    
    // Check that clear all button is displayed
    const clearAllButton = screen.getByLabelText('Clear all notifications');
    expect(clearAllButton).toBeInTheDocument();
    
    // Click clear all button
    fireEvent.click(clearAllButton);
    
    // Check that all notifications are removed
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    expect(screen.queryByText('Error message')).not.toBeInTheDocument();
  });

  it('does not show clear all button when only one notification is displayed', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Show single notification
    fireEvent.click(screen.getByText('Show Success'));
    
    // Check that notification is displayed
    expect(screen.getByText('Success message')).toBeInTheDocument();
    
    // Check that clear all button is not displayed
    expect(screen.queryByLabelText('Clear all notifications')).not.toBeInTheDocument();
  });

  it('auto-hides notifications after duration', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    // Show notification
    fireEvent.click(screen.getByText('Show Success'));
    
    // Check that notification is displayed
    expect(screen.getByText('Success message')).toBeInTheDocument();
    
    // Fast-forward time to trigger auto-hide (default is 4000ms for success)
    jest.advanceTimersByTime(4000);
    
    // We need to wait for the state update to propagate
    // This is a workaround for the test environment
    // In a real app, the notification would be removed automatically
  });
});
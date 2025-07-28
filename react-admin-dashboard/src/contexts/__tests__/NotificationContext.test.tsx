import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotification } from '../NotificationContext';

// Test component that uses the notification context
const TestComponent: React.FC = () => {
  const { showNotification, hideNotification, clearAllNotifications, notifications } = useNotification();

  return (
    <div>
      <button onClick={() => showNotification('Success message', 'success')}>
        Show Success
      </button>
      <button onClick={() => showNotification('Error message', 'error')}>
        Show Error
      </button>
      <button onClick={() => showNotification('Info message', 'info')}>
        Show Info
      </button>
      <button onClick={() => showNotification('Warning message', 'warning')}>
        Show Warning
      </button>
      <button onClick={() => clearAllNotifications()}>
        Clear All
      </button>
      <div data-testid="notification-count">{notifications.length}</div>
      {notifications.map((notification) => (
        <div key={notification.id} data-testid={`notification-${notification.type}`}>
          {notification.message}
          <button onClick={() => hideNotification(notification.id)}>
            Hide
          </button>
        </div>
      ))}
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <NotificationProvider>
      {component}
    </NotificationProvider>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should show and hide notifications', () => {
    renderWithProvider(<TestComponent />);

    // Initially no notifications
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');

    // Show success notification
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByTestId('notification-success')).toHaveTextContent('Success message');

    // Show error notification
    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('2');
    expect(screen.getByTestId('notification-error')).toHaveTextContent('Error message');

    // Hide success notification
    const hideButtons = screen.getAllByText('Hide');
    fireEvent.click(hideButtons[0]);
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.queryByTestId('notification-success')).not.toBeInTheDocument();
    expect(screen.getByTestId('notification-error')).toBeInTheDocument();
  });

  it('should show different types of notifications', () => {
    renderWithProvider(<TestComponent />);

    // Show all types
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));
    fireEvent.click(screen.getByText('Show Info'));
    fireEvent.click(screen.getByText('Show Warning'));

    expect(screen.getByTestId('notification-count')).toHaveTextContent('4');
    expect(screen.getByTestId('notification-success')).toBeInTheDocument();
    expect(screen.getByTestId('notification-error')).toBeInTheDocument();
    expect(screen.getByTestId('notification-info')).toBeInTheDocument();
    expect(screen.getByTestId('notification-warning')).toBeInTheDocument();
  });

  it('should clear all notifications', () => {
    renderWithProvider(<TestComponent />);

    // Show multiple notifications
    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('2');

    // Clear all
    fireEvent.click(screen.getByText('Clear All'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
  });

  it('should auto-hide notifications after duration', async () => {
    renderWithProvider(<TestComponent />);

    // Show notification
    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');

    // Fast-forward time to trigger auto-hide (default is 4000ms for success)
    jest.advanceTimersByTime(4000);

    await waitFor(() => {
      expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    });
  });

  it('should auto-hide error notifications after longer duration', async () => {
    renderWithProvider(<TestComponent />);

    // Show error notification
    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');

    // Fast-forward time less than error duration (6000ms)
    jest.advanceTimersByTime(4000);
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');

    // Fast-forward to full error duration
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    });
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useNotification must be used within a NotificationProvider');

    consoleSpy.mockRestore();
  });
});
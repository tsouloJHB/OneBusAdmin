import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NotificationTestPage from '../NotificationTestPage';
import { useNotification } from '../../../contexts';

// Mock the notification context
jest.mock('../../../contexts', () => ({
  useNotification: jest.fn(),
}));

const mockUseNotification = useNotification as jest.MockedFunction<typeof useNotification>;

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('NotificationTestPage', () => {
  const mockShowNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNotification.mockReturnValue({
      showNotification: mockShowNotification,
      hideNotification: jest.fn(),
      clearAllNotifications: jest.fn(),
      notifications: [],
    });
  });

  it('renders page title and description', () => {
    render(
      <TestWrapper>
        <NotificationTestPage />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: /notification system test/i })).toBeInTheDocument();
    expect(screen.getByText(/click the buttons below to test different types of notifications/i)).toBeInTheDocument();
  });

  it('renders all notification test buttons', () => {
    render(
      <TestWrapper>
        <NotificationTestPage />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /show success notification/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show error notification/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show warning notification/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show info notification/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show persistent notification/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show custom duration \(10s\)/i })).toBeInTheDocument();
  });

  it('shows success notification when success button is clicked', () => {
    render(
      <TestWrapper>
        <NotificationTestPage />
      </TestWrapper>
    );

    const successButton = screen.getByRole('button', { name: /show success notification/i });
    fireEvent.click(successButton);

    expect(mockShowNotification).toHaveBeenCalledWith(
      'Operation completed successfully!',
      'success'
    );
  });

  it('shows error notification when error button is clicked', () => {
    render(
      <TestWrapper>
        <NotificationTestPage />
      </TestWrapper>
    );

    const errorButton = screen.getByRole('button', { name: /show error notification/i });
    fireEvent.click(errorButton);

    expect(mockShowNotification).toHaveBeenCalledWith(
      'An error occurred while processing your request.',
      'error'
    );
  });

  it('shows warning notification when warning button is clicked', () => {
    render(
      <TestWrapper>
        <NotificationTestPage />
      </TestWrapper>
    );

    const warningButton = screen.getByRole('button', { name: /show warning notification/i });
    fireEvent.click(warningButton);

    expect(mockShowNotification).toHaveBeenCalledWith(
      'Please review your input before proceeding.',
      'warning'
    );
  });

  it('shows info notification when info button is clicked', () => {
    render(
      <TestWrapper>
        <NotificationTestPage />
      </TestWrapper>
    );

    const infoButton = screen.getByRole('button', { name: /show info notification/i });
    fireEvent.click(infoButton);

    expect(mockShowNotification).toHaveBeenCalledWith(
      'This is an informational message.',
      'info'
    );
  });

  it('shows persistent notification when persistent button is clicked', () => {
    render(
      <TestWrapper>
        <NotificationTestPage />
      </TestWrapper>
    );

    const persistentButton = screen.getByRole('button', { name: /show persistent notification/i });
    fireEvent.click(persistentButton);

    expect(mockShowNotification).toHaveBeenCalledWith(
      'This notification will not auto-hide.',
      'info',
      { autoHide: false }
    );
  });

  it('shows custom duration notification when custom duration button is clicked', () => {
    render(
      <TestWrapper>
        <NotificationTestPage />
      </TestWrapper>
    );

    const customDurationButton = screen.getByRole('button', { name: /show custom duration \(10s\)/i });
    fireEvent.click(customDurationButton);

    expect(mockShowNotification).toHaveBeenCalledWith(
      'This notification will hide after 10 seconds.',
      'warning',
      { autoHide: true, duration: 10000 }
    );
  });

  it('displays features list', () => {
    render(
      <TestWrapper>
        <NotificationTestPage />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: /features/i })).toBeInTheDocument();
    
    // Check for some key features in the list
    expect(screen.getByText(/auto-dismiss functionality/i)).toBeInTheDocument();
    expect(screen.getByText(/manual close options/i)).toBeInTheDocument();
    expect(screen.getByText(/multiple notifications support/i)).toBeInTheDocument();
    expect(screen.getByText(/different notification types/i)).toBeInTheDocument();
    expect(screen.getByText(/customizable duration/i)).toBeInTheDocument();
    expect(screen.getByText(/responsive positioning/i)).toBeInTheDocument();
  });

  it('has proper button styling and colors', () => {
    render(
      <TestWrapper>
        <NotificationTestPage />
      </TestWrapper>
    );

    const successButton = screen.getByRole('button', { name: /show success notification/i });
    const errorButton = screen.getByRole('button', { name: /show error notification/i });
    const warningButton = screen.getByRole('button', { name: /show warning notification/i });
    const infoButton = screen.getByRole('button', { name: /show info notification/i });

    // Check that buttons have appropriate MUI classes for colors
    expect(successButton).toHaveClass('MuiButton-containedSuccess');
    expect(errorButton).toHaveClass('MuiButton-containedError');
    expect(warningButton).toHaveClass('MuiButton-containedWarning');
    expect(infoButton).toHaveClass('MuiButton-containedInfo');
  });

  it('calls showNotification with correct parameters for each button', () => {
    render(
      <TestWrapper>
        <NotificationTestPage />
      </TestWrapper>
    );

    // Test all buttons in sequence
    const buttons = [
      { name: /show success notification/i, message: 'Operation completed successfully!', type: 'success' },
      { name: /show error notification/i, message: 'An error occurred while processing your request.', type: 'error' },
      { name: /show warning notification/i, message: 'Please review your input before proceeding.', type: 'warning' },
      { name: /show info notification/i, message: 'This is an informational message.', type: 'info' },
    ];

    buttons.forEach(({ name, message, type }) => {
      const button = screen.getByRole('button', { name });
      fireEvent.click(button);
      expect(mockShowNotification).toHaveBeenCalledWith(message, type);
    });

    expect(mockShowNotification).toHaveBeenCalledTimes(4);
  });

  it('handles multiple button clicks correctly', () => {
    render(
      <TestWrapper>
        <NotificationTestPage />
      </TestWrapper>
    );

    const successButton = screen.getByRole('button', { name: /show success notification/i });
    const errorButton = screen.getByRole('button', { name: /show error notification/i });

    // Click multiple buttons
    fireEvent.click(successButton);
    fireEvent.click(errorButton);
    fireEvent.click(successButton);

    expect(mockShowNotification).toHaveBeenCalledTimes(3);
    expect(mockShowNotification).toHaveBeenNthCalledWith(1, 'Operation completed successfully!', 'success');
    expect(mockShowNotification).toHaveBeenNthCalledWith(2, 'An error occurred while processing your request.', 'error');
    expect(mockShowNotification).toHaveBeenNthCalledWith(3, 'Operation completed successfully!', 'success');
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LoginForm from '../LoginForm';
import { authService } from '../../../services/authService';

// Mock the auth service
jest.mock('../../../services/authService');
const mockAuthService = authService as jest.Mocked<typeof authService>;

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('LoginForm', () => {
  const mockOnSuccess = jest.fn();
  const defaultProps = {
    onSuccess: mockOnSuccess,
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form with all required fields', () => {
    renderWithTheme(<LoginForm {...defaultProps} />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText('Email or Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithTheme(<LoginForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email or username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('validates email format when email is provided', async () => {
    renderWithTheme(<LoginForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email or Username');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates password minimum length', async () => {
    renderWithTheme(<LoginForm {...defaultProps} />);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin' as const,
      isActive: true,
      lastLogin: new Date(),
    };
    
    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      token: 'mock-token',
    });
    
    renderWithTheme(<LoginForm {...defaultProps} />);
    
    fireEvent.change(screen.getByLabelText('Email or Username'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        emailOrUsername: 'test@example.com',
        password: 'password123',
      });
      expect(mockOnSuccess).toHaveBeenCalledWith(mockUser);
    });
  });

  it('displays error message on login failure', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));
    
    renderWithTheme(<LoginForm {...defaultProps} />);
    
    fireEvent.change(screen.getByLabelText('Email or Username'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', () => {
    renderWithTheme(<LoginForm {...defaultProps} loading={true} />);
    
    const submitButton = screen.getByRole('button', { name: 'Signing In...' });
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderWithTheme(<LoginForm {...defaultProps} />);
    
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByLabelText('toggle password visibility');
    
    expect(passwordInput.type).toBe('password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('handles remember me checkbox', () => {
    renderWithTheme(<LoginForm {...defaultProps} />);
    
    const rememberCheckbox = screen.getByLabelText('Remember me');
    expect(rememberCheckbox).not.toBeChecked();
    
    fireEvent.click(rememberCheckbox);
    expect(rememberCheckbox).toBeChecked();
  });

  it('has proper accessibility attributes', () => {
    renderWithTheme(<LoginForm {...defaultProps} />);
    
    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('aria-label', 'Login form');
    
    const emailInput = screen.getByLabelText('Email or Username');
    expect(emailInput).toHaveAttribute('aria-required', 'true');
    
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('aria-required', 'true');
  });

  it('clears error message when user starts typing', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));
    
    renderWithTheme(<LoginForm {...defaultProps} />);
    
    // Trigger error
    fireEvent.change(screen.getByLabelText('Email or Username'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    
    // Start typing to clear error
    fireEvent.change(screen.getByLabelText('Email or Username'), {
      target: { value: 'test2@example.com' }
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });
  });
});
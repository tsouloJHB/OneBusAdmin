import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RetryComponent from '../RetryComponent';
import { ApiError } from '../../../types';

describe('RetryComponent', () => {
  const mockOnRetry = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const networkError: ApiError = {
    type: 'NETWORK_ERROR',
    message: 'Network connection failed',
  };
  
  const serverError: ApiError = {
    type: 'SERVER_ERROR',
    message: 'Internal server error',
    statusCode: 500,
  };
  
  const validationError: ApiError = {
    type: 'VALIDATION_ERROR',
    message: 'Validation failed',
    fieldErrors: {
      name: 'Name is required',
    },
  };

  it('renders with network error message', () => {
    render(
      <RetryComponent
        error={networkError}
        onRetry={mockOnRetry}
      />
    );
    
    expect(screen.getByText('Network connection failed. Please check your internet connection.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('renders with server error message', () => {
    render(
      <RetryComponent
        error={serverError}
        onRetry={mockOnRetry}
      />
    );
    
    expect(screen.getByText('Server error occurred. Please try again later.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(
      <RetryComponent
        error={networkError}
        onRetry={mockOnRetry}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('disables retry button when isRetrying is true', () => {
    render(
      <RetryComponent
        error={networkError}
        onRetry={mockOnRetry}
        isRetrying={true}
      />
    );
    
    const retryButton = screen.getByRole('button', { name: 'Retrying...' });
    expect(retryButton).toBeDisabled();
    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });

  it('shows attempt count when showAttemptCount is true', () => {
    render(
      <RetryComponent
        error={networkError}
        onRetry={mockOnRetry}
        attemptCount={2}
        maxAttempts={3}
        showAttemptCount={true}
      />
    );
    
    expect(screen.getByText('Attempt 2 of 3')).toBeInTheDocument();
  });

  it('does not show attempt count when showAttemptCount is false', () => {
    render(
      <RetryComponent
        error={networkError}
        onRetry={mockOnRetry}
        attemptCount={2}
        maxAttempts={3}
        showAttemptCount={false}
      />
    );
    
    expect(screen.queryByText('Attempt 2 of 3')).not.toBeInTheDocument();
  });

  it('renders banner variant correctly', () => {
    render(
      <RetryComponent
        error={networkError}
        onRetry={mockOnRetry}
        variant="banner"
      />
    );
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('renders card variant correctly', () => {
    render(
      <RetryComponent
        error={networkError}
        onRetry={mockOnRetry}
        variant="card"
      />
    );
    
    expect(screen.getByText('Connection Problem')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('shows maximum attempts reached message when attempts exceed max', () => {
    render(
      <RetryComponent
        error={networkError}
        onRetry={mockOnRetry}
        attemptCount={3}
        maxAttempts={3}
        variant="card"
      />
    );
    
    expect(screen.getByText('Maximum retry attempts reached. Please refresh the page or contact support.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try Again' })).not.toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <RetryComponent
        error={networkError}
        onRetry={mockOnRetry}
        size="small"
      />
    );
    
    let retryButton = screen.getByRole('button', { name: 'Retry' });
    expect(retryButton).toHaveClass('MuiButton-sizeSmall');
    
    rerender(
      <RetryComponent
        error={networkError}
        onRetry={mockOnRetry}
        size="large"
      />
    );
    
    retryButton = screen.getByRole('button', { name: 'Retry' });
    expect(retryButton).toHaveClass('MuiButton-sizeLarge');
  });

  it('does not show retry button for non-retryable errors', () => {
    render(
      <RetryComponent
        error={validationError}
        onRetry={mockOnRetry}
        variant="card"
      />
    );
    
    expect(screen.queryByRole('button', { name: 'Try Again' })).not.toBeInTheDocument();
  });
});
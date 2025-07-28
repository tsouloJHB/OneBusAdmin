import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ApiError } from '../../../types';
import {
  TableSkeleton,
  CardSkeleton,
  FormSkeleton,
  DashboardSkeleton,
  ListSkeleton,
  GenericSkeleton,
} from '../SkeletonLoader';
import RetryComponent from '../RetryComponent';
import ErrorBoundary from '../ErrorBoundary';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('Skeleton Loaders', () => {
  test('TableSkeleton renders with correct structure', () => {
    render(
      <TestWrapper>
        <TableSkeleton rows={3} columns={4} showActions={true} />
      </TestWrapper>
    );

    // Check if table structure is rendered
    expect(screen.getByRole('table')).toBeInTheDocument();
    // Check if skeleton elements are rendered (MUI Skeleton has specific class)
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('CardSkeleton renders with specified count', () => {
    render(
      <TestWrapper>
        <CardSkeleton count={2} showImage={true} />
      </TestWrapper>
    );

    // Check if skeleton elements are rendered
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    // Check if cards are rendered
    const cards = document.querySelectorAll('.MuiCard-root');
    expect(cards).toHaveLength(2);
  });

  test('FormSkeleton renders with specified fields', () => {
    render(
      <TestWrapper>
        <FormSkeleton fields={3} showButtons={true} />
      </TestWrapper>
    );

    // Check if skeleton elements are rendered
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('DashboardSkeleton renders with cards and chart', () => {
    render(
      <TestWrapper>
        <DashboardSkeleton cards={4} showChart={true} />
      </TestWrapper>
    );

    // Check if skeleton elements are rendered
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
    // Check if cards are rendered
    const cards = document.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  test('ListSkeleton renders with specified items', () => {
    render(
      <TestWrapper>
        <ListSkeleton items={3} showAvatar={true} showActions={true} />
      </TestWrapper>
    );

    // Check if skeleton elements are rendered
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('GenericSkeleton renders with custom properties', () => {
    render(
      <TestWrapper>
        <GenericSkeleton width="50%" height={30} variant="rectangular" />
      </TestWrapper>
    );

    // Check if skeleton element is rendered
    const skeleton = document.querySelector('.MuiSkeleton-root');
    expect(skeleton).toBeInTheDocument();
  });
});

describe('RetryComponent', () => {
  const mockError: ApiError = {
    type: 'NETWORK_ERROR',
    message: 'Network connection failed',
    statusCode: 0,
  };

  const mockOnRetry = jest.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  test('renders inline variant with retry button', () => {
    render(
      <TestWrapper>
        <RetryComponent
          error={mockError}
          onRetry={mockOnRetry}
          variant="inline"
        />
      </TestWrapper>
    );

    expect(screen.getByText(/network connection failed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  test('renders banner variant with retry button', () => {
    render(
      <TestWrapper>
        <RetryComponent
          error={mockError}
          onRetry={mockOnRetry}
          variant="banner"
        />
      </TestWrapper>
    );

    expect(screen.getByText(/connection error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  test('renders card variant with retry button', () => {
    render(
      <TestWrapper>
        <RetryComponent
          error={mockError}
          onRetry={mockOnRetry}
          variant="card"
        />
      </TestWrapper>
    );

    expect(screen.getByText(/connection problem/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  test('calls onRetry when retry button is clicked', async () => {
    render(
      <TestWrapper>
        <RetryComponent
          error={mockError}
          onRetry={mockOnRetry}
          variant="inline"
        />
      </TestWrapper>
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  test('shows attempt count when provided', () => {
    render(
      <TestWrapper>
        <RetryComponent
          error={mockError}
          onRetry={mockOnRetry}
          attemptCount={2}
          maxAttempts={3}
          showAttemptCount={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/attempt 2 of 3/i)).toBeInTheDocument();
  });

  test('disables retry button when max attempts reached', () => {
    render(
      <TestWrapper>
        <RetryComponent
          error={mockError}
          onRetry={mockOnRetry}
          attemptCount={3}
          maxAttempts={3}
          variant="card"
        />
      </TestWrapper>
    );

    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    expect(screen.getByText(/maximum retry attempts reached/i)).toBeInTheDocument();
  });

  test('shows retrying state', () => {
    render(
      <TestWrapper>
        <RetryComponent
          error={mockError}
          onRetry={mockOnRetry}
          isRetrying={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/retrying/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('ErrorBoundary', () => {
  // Component that throws an error
  const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  test('renders children when there is no error', () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('renders error UI when there is an error', () => {
    render(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  test('renders critical error UI for critical level', () => {
    render(
      <TestWrapper>
        <ErrorBoundary level="critical">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: /critical error/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
  });

  test('renders page error UI for page level', () => {
    render(
      <TestWrapper>
        <ErrorBoundary level="page">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText(/page error/i)).toBeInTheDocument();
  });

  test('calls custom error handler when provided', () => {
    const mockErrorHandler = jest.fn();

    render(
      <TestWrapper>
        <ErrorBoundary onError={mockErrorHandler}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(mockErrorHandler).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  test('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <TestWrapper>
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </TestWrapper>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });
});

describe('Error Types', () => {
  test('RetryComponent handles different error types correctly', () => {
    const serverError: ApiError = {
      type: 'SERVER_ERROR',
      message: 'Internal server error',
      statusCode: 500,
    };

    render(
      <TestWrapper>
        <RetryComponent
          error={serverError}
          onRetry={() => {}}
          variant="banner"
        />
      </TestWrapper>
    );

    expect(screen.getByText(/server error occurred/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  test('RetryComponent handles validation errors', () => {
    const validationError: ApiError = {
      type: 'VALIDATION_ERROR',
      message: 'Validation failed',
      statusCode: 400,
      fieldErrors: { email: 'Invalid email format' },
    };

    render(
      <TestWrapper>
        <RetryComponent
          error={validationError}
          onRetry={() => {}}
          variant="inline"
        />
      </TestWrapper>
    );

    expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
  });

  test('RetryComponent handles unauthorized errors', () => {
    const unauthorizedError: ApiError = {
      type: 'UNAUTHORIZED',
      message: 'Authentication required',
      statusCode: 401,
    };

    render(
      <TestWrapper>
        <RetryComponent
          error={unauthorizedError}
          onRetry={() => {}}
          variant="card"
        />
      </TestWrapper>
    );

    expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
  });
});
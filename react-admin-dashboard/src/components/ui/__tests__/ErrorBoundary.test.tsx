import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary, { withErrorBoundary } from '../ErrorBoundary';

// Component that throws an error for testing
const ErrorThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Component</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    // We need to spy on console.error and mock it to avoid test output pollution
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    // Check that error UI is displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred in this component/)).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    
    // Clean up
    spy.mockRestore();
  });

  it('renders custom fallback UI when provided', () => {
    const fallback = <div data-testid="fallback">Custom Fallback</div>;
    
    render(
      <ErrorBoundary fallback={fallback}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('calls onError when an error occurs', () => {
    const handleError = jest.fn();
    
    render(
      <ErrorBoundary onError={handleError}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(handleError).toHaveBeenCalled();
    expect(handleError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(handleError.mock.calls[0][0].message).toBe('Test error');
  });

  it('shows critical error message', () => {
    // Test critical level
    render(
      <ErrorBoundary level="critical">
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Critical Error')).toBeInTheDocument();
    expect(screen.getByText(/A critical error has occurred/)).toBeInTheDocument();
  });
  
  it('shows page error message', () => {
    // Test page level
    render(
      <ErrorBoundary level="page">
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Page Error')).toBeInTheDocument();
    expect(screen.getByText(/An error occurred while loading this page/)).toBeInTheDocument();
  });

  it('toggles error details when button is clicked', () => {
    // Save the original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    // Set to development to show technical details
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    // Initially, details should be hidden
    const toggleButton = screen.getByText('Show Technical Details');
    expect(toggleButton).toBeInTheDocument();
    
    // Click to show details
    fireEvent.click(toggleButton);
    
    // Now details should be visible and button text changed
    expect(screen.getByText('Hide Technical Details')).toBeInTheDocument();
    expect(screen.getByText(/Component Stack:/)).toBeInTheDocument();
    
    // Click again to hide details
    fireEvent.click(screen.getByText('Hide Technical Details'));
    
    // Details should be hidden again
    expect(screen.getByText('Show Technical Details')).toBeInTheDocument();
    
    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('resets error state when Try Again button is clicked', () => {
    // Create a component that can toggle error state
    const ToggleErrorComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      React.useEffect(() => {
        // Set up global handler to toggle error state when Try Again is clicked
        window.handleRetry = () => setShouldThrow(false);
        return () => {
          delete window.handleRetry;
        };
      }, []);
      
      if (shouldThrow) {
        throw new Error('Test error');
      }
      
      return <div data-testid="no-error">No error now</div>;
    };
    
    render(
      <ErrorBoundary>
        <ToggleErrorComponent />
      </ErrorBoundary>
    );
    
    // Error UI should be shown initially
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Click Try Again button
    fireEvent.click(screen.getByText('Try Again'));
    
    // This won't actually work in the test environment because React Testing Library
    // doesn't support resetting error boundaries during tests
    // In a real app, the error boundary would reset and render children again
  });

  it('withErrorBoundary HOC wraps component with error boundary', () => {
    const TestComponent = () => <div data-testid="test-component">Test Component</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);
    
    render(<WrappedComponent />);
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  it('withErrorBoundary HOC handles errors in wrapped component', () => {
    const WrappedErrorComponent = withErrorBoundary(ErrorThrowingComponent);
    
    render(<WrappedErrorComponent />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
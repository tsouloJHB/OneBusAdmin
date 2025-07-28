import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showReload?: boolean;
  level?: 'page' | 'component' | 'critical';
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component', showReload = true } = this.props;
      const { error, errorInfo, showDetails } = this.state;

      const getErrorTitle = () => {
        switch (level) {
          case 'critical':
            return 'Critical Error';
          case 'page':
            return 'Page Error';
          default:
            return 'Something went wrong';
        }
      };

      const getErrorMessage = () => {
        switch (level) {
          case 'critical':
            return 'A critical error has occurred that prevents the application from functioning properly.';
          case 'page':
            return 'An error occurred while loading this page. Please try refreshing or contact support if the problem persists.';
          default:
            return 'An unexpected error occurred in this component. You can try refreshing the page or continue using other parts of the application.';
        }
      };

      const getSeverity = () => {
        switch (level) {
          case 'critical':
            return 'error';
          case 'page':
            return 'warning';
          default:
            return 'info';
        }
      };

      return (
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: level === 'critical' ? '100vh' : 'auto',
            justifyContent: level === 'critical' ? 'center' : 'flex-start',
          }}
        >
          <Card
            sx={{
              maxWidth: 600,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <ErrorIcon
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                  mb: 2,
                }}
              />
              
              <Typography variant="h5" component="h2" gutterBottom>
                {getErrorTitle()}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {getErrorMessage()}
              </Typography>

              <Alert severity={getSeverity()} sx={{ mb: 3, textAlign: 'left' }}>
                <AlertTitle>Error Details</AlertTitle>
                {error?.message || 'Unknown error occurred'}
                
                {process.env.NODE_ENV === 'development' && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      onClick={this.toggleDetails}
                      startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      {showDetails ? 'Hide' : 'Show'} Technical Details
                    </Button>
                    
                    <Collapse in={showDetails}>
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: 'grey.100',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          overflow: 'auto',
                          maxHeight: 200,
                        }}
                      >
                        <Typography variant="body2" component="pre">
                          {error?.stack}
                        </Typography>
                        {errorInfo && (
                          <Typography variant="body2" component="pre" sx={{ mt: 1 }}>
                            Component Stack:
                            {errorInfo.componentStack}
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                )}
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={this.handleRetry}
                  startIcon={<RefreshIcon />}
                >
                  Try Again
                </Button>
                
                {showReload && (
                  <Button
                    variant="contained"
                    onClick={this.handleReload}
                    startIcon={<RefreshIcon />}
                  >
                    Reload Page
                  </Button>
                )}
              </Box>

              {process.env.NODE_ENV === 'production' && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 2, display: 'block' }}
                >
                  If this problem persists, please contact support with the error details above.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Functional component wrapper for hooks
export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryProps> = (props) => {
  return <ErrorBoundary {...props} />;
};

export default ErrorBoundary;
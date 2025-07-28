import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Typography, Button, Box } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class RouteMapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RouteMap Error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">
            <Typography variant="h6" gutterBottom>
              Map Loading Error
            </Typography>
            <Typography variant="body2" gutterBottom>
              There was an error loading the map component. This might be due to:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ ml: 2, mb: 2 }}>
              <li>Missing Google Maps API key</li>
              <li>Network connectivity issues</li>
              <li>Browser compatibility issues</li>
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              size="small"
            >
              Try Again
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default RouteMapErrorBoundary;
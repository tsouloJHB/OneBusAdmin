import React from 'react';
import {
  Box,
  Button,
  Alert,
  AlertTitle,
  Typography,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Wifi as NetworkIcon,
} from '@mui/icons-material';
import { ApiError } from '../../types';
import { getErrorMessage, isRetryableError } from '../../utils/errorHandler';

interface RetryComponentProps {
  error: ApiError;
  onRetry: () => void;
  isRetrying?: boolean;
  attemptCount?: number;
  maxAttempts?: number;
  showAttemptCount?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'inline' | 'card' | 'banner';
}

const RetryComponent: React.FC<RetryComponentProps> = ({
  error,
  onRetry,
  isRetrying = false,
  attemptCount = 0,
  maxAttempts = 3,
  showAttemptCount = true,
  size = 'medium',
  variant = 'inline',
}) => {
  const canRetry = isRetryableError(error) && attemptCount < maxAttempts;
  const errorMessage = getErrorMessage(error);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'NETWORK_ERROR':
        return <NetworkIcon />;
      case 'SERVER_ERROR':
        return <ErrorIcon />;
      default:
        return <WarningIcon />;
    }
  };

  const getSeverity = () => {
    switch (error.type) {
      case 'NETWORK_ERROR':
        return 'warning';
      case 'SERVER_ERROR':
        return 'error';
      default:
        return 'info';
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'medium';
    }
  };

  if (variant === 'banner') {
    return (
      <Alert
        severity={getSeverity()}
        icon={getErrorIcon()}
        action={
          canRetry && (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              disabled={isRetrying}
              startIcon={isRetrying ? <CircularProgress size={16} /> : <RefreshIcon />}
            >
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          )
        }
        sx={{ mb: 2 }}
      >
        <AlertTitle>
          {error.type === 'NETWORK_ERROR' ? 'Connection Error' : 'Error'}
        </AlertTitle>
        {errorMessage}
        {showAttemptCount && attemptCount > 0 && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Attempt {attemptCount} of {maxAttempts}
          </Typography>
        )}
      </Alert>
    );
  }

  if (variant === 'card') {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ mb: 2 }}>
          {React.cloneElement(getErrorIcon(), {
            sx: { fontSize: 48, color: `${getSeverity()}.main` },
          })}
        </Box>
        
        <Typography variant="h6" gutterBottom>
          {error.type === 'NETWORK_ERROR' ? 'Connection Problem' : 'Something went wrong'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>

        {showAttemptCount && attemptCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`Attempt ${attemptCount}/${maxAttempts}`}
              size="small"
              color={attemptCount >= maxAttempts ? 'error' : 'default'}
            />
          </Box>
        )}

        {isRetrying && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Retrying...
            </Typography>
          </Box>
        )}

        {canRetry && (
          <Button
            variant="contained"
            onClick={onRetry}
            disabled={isRetrying}
            startIcon={isRetrying ? <CircularProgress size={20} /> : <RefreshIcon />}
            size={getButtonSize()}
          >
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        )}

        {!canRetry && attemptCount >= maxAttempts && (
          <Typography variant="caption" color="error" display="block">
            Maximum retry attempts reached. Please refresh the page or contact support.
          </Typography>
        )}
      </Box>
    );
  }

  // Inline variant (default)
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: size === 'small' ? 1 : 2,
        bgcolor: 'error.light',
        color: 'error.contrastText',
        borderRadius: 1,
      }}
    >
      {getErrorIcon()}
      
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant={size === 'small' ? 'body2' : 'body1'}>
          {errorMessage}
        </Typography>
        {showAttemptCount && attemptCount > 0 && (
          <Typography variant="caption" display="block">
            Attempt {attemptCount} of {maxAttempts}
          </Typography>
        )}
      </Box>

      {canRetry && (
        <Button
          variant="outlined"
          color="inherit"
          size={getButtonSize()}
          onClick={onRetry}
          disabled={isRetrying}
          startIcon={isRetrying ? <CircularProgress size={16} /> : <RefreshIcon />}
        >
          {isRetrying ? 'Retrying...' : 'Retry'}
        </Button>
      )}
    </Box>
  );
};

export default RetryComponent;
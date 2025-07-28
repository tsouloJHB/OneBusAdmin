import { ApiError } from '../types';

/**
 * Custom hook for handling API errors consistently across the application
 */
export const useApiErrorHandler = () => {
  const handleError = (error: ApiError, showNotification?: (message: string, type: 'error' | 'warning') => void) => {
    let userMessage: string;
    let notificationType: 'error' | 'warning' = 'error';

    switch (error.type) {
      case 'NETWORK_ERROR':
        userMessage = 'Network connection failed. Please check your internet connection and try again.';
        break;
      
      case 'VALIDATION_ERROR':
        userMessage = error.message || 'Please check your input and try again.';
        notificationType = 'warning';
        break;
      
      case 'UNAUTHORIZED':
        userMessage = 'Your session has expired. Please log in again.';
        break;
      
      case 'SERVER_ERROR':
        userMessage = 'Server error occurred. Please try again later or contact support if the problem persists.';
        break;
      
      default:
        userMessage = 'An unexpected error occurred. Please try again.';
    }

    // Show notification if function is provided
    if (showNotification) {
      showNotification(userMessage, notificationType);
    }

    // Return error details for component-specific handling
    return {
      message: userMessage,
      type: notificationType,
      fieldErrors: error.fieldErrors || {},
      canRetry: error.type === 'NETWORK_ERROR' || error.type === 'SERVER_ERROR',
    };
  };

  return { handleError };
};

/**
 * Utility function to extract field errors for form validation
 */
export const extractFieldErrors = (error: ApiError): Record<string, string> => {
  if (error.type === 'VALIDATION_ERROR' && error.fieldErrors) {
    return error.fieldErrors;
  }
  return {};
};

/**
 * Utility function to check if an error is retryable
 */
export const isRetryableError = (error: ApiError): boolean => {
  return error.type === 'NETWORK_ERROR' || error.type === 'SERVER_ERROR';
};

/**
 * Utility function to get user-friendly error message
 */
export const getErrorMessage = (error: ApiError): string => {
  switch (error.type) {
    case 'NETWORK_ERROR':
      return 'Network connection failed. Please check your internet connection.';
    case 'VALIDATION_ERROR':
      return error.message || 'Please check your input and try again.';
    case 'UNAUTHORIZED':
      return 'Authentication required. Please log in.';
    case 'SERVER_ERROR':
      return 'Server error occurred. Please try again later.';
    default:
      return 'An unexpected error occurred.';
  }
};

/**
 * Utility function to determine if error should redirect to login
 */
export const shouldRedirectToLogin = (error: ApiError): boolean => {
  return error.type === 'UNAUTHORIZED' && error.statusCode === 401;
};
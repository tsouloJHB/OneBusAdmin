import { useState, useCallback, useRef } from 'react';
import { ApiError } from '../types';
import { isRetryableError } from '../utils/errorHandler';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  maxDelay?: number;
  retryCondition?: (error: ApiError) => boolean;
}

interface RetryState {
  isRetrying: boolean;
  attemptCount: number;
  lastError: ApiError | null;
  canRetry: boolean;
}

interface UseRetryReturn<T> {
  execute: () => Promise<T>;
  retry: () => Promise<T>;
  reset: () => void;
  state: RetryState;
}

export const useRetry = <T>(
  asyncFunction: () => Promise<T>,
  options: RetryOptions = {}
): UseRetryReturn<T> => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 2,
    maxDelay = 10000,
    retryCondition = isRetryableError,
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attemptCount: 0,
    lastError: null,
    canRetry: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateDelay = useCallback((attempt: number): number => {
    const calculatedDelay = delay * Math.pow(backoffMultiplier, attempt - 1);
    return Math.min(calculatedDelay, maxDelay);
  }, [delay, backoffMultiplier, maxDelay]);

  const executeWithRetry = useCallback(
    async (isRetry = false): Promise<T> => {
      const currentAttempt = isRetry ? state.attemptCount + 1 : 1;

      setState(prev => ({
        ...prev,
        isRetrying: true,
        attemptCount: currentAttempt,
        canRetry: false,
      }));

      try {
        const result = await asyncFunction();
        
        // Success - reset state
        setState({
          isRetrying: false,
          attemptCount: 0,
          lastError: null,
          canRetry: false,
        });

        return result;
      } catch (error) {
        const apiError = error as ApiError;
        const canRetryError = retryCondition(apiError);
        const hasAttemptsLeft = currentAttempt < maxAttempts;
        const shouldRetry = canRetryError && hasAttemptsLeft;

        setState({
          isRetrying: false,
          attemptCount: currentAttempt,
          lastError: apiError,
          canRetry: shouldRetry,
        });

        if (shouldRetry) {
          // Auto-retry with delay
          const retryDelay = calculateDelay(currentAttempt);
          
          return new Promise<T>((resolve, reject) => {
            timeoutRef.current = setTimeout(async () => {
              try {
                const result = await executeWithRetry(true);
                resolve(result);
              } catch (retryError) {
                reject(retryError);
              }
            }, retryDelay);
          });
        }

        throw apiError;
      }
    },
    [asyncFunction, maxAttempts, retryCondition, calculateDelay, state.attemptCount]
  );

  const execute = useCallback(() => {
    return executeWithRetry(false);
  }, [executeWithRetry]);

  const retry = useCallback(() => {
    if (!state.canRetry) {
      throw new Error('Cannot retry: either max attempts reached or error is not retryable');
    }
    return executeWithRetry(true);
  }, [executeWithRetry, state.canRetry]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setState({
      isRetrying: false,
      attemptCount: 0,
      lastError: null,
      canRetry: false,
    });
  }, []);

  return {
    execute,
    retry,
    reset,
    state,
  };
};

// Hook for manual retry operations
export const useManualRetry = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = useCallback(
    async <T>(
      asyncFunction: () => Promise<T>,
      options: RetryOptions = {}
    ): Promise<T> => {
      const { maxAttempts = 3, delay = 1000 } = options;
      
      setIsRetrying(true);
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          setRetryCount(attempt);
          const result = await asyncFunction();
          setIsRetrying(false);
          setRetryCount(0);
          return result;
        } catch (error) {
          const apiError = error as ApiError;
          
          if (attempt === maxAttempts || !isRetryableError(apiError)) {
            setIsRetrying(false);
            setRetryCount(0);
            throw error;
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
      
      setIsRetrying(false);
      setRetryCount(0);
      throw new Error('Max retry attempts reached');
    },
    []
  );

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
  };
};
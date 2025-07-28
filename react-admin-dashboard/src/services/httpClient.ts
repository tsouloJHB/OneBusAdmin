import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config';
import { ApiError } from '../types';

// Cache implementation for API responses
interface CacheItem {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class ApiCache {
  private cache: Map<string, CacheItem> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Get item from cache
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    // Return null if item doesn't exist or is expired
    if (!item || Date.now() > item.expiresAt) {
      if (item) {
        // Clean up expired item
        this.cache.delete(key);
      }
      return null;
    }
    
    return item.data;
  }

  // Set item in cache with optional TTL
  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;
    
    this.cache.set(key, {
      data,
      timestamp,
      expiresAt
    });
  }

  // Remove item from cache
  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clear all cache or items matching a pattern
  clear(pattern?: RegExp): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    // Delete items matching the pattern
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }
}

// Create cache instance
const apiCache = new ApiCache();

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrorTypes: ['ECONNABORTED', 'ENOTFOUND', 'ECONNRESET', 'ECONNREFUSED'],
};

// Create axios instance with base configuration
const httpClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache configuration by endpoint type
const CACHE_CONFIG = {
  // Endpoints that should be cached and their TTL in milliseconds
  ttlMap: {
    '/api/dashboard/stats': 5 * 60 * 1000, // 5 minutes
    '/api/routes': 2 * 60 * 1000, // 2 minutes
    '/api/buses': 2 * 60 * 1000, // 2 minutes
    '/api/active-buses': 30 * 1000, // 30 seconds (more frequent updates)
  },
  // Methods that can be cached
  cacheMethods: ['get'],
  // Whether to use stale cache data when requests fail
  useStaleOnError: true,
};

// Token management utilities
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Request interceptor for authentication
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Retry logic function
const shouldRetry = (error: AxiosError): boolean => {
  if (!error.response) {
    // Network errors are retryable
    return RETRY_CONFIG.retryableErrorTypes.includes(error.code || '');
  }
  
  // Check if status code is retryable
  return RETRY_CONFIG.retryableStatusCodes.includes(error.response.status);
};

const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to generate cache key
const generateCacheKey = (config: InternalAxiosRequestConfig): string => {
  const { url, method, params, data } = config;
  return `${method?.toUpperCase()}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
};

// Helper function to determine if request is cacheable
const isCacheable = (config: InternalAxiosRequestConfig): boolean => {
  if (!config.url || !config.method) return false;
  
  // Only cache specified methods
  if (!CACHE_CONFIG.cacheMethods.includes(config.method.toLowerCase())) {
    return false;
  }
  
  // Check if URL matches any cacheable endpoint
  return Object.keys(CACHE_CONFIG.ttlMap).some(endpoint => 
    config.url?.includes(endpoint)
  );
};

// Helper function to get TTL for a specific URL
const getTTL = (url: string): number => {
  for (const [endpoint, ttl] of Object.entries(CACHE_CONFIG.ttlMap)) {
    if (url.includes(endpoint)) {
      return ttl;
    }
  }
  return 0; // No caching if not found
};

// Request interceptor for cache handling
httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth headers for now since backend doesn't have authentication
    // const token = getAuthToken();
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    // Check if request is cacheable and method is GET
    if (isCacheable(config) && config.method?.toLowerCase() === 'get') {
      const cacheKey = generateCacheKey(config);
      const cachedResponse = apiCache.get(cacheKey);
      
      // If we have a cached response, use it
      if (cachedResponse) {
        // Create a new resolved promise with cached data
        return Promise.reject({
          config,
          response: {
            data: cachedResponse,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          },
          isAxiosError: true,
          toJSON: () => ({}),
          __CACHE_HIT__: true, // Special flag to identify cache hits
        });
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling with retry and caching
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Cache successful GET responses if cacheable
    if (
      response.config.method?.toLowerCase() === 'get' &&
      isCacheable(response.config)
    ) {
      const cacheKey = generateCacheKey(response.config);
      const ttl = getTTL(response.config.url || '');
      
      // Store in cache with appropriate TTL
      apiCache.set(cacheKey, response.data, ttl);
    }
    
    return response;
  },
  async (error: AxiosError & { __CACHE_HIT__?: boolean }) => {
    // If this is a cache hit, return the cached data
    if (error.__CACHE_HIT__) {
      return error.response;
    }
    
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    
    // Initialize retry count
    config._retryCount = config._retryCount || 0;
    
    // Check if we should retry
    if (config._retryCount < RETRY_CONFIG.maxRetries && shouldRetry(error)) {
      config._retryCount++;
      
      // Calculate delay with exponential backoff
      const retryDelay = RETRY_CONFIG.retryDelay * Math.pow(2, config._retryCount - 1);
      
      // Wait before retrying
      await delay(retryDelay);
      
      // Retry the request
      return httpClient(config);
    }
    
    // For GET requests that fail, try to use stale cache if enabled
    if (
      CACHE_CONFIG.useStaleOnError &&
      config.method?.toLowerCase() === 'get' &&
      isCacheable(config)
    ) {
      const cacheKey = generateCacheKey(config);
      // Force get from cache even if expired (stale)
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        // Return stale data with a flag indicating it's stale
        return {
          data: cachedData,
          status: 200,
          statusText: 'OK (Stale)',
          headers: {},
          config,
          __STALE__: true,
        };
      }
    }
    
    const apiError = handleApiError(error);
    
    // Handle token expiration
    if (apiError.type === 'UNAUTHORIZED' && apiError.statusCode === 401) {
      removeAuthToken();
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(apiError);
  }
);

// Error handling function
const handleApiError = (error: AxiosError): ApiError => {
  if (!error.response) {
    // Network error
    return {
      type: 'NETWORK_ERROR',
      message: 'Network connection failed. Please check your internet connection.',
      statusCode: 0,
    };
  }

  const { status, data } = error.response;
  const errorData = data as any; // Type assertion for error response data
  
  switch (status) {
    case 400:
      // Bad request - validation errors
      return {
        type: 'VALIDATION_ERROR',
        message: errorData?.message || 'Invalid request data',
        fieldErrors: errorData?.fieldErrors || {},
        statusCode: status,
      };
    
    case 401:
      // Unauthorized
      return {
        type: 'UNAUTHORIZED',
        message: errorData?.message || 'Authentication required',
        statusCode: status,
      };
    
    case 403:
      // Forbidden
      return {
        type: 'UNAUTHORIZED',
        message: errorData?.message || 'Access denied',
        statusCode: status,
      };
    
    case 404:
      // Not found
      return {
        type: 'VALIDATION_ERROR',
        message: errorData?.message || 'Resource not found',
        statusCode: status,
      };
    
    case 422:
      // Unprocessable entity - validation errors
      return {
        type: 'VALIDATION_ERROR',
        message: errorData?.message || 'Validation failed',
        fieldErrors: errorData?.fieldErrors || {},
        statusCode: status,
      };
    
    case 500:
    case 502:
    case 503:
    case 504:
      // Server errors
      return {
        type: 'SERVER_ERROR',
        message: errorData?.message || 'Server error occurred. Please try again later.',
        statusCode: status,
      };
    
    default:
      // Unknown error
      return {
        type: 'UNKNOWN_ERROR',
        message: errorData?.message || 'An unexpected error occurred',
        statusCode: status,
      };
  }
};

// Cache invalidation utilities
const invalidateCache = (pattern: RegExp): void => {
  apiCache.clear(pattern);
};

const invalidateAllCache = (): void => {
  apiCache.clear();
};

// Specific cache invalidation functions
const invalidateRouteCache = (): void => {
  invalidateCache(/\/api\/routes/);
};

const invalidateBusCache = (): void => {
  invalidateCache(/\/api\/buses/);
};

const invalidateActiveBusCache = (): void => {
  invalidateCache(/\/api\/active-buses/);
};

const invalidateDashboardCache = (): void => {
  invalidateCache(/\/api\/dashboard/);
};

// Export utilities for external use
export { 
  httpClient, 
  setAuthToken, 
  removeAuthToken, 
  getAuthToken,
  invalidateCache,
  invalidateAllCache,
  invalidateRouteCache,
  invalidateBusCache,
  invalidateActiveBusCache,
  invalidateDashboardCache
};
export default httpClient;
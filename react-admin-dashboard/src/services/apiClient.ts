import { useAuth } from '../contexts/AuthContext';

/**
 * Custom fetch wrapper that automatically adds JWT token to requests
 * Use this instead of native fetch to ensure all API requests are authenticated
 */
export const useAuthFetch = () => {
  const { token, logout } = useAuth();

  return async (url: string, options?: RequestInit): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options?.headers as Record<string, string>) || {}),
    };

    // Add JWT token to Authorization header if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Clear auth state and redirect to login
        logout();
        // Optionally refresh token here if you have a refresh endpoint
        throw new Error('Unauthorized. Please log in again.');
      }

      // Handle 403 Forbidden - user lacks permissions
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to access this resource.');
      }

      return response;
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Create an authenticated API client instance
 * Pass your API base URL and it will handle all auth headers
 */
export class AuthenticatedApiClient {
  constructor(
    private baseUrl: string,
    private getToken: () => string | null,
    private onUnauthorized: () => void
  ) {}

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options?.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.onUnauthorized();
      throw new Error('Unauthorized. Please log in again.');
    }

    if (response.status === 403) {
      throw new Error('Access denied.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}

/**
 * Helper to create an authenticated API client for use in services
 */
export const createAuthenticatedApiClient = (
  baseUrl: string,
  getToken: () => string | null,
  onUnauthorized: () => void
): AuthenticatedApiClient => {
  return new AuthenticatedApiClient(baseUrl, getToken, onUnauthorized);
};

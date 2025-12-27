import { setAuthToken, removeAuthToken } from './httpClient';
import { LoginRequest, LoginResponse, User } from '../types';

const authService = {
  /**
   * Authenticate user with credentials (MOCKED for development)
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Mock authentication since backend doesn't have auth yet
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple validation - accept any non-empty username/password
        if (!credentials.username || !credentials.password) {
          reject(new Error('Username and password are required'));
          return;
        }

        const mockResponse: LoginResponse = {
          user: {
            id: '1',
            username: credentials.username,
            email: credentials.username.includes('@') ? credentials.username : `${credentials.username}@example.com`,
            role: 'admin',
            isActive: true,
            lastLogin: new Date(),
          },
          token: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresIn: 3600, // 1 hour in seconds
        };
        
        setAuthToken(mockResponse.token);
        resolve(mockResponse);
      }, 500); // Simulate network delay
    });
  },

  /**
   * Logout user and clear authentication (MOCKED)
   */
  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        removeAuthToken();
        resolve();
      }, 200);
    });
  },

  /**
   * Refresh authentication token (MOCKED)
   */
  async refreshToken(): Promise<LoginResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse: LoginResponse = {
          user: {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
            isActive: true,
            lastLogin: new Date(),
          },
          token: 'mock-jwt-token-refreshed-' + Date.now(),
          refreshToken: 'mock-refresh-token-refreshed-' + Date.now(),
          expiresIn: 3600, // 1 hour in seconds
        };
        
        setAuthToken(mockResponse.token);
        resolve(mockResponse);
      }, 300);
    });
  },

  /**
   * Get current user (MOCKED)
   */
  async getCurrentUser(): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          isActive: true,
          lastLogin: new Date(),
        };
        resolve(mockUser);
      }, 200);
    });
  },

  /**
   * Check if user is authenticated (MOCKED)
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  },
};

export default authService;
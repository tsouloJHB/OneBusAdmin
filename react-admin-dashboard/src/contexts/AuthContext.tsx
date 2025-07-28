import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthContextType, LoginRequest, User } from '../types';
import { authService } from '../services/authService';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage utilities
const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const setStoredRefreshToken = (refreshToken: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

const removeStoredTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthProvider: Initializing authentication...');
      
      // For development, use mock authentication
      if (process.env.NODE_ENV === 'development') {
        console.log('AuthProvider: Using mock authentication for development');
        
        // Create a mock user
        const mockUser = {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin' as const,
          isActive: true,
          lastLogin: new Date(),
        };
        
        const mockToken = 'mock-dev-token';
        
        // Store mock token
        setStoredToken(mockToken);
        
        // Set authenticated state
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: mockUser, token: mockToken },
        });
        
        console.log('AuthProvider: Mock authentication complete');
        return;
      }
      
      // Production authentication logic
      const storedToken = getStoredToken();
      console.log('AuthProvider: Stored token:', storedToken ? 'exists' : 'none');
      
      if (storedToken) {
        console.log('AuthProvider: Found stored token, attempting verification...');
        try {
          // Verify token by getting current user
          const user = await authService.getCurrentUser();
          console.log('AuthProvider: Token valid, user:', user);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token: storedToken },
          });
        } catch (error) {
          console.log('AuthProvider: Token verification failed, clearing token:', error);
          // Token is invalid, clear it and show login
          removeStoredTokens();
          dispatch({ type: 'LOGIN_FAILURE' });
        }
      } else {
        console.log('AuthProvider: No stored token, user needs to login');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // For development, use mock authentication
      if (process.env.NODE_ENV === 'development') {
        console.log('AuthProvider: Mock login for user:', credentials.username);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser = {
          id: '1',
          username: credentials.username,
          email: `${credentials.username}@example.com`,
          role: 'admin' as const,
          isActive: true,
          lastLogin: new Date(),
        };
        
        const mockToken = 'mock-dev-token';
        const mockRefreshToken = 'mock-refresh-token';
        
        // Store tokens
        setStoredToken(mockToken);
        setStoredRefreshToken(mockRefreshToken);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: mockUser, token: mockToken },
        });
        
        console.log('AuthProvider: Mock login successful');
        return;
      }
      
      // Production login logic
      const response = await authService.login(credentials);
      
      // Store tokens
      setStoredToken(response.token);
      setStoredRefreshToken(response.refreshToken);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout service call failed:', error);
    } finally {
      removeStoredTokens();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    try {
      const response = await authService.refreshToken();
      
      // Update stored tokens
      setStoredToken(response.token);
      setStoredRefreshToken(response.refreshToken);
      
      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error) {
      // Refresh failed, logout user
      removeStoredTokens();
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
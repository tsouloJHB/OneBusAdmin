import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthContextType, LoginRequest, User } from '../types';
import authService from '../services/authService';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const setStoredRefreshToken = (refreshToken: string): void => {
  // JWT tokens don't need refresh tokens stored separately
  // The backend will issue a new token when needed
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
  console.log('AuthProvider: Component mounting...');
  const [state, dispatch] = useReducer(authReducer, initialState);
  console.log('AuthProvider: Initial state:', state);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthProvider: Initializing authentication...');
      
      try {
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
      } catch (error) {
        console.error('AuthProvider: Initialization error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.login(credentials);
      
      // Store token
      setStoredToken(response.token);
      
      // Convert flat response to User object
      const user: User = {
        id: response.email, // Using email as ID since backend doesn't return ID
        email: response.email,
        fullName: response.fullName,
        role: response.role,
        isActive: true,
      };
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: response.token },
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
      
      // Convert flat response to User object
      const user: User = {
        id: response.email,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
        isActive: true,
      };
      
      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: { user, token: response.token },
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
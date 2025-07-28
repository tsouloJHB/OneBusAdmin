import { renderHook, act } from '@testing-library/react';
import { useAuthState } from '../useAuthState';
import { authService } from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService');
const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('useAuthState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with unauthenticated state', () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const { result } = renderHook(() => useAuthState());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('should set authenticated state when user is logged in', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin' as const,
      isActive: true,
      lastLogin: new Date(),
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const { result, waitForNextUpdate } = renderHook(() => useAuthState());

    await waitForNextUpdate();

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle login action', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin' as const,
      isActive: true,
      lastLogin: new Date(),
    };

    const mockLoginResponse = {
      user: mockUser,
      token: 'mock-token',
    };

    mockAuthService.login.mockResolvedValue(mockLoginResponse);
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const { result, waitForNextUpdate } = renderHook(() => useAuthState());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(mockAuthService.login).toHaveBeenCalledWith({
      emailOrUsername: 'test@example.com',
      password: 'password',
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle logout action', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin' as const,
      isActive: true,
      lastLogin: new Date(),
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.logout.mockResolvedValue();

    const { result, waitForNextUpdate } = renderHook(() => useAuthState());

    await waitForNextUpdate();

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should handle authentication errors', async () => {
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('Auth error'));
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const { result, waitForNextUpdate } = renderHook(() => useAuthState());

    await waitForNextUpdate();

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should provide user permissions', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin' as const,
      isActive: true,
      lastLogin: new Date(),
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const { result, waitForNextUpdate } = renderHook(() => useAuthState());

    await waitForNextUpdate();

    expect(result.current.userPermissions.isAdmin).toBe(true);
    expect(result.current.userPermissions.isOperator).toBe(false);
  });

  it('should handle token refresh', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin' as const,
      isActive: true,
      lastLogin: new Date(),
    };

    mockAuthService.refreshToken.mockResolvedValue({
      user: mockUser,
      token: 'new-token',
    });

    const { result } = renderHook(() => useAuthState());

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(mockAuthService.refreshToken).toHaveBeenCalled();
  });
});
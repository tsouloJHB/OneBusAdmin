import axios from 'axios';
import { httpClient, setAuthToken, removeAuthToken, getAuthToken } from '../httpClient';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('httpClient', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Token management', () => {
    it('should set and get auth token', () => {
      const testToken = 'test-token-123';
      
      setAuthToken(testToken);
      expect(getAuthToken()).toBe(testToken);
    });

    it('should remove auth token', () => {
      const testToken = 'test-token-123';
      
      setAuthToken(testToken);
      expect(getAuthToken()).toBe(testToken);
      
      removeAuthToken();
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('HTTP Client Configuration', () => {
    it('should be configured with correct base URL', () => {
      expect(httpClient.defaults.baseURL).toBe('http://localhost:8080/api');
    });

    it('should have correct timeout', () => {
      expect(httpClient.defaults.timeout).toBe(10000);
    });

    it('should have correct default headers', () => {
      expect(httpClient.defaults.headers['Content-Type']).toBe('application/json');
    });
  });
});
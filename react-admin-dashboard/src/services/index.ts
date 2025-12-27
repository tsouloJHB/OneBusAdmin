// HTTP Client utilities export
export { httpClient, setAuthToken, removeAuthToken, getAuthToken } from './httpClient';

// Note: Import services directly from their individual files to avoid circular dependencies
// Example: import { authService } from './authService'
// instead of: import { authService } from './services'
import { httpClient } from './httpClient';
import { Driver, DriverRegistrationRequest, DriverStatistics } from '../types/driver';

const API_BASE_URL = '/drivers';

export const driverService = {
  // Get all drivers
  getAllDrivers: async (): Promise<Driver[]> => {
    try {
      const response = await httpClient.get<Driver[]>(`${API_BASE_URL}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  },

  // Get driver by ID
  getDriverById: async (id: number): Promise<Driver> => {
    try {
      const response = await httpClient.get<Driver>(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching driver with ID ${id}:`, error);
      throw error;
    }
  },

  // Get drivers by company
  getDriversByCompany: async (companyId: number): Promise<Driver[]> => {
    try {
      const response = await httpClient.get<Driver[]>(`${API_BASE_URL}/company/${companyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching drivers for company ${companyId}:`, error);
      throw error;
    }
  },

  // Get active drivers
  getActiveDrivers: async (): Promise<Driver[]> => {
    try {
      const response = await httpClient.get<Driver[]>(`${API_BASE_URL}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active drivers:', error);
      throw error;
    }
  },

  // Search drivers by name
  searchDrivers: async (name: string): Promise<Driver[]> => {
    try {
      const response = await httpClient.get<Driver[]>(`${API_BASE_URL}/search`, {
        params: { name }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching drivers with name "${name}":`, error);
      throw error;
    }
  },

  // Register driver by admin (with default password)
  registerDriverByAdmin: async (request: DriverRegistrationRequest): Promise<Driver> => {
    try {
      const response = await httpClient.post<Driver>(`${API_BASE_URL}/register-by-admin`, request);
      return response.data;
    } catch (error: any) {
      console.error('Error registering driver by admin:', error);
      const message = error?.response?.data?.error || 'Error registering driver by admin';
      throw new Error(message);
    }
  },

  // Register driver (self-registration)
  registerDriver: async (request: DriverRegistrationRequest): Promise<Driver> => {
    try {
      const response = await httpClient.post<Driver>(`${API_BASE_URL}/register`, request);
      return response.data;
    } catch (error: any) {
      console.error('Error registering driver:', error);
      const message = error?.response?.data?.error || 'Error registering driver';
      throw new Error(message);
    }
  },

  // Update driver
  updateDriver: async (id: number, request: Partial<DriverRegistrationRequest>): Promise<Driver> => {
    try {
      const response = await httpClient.put<Driver>(`${API_BASE_URL}/${id}`, request);
      return response.data;
    } catch (error) {
      console.error(`Error updating driver with ID ${id}:`, error);
      throw error;
    }
  },

  // Update driver status
  updateDriverStatus: async (id: number, status: string): Promise<Driver> => {
    try {
      const response = await httpClient.patch<Driver>(`${API_BASE_URL}/${id}/status`, null, {
        params: { status },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for driver ${id}:`, error);
      throw error;
    }
  },

  // Delete driver
  deleteDriver: async (id: number): Promise<void> => {
    try {
      await httpClient.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting driver with ID ${id}:`, error);
      throw error;
    }
  },

  // Get driver statistics
  getDriverStatistics: async (): Promise<DriverStatistics> => {
    try {
      const response = await httpClient.get<DriverStatistics>(`${API_BASE_URL}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver statistics:', error);
      throw error;
    }
  },

  // Assign driver to bus
  assignDriverToBus: async (driverId: number, busRegistrationNumber: string): Promise<Driver> => {
    try {
      const response = await httpClient.post<{driver: Driver}>(`${API_BASE_URL}/${driverId}/assign-to-bus`, null, {
        params: { busRegistrationNumber },
      });
      return response.data.driver;
    } catch (error: any) {
      console.error(`Error assigning driver ${driverId} to bus:`, error);
      const message = error?.response?.data?.error || 'Error assigning driver to bus';
      throw new Error(message);
    }
  },

  // Remove driver from bus
  removeDriverFromBus: async (driverId: number): Promise<Driver> => {
    try {
      const response = await httpClient.post<{driver: Driver}>(`${API_BASE_URL}/${driverId}/remove-from-bus`);
      return response.data.driver;
    } catch (error: any) {
      console.error(`Error removing driver ${driverId} from bus:`, error);
      const message = error?.response?.data?.error || 'Error removing driver from bus';
      throw new Error(message);
    }
  },
};

import httpClient from './httpClient';
import {
  Tracker,
  CreateTrackerRequest,
  UpdateTrackerRequest,
  TrackerStatistics,
  ApiResponse
} from '../types';

const trackerService = {
  /**
   * Get all trackers
   */
  async getAllTrackers(companyId?: number): Promise<Tracker[]> {
    try {
      const params = companyId ? { companyId } : {};
      const response = await httpClient.get('/trackers', { params });
      return response.data;
    } catch (error) {
      console.error('TrackerService: Error fetching trackers:', error);
      throw error;
    }
  },

  /**
   * Get tracker by ID
   */
  async getTrackerById(id: number): Promise<Tracker> {
    try {
      const response = await httpClient.get(`/trackers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`TrackerService: Error fetching tracker ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get tracker by IMEI
   */
  async getTrackerByImei(imei: string): Promise<Tracker> {
    try {
      const response = await httpClient.get(`/trackers/imei/${imei}`);
      return response.data;
    } catch (error) {
      console.error(`TrackerService: Error fetching tracker with IMEI ${imei}:`, error);
      throw error;
    }
  },

  /**
   * Get trackers by company
   */
  async getTrackersByCompany(companyId: number): Promise<Tracker[]> {
    try {
      const response = await httpClient.get(`/trackers/company/${companyId}`);
      return response.data;
    } catch (error) {
      console.error(`TrackerService: Error fetching trackers for company ${companyId}:`, error);
      throw error;
    }
  },

  /**
   * Get trackers by status
   */
  async getTrackersByStatus(status: string): Promise<Tracker[]> {
    try {
      const response = await httpClient.get(`/trackers/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`TrackerService: Error fetching trackers with status ${status}:`, error);
      throw error;
    }
  },

  /**
   * Get available trackers
   */
  async getAvailableTrackers(companyId?: number): Promise<Tracker[]> {
    try {
      const url = companyId
        ? `/trackers/available?companyId=${companyId}`
        : '/trackers/available';
      const response = await httpClient.get(url);
      return response.data;
    } catch (error) {
      console.error('TrackerService: Error fetching available trackers:', error);
      throw error;
    }
  },

  /**
   * Search trackers
   */
  async searchTrackers(query: string, companyId?: number): Promise<Tracker[]> {
    try {
      const params: any = { q: query };
      if (companyId) params.companyId = companyId;
      const response = await httpClient.get('/trackers/search', { params });
      return response.data;
    } catch (error) {
      console.error(`TrackerService: Error searching trackers with query "${query}":`, error);
      throw error;
    }
  },

  /**
   * Create a new tracker
   */
  async createTracker(data: CreateTrackerRequest): Promise<Tracker> {
    try {
      const response = await httpClient.post('/trackers', data);
      return response.data;
    } catch (error) {
      console.error('TrackerService: Error creating tracker:', error);
      throw error;
    }
  },

  /**
   * Update tracker
   */
  async updateTracker(id: number, data: UpdateTrackerRequest): Promise<Tracker> {
    try {
      const response = await httpClient.put(`/trackers/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`TrackerService: Error updating tracker ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete tracker
   */
  async deleteTracker(id: number): Promise<void> {
    try {
      await httpClient.delete(`/trackers/${id}`);
    } catch (error) {
      console.error(`TrackerService: Error deleting tracker ${id}:`, error);
      throw error;
    }
  },

  /**
   * Assign tracker to bus
   */
  async assignTrackerToBus(trackerId: number, busId: number): Promise<Tracker> {
    try {
      const response = await httpClient.post(`/trackers/${trackerId}/assign/${busId}`);
      return response.data;
    } catch (error) {
      console.error(`TrackerService: Error assigning tracker ${trackerId} to bus ${busId}:`, error);
      throw error;
    }
  },

  /**
   * Unassign tracker from bus
   */
  async unassignTrackerFromBus(trackerId: number): Promise<Tracker> {
    try {
      const response = await httpClient.post(`/trackers/${trackerId}/unassign`);
      return response.data;
    } catch (error) {
      console.error(`TrackerService: Error unassigning tracker ${trackerId}:`, error);
      throw error;
    }
  },

  /**
   * Migrate existing bus trackers
   */
  async migrateTrackers(): Promise<{ message: string; migratedCount: number }> {
    try {
      const response = await httpClient.post('/trackers/migrate');
      return response.data;
    } catch (error) {
      console.error('TrackerService: Error migrating trackers:', error);
      throw error;
    }
  },

  /**
   * Get tracker statistics
   */
  async getTrackerStatistics(companyId?: number): Promise<TrackerStatistics> {
    try {
      const params = companyId ? { companyId } : {};
      const response = await httpClient.get('/trackers/statistics', { params });
      return response.data;
    } catch (error) {
      console.error('TrackerService: Error fetching tracker statistics:', error);
      throw error;
    }
  },
};

export default trackerService;

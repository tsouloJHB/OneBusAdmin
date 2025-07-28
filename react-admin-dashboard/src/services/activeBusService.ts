import httpClient, { invalidateActiveBusCache } from './httpClient';
import { config } from '../config';
import { 
  ActiveBus, 
  ActiveBusFilters,
  ApiResponse 
} from '../types';

// Mock data for development
const mockActiveBuses: ActiveBus[] = [
  {
    id: 'active1',
    bus: {
      id: 'bus1',
      busNumber: 'C5',
      capacity: 40,
      model: 'Mercedes Sprinter',
      year: 2022,
      status: 'active' as const,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    route: {
      id: 'route1',
      name: 'Johannesburg CBD to Soweto',
      startPoint: 'Johannesburg CBD',
      endPoint: 'Soweto',
      stops: [],
      schedule: [],
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    currentLocation: {
      lat: -26.2041,
      lng: 28.0473,
    },
    nextStop: {
      id: 'stop1',
      name: 'Park Station',
      coordinates: { lat: -26.2041, lng: 28.0473 },
      order: 1,
    },
    estimatedArrival: new Date(Date.now() + 10 * 60 * 1000),
    passengerCount: 25,
    status: 'on_route' as const,
    lastUpdated: new Date(),
  },
  {
    id: 'active2',
    bus: {
      id: 'bus2',
      busNumber: 'A1',
      capacity: 30,
      model: 'Ford Transit',
      year: 2021,
      status: 'active' as const,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
    route: {
      id: 'route2',
      name: 'Airport Shuttle',
      startPoint: 'Johannesburg CBD',
      endPoint: 'OR Tambo Airport',
      stops: [],
      schedule: [],
      isActive: true,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
    currentLocation: {
      lat: -26.1367,
      lng: 28.2411,
    },
    nextStop: {
      id: 'stop2',
      name: 'Airport Terminal',
      coordinates: { lat: -26.1367, lng: 28.2411 },
      order: 2,
    },
    estimatedArrival: new Date(Date.now() + 15 * 60 * 1000),
    passengerCount: 20,
    status: 'delayed' as const,
    lastUpdated: new Date(),
  },
];

export const activeBusService = {
  /**
   * Get all active buses with optional filtering
   */
  async getActiveBuses(filters?: ActiveBusFilters): Promise<ActiveBus[]> {
    try {
      console.log('ActiveBusService: Attempting to fetch from backend API...');
      
      // Try to get active bus IDs from your backend
      const response = await httpClient.get<string[]>(config.endpoints.activeBuses);
      const activeBusIds = response.data || [];
      
      console.log('ActiveBusService: Active bus IDs from backend:', activeBusIds);
      
      // For now, return mock data filtered by the active bus IDs from your backend
      // In the future, you can enhance your backend to return full ActiveBus objects
      let filteredBuses = mockActiveBuses.filter(bus => 
        activeBusIds.includes(bus.bus.busNumber) || activeBusIds.includes(`BUS-${bus.bus.busNumber}-001`)
      );
      
      // If no buses match the backend IDs, return all mock buses for demo purposes
      if (filteredBuses.length === 0) {
        filteredBuses = [...mockActiveBuses];
      }
      
      // Apply frontend filters
      if (filters?.search) {
        filteredBuses = filteredBuses.filter(bus => 
          bus.bus.busNumber.toLowerCase().includes(filters.search!.toLowerCase()) ||
          bus.route.name.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters?.routeId) {
        filteredBuses = filteredBuses.filter(bus => bus.route.id === filters.routeId);
      }
      
      if (filters?.status) {
        filteredBuses = filteredBuses.filter(bus => bus.status === filters.status);
      }
      
      return filteredBuses;
      
    } catch (error) {
      console.log('ActiveBusService: Backend API failed, using mock data:', error);
      
      // Fallback to mock data if API fails
      let filteredBuses = [...mockActiveBuses];
      
      if (filters?.search) {
        filteredBuses = filteredBuses.filter(bus => 
          bus.bus.busNumber.toLowerCase().includes(filters.search!.toLowerCase()) ||
          bus.route.name.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters?.routeId) {
        filteredBuses = filteredBuses.filter(bus => bus.route.id === filters.routeId);
      }
      
      if (filters?.status) {
        filteredBuses = filteredBuses.filter(bus => bus.status === filters.status);
      }
      
      return filteredBuses;
    }
  },

  /**
   * Get a single active bus by ID
   */
  async getActiveBusById(id: string): Promise<ActiveBus> {
    try {
      const response = await httpClient.get<ApiResponse<ActiveBus>>(
        `${config.endpoints.activeBuses}/${id}`
      );
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get active buses by route ID
   */
  async getActiveBusesByRoute(routeId: string): Promise<ActiveBus[]> {
    try {
      const response = await httpClient.get<ApiResponse<ActiveBus[]>>(
        `${config.endpoints.activeBuses}/route/${routeId}`
      );
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update active bus location (for real-time tracking)
   */
  async updateBusLocation(
    busId: string, 
    location: { lat: number; lng: number }
  ): Promise<ActiveBus> {
    try {
      const response = await httpClient.patch<ApiResponse<ActiveBus>>(
        `${config.endpoints.activeBuses}/${busId}/location`,
        { location }
      );
      
      // Invalidate cache after update
      invalidateActiveBusCache();
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update active bus status
   */
  async updateBusStatus(
    busId: string, 
    status: ActiveBus['status']
  ): Promise<ActiveBus> {
    try {
      const response = await httpClient.patch<ApiResponse<ActiveBus>>(
        `${config.endpoints.activeBuses}/${busId}/status`,
        { status }
      );
      
      // Invalidate cache after update
      invalidateActiveBusCache();
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update passenger count for active bus
   */
  async updatePassengerCount(
    busId: string, 
    passengerCount: number
  ): Promise<ActiveBus> {
    try {
      const response = await httpClient.patch<ApiResponse<ActiveBus>>(
        `${config.endpoints.activeBuses}/${busId}/passengers`,
        { passengerCount }
      );
      
      // Invalidate cache after update
      invalidateActiveBusCache();
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get active buses statistics
   */
  async getActiveBusesStats(): Promise<{
    totalActive: number;
    onRoute: number;
    atStop: number;
    delayed: number;
  }> {
    try {
      const response = await httpClient.get<ApiResponse<{
        totalActive: number;
        onRoute: number;
        atStop: number;
        delayed: number;
      }>>(`${config.endpoints.activeBuses}/stats`);
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};
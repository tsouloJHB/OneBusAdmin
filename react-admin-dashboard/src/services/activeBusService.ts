import httpClient, { invalidateActiveBusCache } from './httpClient';
import { config } from '../config';
import { 
  ActiveBus, 
  ActiveBusFilters,
  ApiResponse 
} from '../types';

const activeBusService = {
  /**
   * Get all active buses with optional filtering
   */
  async getActiveBuses(filters?: ActiveBusFilters): Promise<ActiveBus[]> {
    try {
      console.log('ActiveBusService: Fetching from backend API...');
      
      // Build query parameters for backend filtering
      const params = new URLSearchParams();
      if (filters?.companyId) {
        params.append('companyId', filters.companyId);
      }
      
      const url = `${config.endpoints.activeBuses}${params.toString() ? `?${params.toString()}` : ''}`;
      
      // Fetch active buses from backend
      const response = await httpClient.get<any[]>(url);
      let buses = response.data || [];
      
      console.log('ActiveBusService: Received buses from backend:', buses.length);
      
      // Transform backend response to ActiveBus format
      buses = buses.map(busData => ({
        id: busData.bus?.id || `bus-${busData.bus?.busNumber || 'unknown'}`,
        bus: {
          id: busData.bus?.id || `bus-${busData.bus?.busNumber || 'unknown'}`,
          busNumber: busData.bus?.busNumber || 'Unknown',
          capacity: 40, // Default capacity
          model: 'Unknown',
          year: new Date().getFullYear(),
          status: busData.status || 'active',
          busCompany: busData.busCompany || 'Unknown',
          driverId: busData.bus?.driverId,
          driverName: busData.bus?.driverName,
          trackerImei: busData.bus?.trackerImei,
          createdAt: new Date(),
          updatedAt: new Date(busData.lastUpdated || Date.now()),
        },
        route: {
          id: busData.route?.id || 1,
          name: busData.route?.routeName || `${busData.bus?.busNumber || 'Unknown'} ${busData.tripDirection || 'Route'}`,
          company: busData.route?.company || busData.busCompany || 'Unknown',
          busNumber: busData.route?.busNumber || busData.bus?.busNumber,
          startPoint: busData.route?.startPoint || 'Unknown',
          endPoint: busData.route?.endPoint || 'Unknown',
          direction: busData.route?.direction || busData.tripDirection,
          isActive: busData.route?.active !== undefined ? busData.route.active : true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        currentLocation: {
          lat: busData.currentLocation?.lat || 0,
          lng: busData.currentLocation?.lng || 0,
        },
        nextStop: {
          id: busData.nextStop?.id || `stop-${busData.nextStop?.order || 0}`,
          name: busData.nextStop?.name || `Stop ${busData.nextStop?.order || 0}`,
          coordinates: { 
            lat: busData.nextStop?.lat || busData.currentLocation?.lat || 0, 
            lng: busData.nextStop?.lng || busData.currentLocation?.lng || 0 
          },
          order: busData.nextStop?.order || 0,
        },
        lastStop: busData.lastStop ? {
          id: busData.lastStop.id || `stop-${busData.lastStop.order || 0}`,
          name: busData.lastStop.name || `Stop ${busData.lastStop.order || 0}`,
          coordinates: { 
            lat: busData.lastStop.lat || 0, 
            lng: busData.lastStop.lng || 0 
          },
          order: busData.lastStop.order || 0,
        } : undefined,
        estimatedArrival: new Date(Date.now() + 10 * 60 * 1000), // Default 10 minutes
        passengerCount: 0, // Not available from tracker
        status: busData.status || 'on_route',
        lastUpdated: new Date(busData.lastUpdated || Date.now()),
      }));
      
      // Apply frontend filters
      if (filters?.search) {
        buses = buses.filter(bus => 
          bus.bus.busNumber.toLowerCase().includes(filters.search!.toLowerCase()) ||
          bus.route.name.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters?.routeId) {
        buses = buses.filter(bus => bus.route.id.toString() === filters.routeId);
      }
      
      if (filters?.status) {
        buses = buses.filter(bus => bus.status === filters.status);
      }
      
      return buses;
      
    } catch (error) {
      console.error('ActiveBusService: Failed to fetch active buses:', error);
      throw error;
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

export default activeBusService;
import httpClient from './httpClient';
import { config } from '../config';
import { 
  Bus, 
  CreateBusRequest, 
  UpdateBusRequest, 
  BusFilters,
  PaginatedResponse,
  ApiResponse 
} from '../types';

export const busService = {
  /**
   * Get all buses with optional filtering and pagination
   */
  async getBuses(
    filters?: BusFilters,
    page: number = 1,
    limit: number = config.ui.itemsPerPage
  ): Promise<PaginatedResponse<Bus>> {
    try {
      console.log('BusService: Attempting to fetch buses from backend API...');
      
      // Use your actual GET /api/buses endpoint
      const response = await httpClient.get(config.endpoints.buses);
      const backendBuses = response.data || [];
      
      console.log('BusService: Backend buses:', backendBuses);
      
      // Transform backend bus format to frontend Bus format
      const buses: Bus[] = backendBuses.map((backendBus: any) => ({
        id: backendBus.busId || Math.random().toString(),
        busNumber: backendBus.busNumber || 'Unknown',
        capacity: 40, // Default capacity since your backend doesn't have this field yet
        model: backendBus.busCompany || 'Unknown Company', // Use busCompany as model for now
        year: 2023, // Default year since your backend doesn't have this field yet
        status: 'active' as const, // Default status since your backend doesn't have this field yet
        assignedRouteId: backendBus.route || undefined,
        assignedRoute: backendBus.route ? {
          id: backendBus.route,
          name: backendBus.route,
          startPoint: 'Start',
          endPoint: 'End',
          stops: [],
          schedule: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Store additional backend data for display
        busCompany: backendBus.busCompany,
        driverId: backendBus.driverId,
        driverName: backendBus.driverName,
        trackerImei: backendBus.trackerImei,
      }));
      
      console.log('BusService: Transformed buses:', buses);
      
      // Apply client-side filtering
      let filteredBuses = buses;
      
      if (filters?.search) {
        filteredBuses = buses.filter((bus: Bus) => 
          bus.busNumber.toLowerCase().includes(filters.search!.toLowerCase()) ||
          bus.model.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters?.status) {
        filteredBuses = filteredBuses.filter((bus: Bus) => bus.status === filters.status);
      }
      
      if (filters?.assignedRouteId) {
        filteredBuses = filteredBuses.filter((bus: Bus) => bus.assignedRouteId === filters.assignedRouteId);
      }
      
      // Apply client-side sorting
      if (filters?.sortBy) {
        filteredBuses.sort((a, b) => {
          const aValue = a[filters.sortBy as keyof Bus];
          const bValue = b[filters.sortBy as keyof Bus];
          
          // Handle undefined values
          if (aValue === undefined && bValue === undefined) return 0;
          if (aValue === undefined) return 1;
          if (bValue === undefined) return -1;
          
          if (filters.sortOrder === 'desc') {
            return aValue > bValue ? -1 : 1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }
      
      // Apply client-side pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBuses = filteredBuses.slice(startIndex, endIndex);
      
      return {
        data: paginatedBuses,
        pagination: {
          page,
          limit,
          total: filteredBuses.length,
          totalPages: Math.ceil(filteredBuses.length / limit)
        }
      };
      
    } catch (error) {
      console.log('BusService: Backend API failed, using mock data:', error);
      
      // Fallback to mock data if API fails
      const mockBuses: Bus[] = [
        {
          id: 'bus1',
          busNumber: 'C5',
          capacity: 40,
          model: 'Mercedes Sprinter',
          year: 2022,
          status: 'active',
          assignedRouteId: 'route1',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: 'bus2',
          busNumber: 'A1',
          capacity: 30,
          model: 'Ford Transit',
          year: 2021,
          status: 'maintenance',
          assignedRouteId: 'route2',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
        },
        {
          id: 'bus3',
          busNumber: 'B7',
          capacity: 35,
          model: 'Volvo Bus',
          year: 2023,
          status: 'active',
          createdAt: new Date('2023-01-03'),
          updatedAt: new Date('2023-01-03'),
        },
      ];
      
      // Apply filters to mock data
      let filteredBuses = mockBuses;
      
      if (filters?.search) {
        filteredBuses = mockBuses.filter((bus: Bus) => 
          bus.busNumber.toLowerCase().includes(filters.search!.toLowerCase()) ||
          bus.model.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters?.status) {
        filteredBuses = filteredBuses.filter((bus: Bus) => bus.status === filters.status);
      }
      
      // Apply pagination to mock data
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBuses = filteredBuses.slice(startIndex, endIndex);
      
      return {
        data: paginatedBuses,
        pagination: {
          page,
          limit,
          total: filteredBuses.length,
          totalPages: Math.ceil(filteredBuses.length / limit)
        }
      };
    }
  },

  /**
   * Get a single bus by ID
   */
  async getBusById(id: string): Promise<Bus> {
    try {
      const response = await httpClient.get<ApiResponse<Bus>>(
        `${config.endpoints.buses}/${id}`
      );
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new bus
   */
  async createBus(busData: CreateBusRequest): Promise<Bus> {
    try {
      const response = await httpClient.post<ApiResponse<Bus>>(
        config.endpoints.buses,
        busData
      );
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update an existing bus
   */
  async updateBus(id: string, busData: UpdateBusRequest): Promise<Bus> {
    try {
      const response = await httpClient.put<ApiResponse<Bus>>(
        `${config.endpoints.buses}/${id}`,
        busData
      );
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a bus
   */
  async deleteBus(id: string): Promise<void> {
    try {
      await httpClient.delete(`${config.endpoints.buses}/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update bus status
   */
  async updateBusStatus(id: string, status: Bus['status']): Promise<Bus> {
    try {
      const response = await httpClient.patch<ApiResponse<Bus>>(
        `${config.endpoints.buses}/${id}/status`,
        { status }
      );
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Assign bus to route
   */
  async assignBusToRoute(busId: string, routeId: string): Promise<Bus> {
    try {
      const response = await httpClient.patch<ApiResponse<Bus>>(
        `${config.endpoints.buses}/${busId}/assign-route`,
        { routeId }
      );
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Unassign bus from route
   */
  async unassignBusFromRoute(busId: string): Promise<Bus> {
    try {
      const response = await httpClient.patch<ApiResponse<Bus>>(
        `${config.endpoints.buses}/${busId}/unassign-route`
      );
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get available buses (not assigned to any route)
   */
  async getAvailableBuses(): Promise<Bus[]> {
    try {
      const response = await httpClient.get<ApiResponse<Bus[]>>(
        `${config.endpoints.buses}/available`
      );
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};
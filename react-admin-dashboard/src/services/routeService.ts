import httpClient from './httpClient';
import { config } from '../config';
import { 
  Route, 
  CreateRouteRequest, 
  UpdateRouteRequest, 
  RouteFilters,
  PaginatedResponse,
  ApiResponse 
} from '../types';

export const routeService = {
  /**
   * Get all routes with optional filtering and pagination
   */
  async getRoutes(
    filters?: RouteFilters,
    page: number = 1,
    limit: number = config.ui.itemsPerPage
  ): Promise<PaginatedResponse<Route>> {
    try {
      console.log('RouteService: Attempting to fetch routes from backend API...');
      
      // Use your backend endpoint
      const response = await httpClient.get(config.endpoints.routes);
      const backendRoutes = response.data || [];
      
      console.log('RouteService: Backend routes:', backendRoutes);
      
      // Transform backend route format to frontend Route format
      const routes: Route[] = backendRoutes.map((backendRoute: any) => ({
        id: backendRoute.id?.toString() || Math.random().toString(),
        name: backendRoute.routeName || backendRoute.name || 'Unknown Route',
        startPoint: 'Start Point', // Your backend doesn't have this field yet
        endPoint: 'End Point', // Your backend doesn't have this field yet
        stops: backendRoute.stops || [],
        schedule: [], // Your backend doesn't have this field yet
        isActive: backendRoute.active !== undefined ? backendRoute.active : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      // Apply client-side filtering since your backend doesn't support it yet
      let filteredRoutes = routes;
      
      if (filters?.search) {
        filteredRoutes = routes.filter((route: Route) => 
          route.name.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters?.isActive !== undefined) {
        filteredRoutes = filteredRoutes.filter((route: Route) => route.isActive === filters.isActive);
      }
      
      // Apply client-side pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRoutes = filteredRoutes.slice(startIndex, endIndex);
      
      return {
        data: paginatedRoutes,
        pagination: {
          page,
          limit,
          total: filteredRoutes.length,
          totalPages: Math.ceil(filteredRoutes.length / limit)
        }
      };
    } catch (error) {
      console.log('RouteService: Backend API failed, using empty data:', error);
      
      // Return empty data if API fails
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  /**
   * Get a single route by ID
   */
  async getRouteById(id: string): Promise<Route> {
    try {
      // Use your backend endpoint
      const response = await httpClient.get(`/routes/${id}`);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new route
   */
  async createRoute(routeData: CreateRouteRequest): Promise<Route> {
    try {
      // Use your backend endpoint
      const response = await httpClient.post('/routes', routeData);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update an existing route
   */
  async updateRoute(id: string, routeData: UpdateRouteRequest): Promise<Route> {
    try {
      const response = await httpClient.put<ApiResponse<Route>>(
        `${config.endpoints.routes}/${id}`,
        routeData
      );
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a route
   */
  async deleteRoute(id: string): Promise<void> {
    try {
      await httpClient.delete(`${config.endpoints.routes}/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get routes for dropdown/select options
   */
  async getRoutesForSelect(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await httpClient.get<ApiResponse<Array<{ id: string; name: string }>>>(
        `${config.endpoints.routes}/select`
      );
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Toggle route active status
   */
  async toggleRouteStatus(id: string, isActive: boolean): Promise<Route> {
    try {
      const response = await httpClient.patch<ApiResponse<Route>>(
        `${config.endpoints.routes}/${id}/status`,
        { isActive }
      );
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add a new stop to a route
   */
  async addRouteStop(routeId: string, stopData: any): Promise<any> {
    try {
      const response = await httpClient.put(
        `${config.endpoints.routes}/${routeId}`,
        { stops: [stopData] }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a stop from a route
   */
  async deleteRouteStop(routeId: string, stopId: string): Promise<void> {
    try {
      await httpClient.delete(
        `${config.endpoints.routes}/${routeId}/stops/${stopId}`
      );
    } catch (error) {
      throw error;
    }
  },
};
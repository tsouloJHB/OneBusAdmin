import httpClient, { invalidateRouteCache } from './httpClient';
import { config } from '../config';
import { 
  Route, 
  CreateRouteRequest, 
  UpdateRouteRequest, 
  RouteFilters,
  PaginatedResponse,
  ApiResponse 
} from '../types';

const routeService = {
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
  const routes: Route[] = backendRoutes.map((backendRoute: any) => {
        // Ensure id is always a number
        let routeId: number;
        if (typeof backendRoute.id === 'number') {
          routeId = backendRoute.id;
        } else if (backendRoute.id) {
          routeId = parseInt(backendRoute.id.toString());
        } else {
          routeId = parseInt(Math.random().toString());
        }
        
        // Ensure stops are ordered by busStopIndex so UI shows correct order immediately
        const sortedStops = (backendRoute.stops || []).slice().sort((a: any, b: any) => {
          const ai = a?.busStopIndex ?? 0;
          const bi = b?.busStopIndex ?? 0;
          return ai - bi;
        });

        return {
          id: routeId,
          name: backendRoute.routeName || backendRoute.name || 'Unknown Route',
          startPoint: backendRoute.startPoint || 'Start Point',
          endPoint: backendRoute.endPoint || 'End Point',
          direction: backendRoute.direction || '',
          stops: sortedStops,
          schedule: [], // Your backend doesn't have this field yet
          isActive: backendRoute.active !== undefined ? backendRoute.active : true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
      
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
      console.log('RouteService: Creating route with data:', routeData);
      
      // Use the correct backend endpoint
      const response = await httpClient.post(config.endpoints.routes, routeData);
      
      console.log('RouteService: Route created successfully:', response.data);
      
      // Transform backend response to frontend Route format
      const backendRoute = response.data;
      
      // Ensure id is always a number
      let routeId: number;
      if (typeof backendRoute.id === 'number') {
        routeId = backendRoute.id;
      } else if (backendRoute.id) {
        routeId = parseInt(backendRoute.id.toString());
      } else {
        routeId = parseInt(Math.random().toString());
      }
      
      const route: Route = {
        id: routeId,
        name: backendRoute.routeName || backendRoute.name || 'Unknown Route',
        startPoint: backendRoute.startPoint || 'Start Point',
        endPoint: backendRoute.endPoint || 'End Point',
        stops: backendRoute.stops || [],
        schedule: backendRoute.schedule || [],
        isActive: backendRoute.active !== undefined ? backendRoute.active : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return route;
    } catch (error) {
      console.error('RouteService: Failed to create route:', error);
      throw error;
    }
  },

  /**
   * Update an existing route
   */
  async updateRoute(id: number, routeData: UpdateRouteRequest): Promise<Route> {
    try {
      console.log('RouteService: Updating route with ID:', id);
      console.log('RouteService: Update data:', routeData);
      
      const response = await httpClient.put<ApiResponse<Route>>(
        `${config.endpoints.routes}/${id}`,
        routeData
      );
      
      console.log('RouteService: Route updated successfully:', response.data);
      
      // Transform backend response to frontend Route format
      const backendRoute = response.data.data || response.data;
      
      // Ensure id is always a number
      let routeId: number;
      if (typeof backendRoute.id === 'number') {
        routeId = backendRoute.id;
      } else if (backendRoute.id) {
  const backendRouteId = backendRoute.id as string | number;
  routeId = parseInt(backendRouteId.toString());
      } else {
        routeId = parseInt(id.toString());
      }
      
      const route: Route = {
        id: routeId,
        name: backendRoute.routeName || backendRoute.name || 'Unknown Route',
        routeName: backendRoute.routeName || backendRoute.name || 'Unknown Route',
        description: backendRoute.description || '',
        company: backendRoute.company || '',
        busNumber: backendRoute.busNumber || '',
        direction: backendRoute.direction || '',
        startPoint: backendRoute.startPoint || 'Start Point',
        endPoint: backendRoute.endPoint || 'End Point',
        active: backendRoute.active !== undefined ? backendRoute.active : true,
        isActive: backendRoute.active !== undefined ? backendRoute.active : true,
        // Ensure stops are ordered by busStopIndex
        stops: (backendRoute.stops || []).slice().sort((a: any, b: any) => {
          const ai = a?.busStopIndex ?? 0;
          const bi = b?.busStopIndex ?? 0;
          return ai - bi;
        }),
        createdAt: backendRoute.createdAt ? new Date(backendRoute.createdAt) : new Date(),
        updatedAt: backendRoute.updatedAt ? new Date(backendRoute.updatedAt) : new Date(),
      };
      
      return route;
    } catch (error) {
      console.error('RouteService: Failed to update route:', error);
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
      console.log('RouteService: Adding stop to route', routeId);
      console.log('RouteService: Stop data:', stopData);
      console.log('RouteService: Sending payload:', { stops: [stopData] });
      
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
   * Update a stop's fields (including busStopIndex) by sending a PUT with a single stop in the stops array
   */
  async updateRouteStop(routeId: string, stopData: any): Promise<any> {
    try {
      console.log('RouteService: Updating stop for route', routeId, stopData);
      const stopId = stopData.id;
      if (!stopId) throw new Error('stopData.id is required');
      // Call dedicated endpoint to update index
      try {
        const response = await httpClient.post(
          `${config.endpoints.routes}/${routeId}/stops/${stopId}/index`,
          { busStopIndex: stopData.busStopIndex }
        );
        // Invalidate cached routes so UI reload fetches fresh data
        try { invalidateRouteCache(); } catch (e) { /* ignore cache invalidation failures */ }
        return response.data;
      } catch (innerErr) {
        console.warn('RouteService: POST index endpoint failed, attempting fallback PUT update', innerErr);
        // Fallback to PUT /routes/{routeId} with stops array (older behavior)
        const fallbackResponse = await httpClient.put(
          `${config.endpoints.routes}/${routeId}`,
          { stops: [stopData] }
        );
        try { invalidateRouteCache(); } catch (e) { /* ignore */ }
        return fallbackResponse.data;
      }
    } catch (error) {
      console.error('RouteService: Failed to update route stop:', error);
      throw error;
    }
  },

  /**
   * Update a stop's arbitrary fields by sending a PUT with a single stop in the stops array.
   * This is used for updating fields other than index (e.g. name/address).
   */
  async updateRouteStopFields(routeId: string, stopData: any): Promise<any> {
    try {
      console.log('RouteService: Updating stop fields for route', routeId, stopData);
      const response = await httpClient.put(
        `${config.endpoints.routes}/${routeId}`,
        { stops: [stopData] }
      );
      try { invalidateRouteCache(); } catch (e) { /* ignore */ }
      return response.data;
    } catch (error) {
      console.error('RouteService: Failed to update route stop fields:', error);
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

  /**
   * Get a single route by ID (alias for compatibility)
   */
  /**
   * Get a single route by ID. If forceReload is true a cache-busting query param is appended
   * so the http client will not return a cached response.
   */
  async getRoute(id: number, forceReload: boolean = false): Promise<Route> {
    try {
      // Append cache-busting query parameter when a fresh fetch is required
      const url = forceReload ? `${config.endpoints.routes}/${id}?cacheBust=${Date.now()}` : `${config.endpoints.routes}/${id}`;
      const response = await httpClient.get(url);
      const backendRoute = response.data;
      
      // Transform backend route format to frontend Route format
      
      // Ensure id is always a number
      let routeId: number;
      if (typeof backendRoute.id === 'number') {
        routeId = backendRoute.id;
      } else if (backendRoute.id) {
        routeId = parseInt(backendRoute.id.toString());
      } else {
        routeId = id;
      }
      
      const route: Route = {
        id: routeId,
        name: backendRoute.routeName || backendRoute.name || 'Unknown Route',
        routeName: backendRoute.routeName || backendRoute.name || 'Unknown Route',
        description: backendRoute.description || '',
        company: backendRoute.company || '',
        busNumber: backendRoute.busNumber || '',
        direction: backendRoute.direction || '',
        startPoint: backendRoute.startPoint || 'Start Point',
        endPoint: backendRoute.endPoint || 'End Point',
        active: backendRoute.active !== undefined ? backendRoute.active : true,
        isActive: backendRoute.active !== undefined ? backendRoute.active : true,
        stops: (backendRoute.stops || []).slice().sort((a: any, b: any) => {
          const ai = a?.busStopIndex ?? 0;
          const bi = b?.busStopIndex ?? 0;
          return ai - bi;
        }),
        createdAt: backendRoute.createdAt ? new Date(backendRoute.createdAt) : new Date(),
        updatedAt: backendRoute.updatedAt ? new Date(backendRoute.updatedAt) : new Date(),
      };
      
      return route;
    } catch (error) {
      console.error('RouteService: Failed to get route:', error);
      throw error;
    }
  },

  /**
   * Create a new bus stop
   */
  async createBusStop(stopData: {
    address: string;
    latitude: number;
    longitude: number;
    busStopIndex?: number;
    direction?: string;
    type?: string;
    routeId: number;
  }): Promise<any> {
    try {
      console.log('RouteService: Creating bus stop:', stopData);
      
      const response = await httpClient.post(
        `${config.endpoints.routes}/${stopData.routeId}/stops`,
        {
          latitude: stopData.latitude,
          longitude: stopData.longitude,
          address: stopData.address,
          busStopIndex: stopData.busStopIndex,
          direction: stopData.direction,
          type: stopData.type
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('RouteService: Failed to create bus stop:', error);
      throw error;
    }
  },
};

export default routeService;
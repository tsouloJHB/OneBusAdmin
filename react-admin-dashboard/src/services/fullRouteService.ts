import httpClient from './httpClient';
import { config } from '../config';
import { FullRoute, Coordinate, CreateFullRouteRequest, UpdateFullRouteRequest } from '../types';

interface FullRouteFilters {
  companyId?: number | string;
  routeId?: number | string;
}

const fullRouteService = {
  async getFullRoutes(filters?: FullRouteFilters): Promise<FullRoute[]> {
    try {
      const response = await httpClient.get(config.endpoints.fullRoutes, {
        params: {
          companyId: filters?.companyId,
          routeId: filters?.routeId,
        },
      });

      const data = response.data || [];
      return (data as any[]).map((item) => {
        const coordinates: Coordinate[] = item.coordinates || item.coords || [];
        return {
          id: typeof item.id === 'number' ? item.id : parseInt(item.id || '0', 10),
          companyId: item.companyId,
          routeId: item.routeId,
          name: item.name || 'Unnamed Route',
          direction: item.direction || '',
          description: item.description || '',
          coordinatesJson: item.coordinatesJson || JSON.stringify(coordinates),
          coordinates,
          cumulativeDistances: item.cumulativeDistances || [],
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        } as FullRoute;
      });
    } catch (error) {
      console.error('fullRouteService: failed to fetch full routes', error);
      return [];
    }
  },

  async getFullRouteById(id: number): Promise<FullRoute> {
    try {
      const response = await httpClient.get(`${config.endpoints.fullRoutes}/${id}`);
      const item = response.data;
      const coordinates: Coordinate[] = item.coordinates || item.coords || [];

      return {
        id: typeof item.id === 'number' ? item.id : parseInt(item.id || '0', 10),
        companyId: item.companyId,
        routeId: item.routeId,
        name: item.name || 'Unnamed Route',
        direction: item.direction || '',
        description: item.description || '',
        coordinatesJson: item.coordinatesJson || JSON.stringify(coordinates),
        coordinates,
        cumulativeDistances: item.cumulativeDistances || [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      } as FullRoute;
    } catch (error) {
      console.error('fullRouteService: failed to fetch full route', error);
      throw error;
    }
  },

  async createFullRoute(data: CreateFullRouteRequest): Promise<FullRoute> {
    try {
      const response = await httpClient.post(config.endpoints.fullRoutes, data);
      const item = response.data;
      const coordinates: Coordinate[] = item.coordinates || data.coordinates || [];

      return {
        id: typeof item.id === 'number' ? item.id : parseInt(item.id || '0', 10),
        companyId: item.companyId,
        routeId: item.routeId,
        name: item.name || 'Unnamed Route',
        direction: item.direction || '',
        description: item.description || '',
        coordinatesJson: item.coordinatesJson || JSON.stringify(coordinates),
        coordinates,
        cumulativeDistances: item.cumulativeDistances || [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      } as FullRoute;
    } catch (error) {
      console.error('fullRouteService: failed to create full route', error);
      throw error;
    }
  },

  async updateFullRoute(id: number, data: UpdateFullRouteRequest): Promise<FullRoute> {
    try {
      const response = await httpClient.put(`${config.endpoints.fullRoutes}/${id}`, data);
      const item = response.data;
      const coordinates: Coordinate[] = item.coordinates || data.coordinates || [];

      return {
        id: typeof item.id === 'number' ? item.id : parseInt(item.id || '0', 10),
        companyId: item.companyId,
        routeId: item.routeId,
        name: item.name || 'Unnamed Route',
        direction: item.direction || '',
        description: item.description || '',
        coordinatesJson: item.coordinatesJson || JSON.stringify(coordinates),
        coordinates,
        cumulativeDistances: item.cumulativeDistances || [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      } as FullRoute;
    } catch (error) {
      console.error('fullRouteService: failed to update full route', error);
      throw error;
    }
  },

  async deleteFullRoute(id: number): Promise<void> {
    try {
      await httpClient.delete(`${config.endpoints.fullRoutes}/${id}`);
    } catch (error) {
      console.error('fullRouteService: failed to delete full route', error);
      throw error;
    }
  },

  async backfillDistances(): Promise<any> {
    try {
      const response = await httpClient.post(`${config.endpoints.fullRoutes}/maintenance/backfill-distances`);
      return response.data;
    } catch (error) {
      console.error('fullRouteService: failed to backfill distances', error);
      throw error;
    }
  },
};

export default fullRouteService;

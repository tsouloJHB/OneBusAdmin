import httpClient from './httpClient';
import { config } from '../config';
import { DashboardStats, ApiResponse } from '../types';

// Mock data for development
const mockDashboardStats: DashboardStats = {
  totalBuses: 25,
  activeBuses: 18,
  totalRoutes: 12,
  totalUsers: 5,
  recentActivity: [
    {
      id: '1',
      type: 'bus_added',
      description: 'New bus B001 added to the fleet',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      userId: 'user1',
      userName: 'John Admin',
    },
    {
      id: '2',
      type: 'route_created',
      description: 'New route "Airport Express" created',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      userId: 'user1',
      userName: 'John Admin',
    },
    {
      id: '3',
      type: 'route_updated',
      description: 'Route "Downtown Express" schedule updated',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      userId: 'user2',
      userName: 'Jane Operator',
    },
    {
      id: '4',
      type: 'bus_updated',
      description: 'Bus B003 status changed to maintenance',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      userId: 'user1',
      userName: 'John Admin',
    },
  ],
};

const dashboardService = {
  /**
   * Get dashboard statistics from the optimized backend endpoint
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('DashboardService: Fetching dashboard stats from backend...');
      
      // Call the new unified dashboard stats endpoint
      const response = await httpClient.get('/dashboard/stats');
      const stats = response.data;
      
      console.log('DashboardService: Received stats:', stats);
      
      // Add mock recent activity since backend doesn't provide it yet
      const dashboardStats: DashboardStats = {
        ...stats,
        recentActivity: mockDashboardStats.recentActivity || [],
      };
      
      return dashboardStats;
      
    } catch (error) {
      console.error('DashboardService: Failed to fetch dashboard stats:', error);
      
      // Fallback to mock data if API call fails
      return mockDashboardStats;
    }
  },

  /**
   * Get recent activity for dashboard
   */
  async getRecentActivity(limit: number = 10): Promise<DashboardStats['recentActivity']> {
    try {
      // For development, use mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('DashboardService: Using mock recent activity for development');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockDashboardStats.recentActivity?.slice(0, limit) || [];
      }
      
      // Production API call
      const response = await httpClient.get<ApiResponse<DashboardStats['recentActivity']>>(
        `${config.endpoints.dashboard}/activity?limit=${limit}`
      );
      
      return response.data.data || [];
    } catch (error) {
      throw error;
    }
  },
};

export default dashboardService;
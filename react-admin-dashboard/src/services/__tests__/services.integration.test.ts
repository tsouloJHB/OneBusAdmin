import { 
  authService, 
  routeService, 
  busService, 
  activeBusService, 
  dashboardService,
  httpClient 
} from '../index';

describe('Services Integration', () => {
  it('should export all services correctly', () => {
    expect(authService).toBeDefined();
    expect(authService.login).toBeDefined();
    expect(authService.logout).toBeDefined();
    expect(authService.refreshToken).toBeDefined();
    expect(authService.isAuthenticated).toBeDefined();

    expect(routeService).toBeDefined();
    expect(routeService.getRoutes).toBeDefined();
    expect(routeService.createRoute).toBeDefined();
    expect(routeService.updateRoute).toBeDefined();
    expect(routeService.deleteRoute).toBeDefined();

    expect(busService).toBeDefined();
    expect(busService.getBuses).toBeDefined();
    expect(busService.createBus).toBeDefined();
    expect(busService.updateBus).toBeDefined();
    expect(busService.deleteBus).toBeDefined();

    expect(activeBusService).toBeDefined();
    expect(activeBusService.getActiveBuses).toBeDefined();
    expect(activeBusService.getActiveBusById).toBeDefined();

    expect(dashboardService).toBeDefined();
    expect(dashboardService.getDashboardStats).toBeDefined();

    expect(httpClient).toBeDefined();
  });

  it('should have correct service method signatures', () => {
    // Test that service methods are functions
    expect(typeof authService.login).toBe('function');
    expect(typeof routeService.getRoutes).toBe('function');
    expect(typeof busService.getBuses).toBe('function');
    expect(typeof activeBusService.getActiveBuses).toBe('function');
    expect(typeof dashboardService.getDashboardStats).toBe('function');
  });
});
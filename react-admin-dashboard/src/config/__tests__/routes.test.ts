import { 
  protectedRoutes, 
  notFoundRoute, 
  getNavigationRoutes, 
  getRouteByPath, 
  routeRequiresAuth 
} from '../routes';

describe('Routes Configuration', () => {
  describe('protectedRoutes', () => {
    it('should contain all expected routes', () => {
      const expectedPaths = ['/dashboard', '/routes', '/buses', '/active-buses'];
      const actualPaths = protectedRoutes.map(route => route.path);
      
      expectedPaths.forEach(path => {
        expect(actualPaths).toContain(path);
      });
    });

    it('should have all routes requiring authentication', () => {
      protectedRoutes.forEach(route => {
        expect(route.requiresAuth).toBe(true);
      });
    });

    it('should have proper navigation order', () => {
      const navigationRoutes = getNavigationRoutes();
      const orders = navigationRoutes.map(route => route.order).filter(order => order !== undefined);
      
      // Check if orders are sequential
      for (let i = 1; i < orders.length; i++) {
        expect(orders[i]).toBeGreaterThan(orders[i - 1]);
      }
    });
  });

  describe('getNavigationRoutes', () => {
    it('should return only routes that show in navigation', () => {
      const navRoutes = getNavigationRoutes();
      
      navRoutes.forEach(route => {
        expect(route.showInNavigation).toBe(true);
      });
    });

    it('should return routes in correct order', () => {
      const navRoutes = getNavigationRoutes();
      
      expect(navRoutes[0].path).toBe('/dashboard');
      expect(navRoutes[1].path).toBe('/routes');
      expect(navRoutes[2].path).toBe('/buses');
      expect(navRoutes[3].path).toBe('/active-buses');
    });
  });

  describe('getRouteByPath', () => {
    it('should return correct route for valid path', () => {
      const route = getRouteByPath('/dashboard');
      
      expect(route).toBeDefined();
      expect(route?.path).toBe('/dashboard');
      expect(route?.title).toBe('Dashboard');
    });

    it('should return undefined for invalid path', () => {
      const route = getRouteByPath('/invalid-path');
      
      expect(route).toBeUndefined();
    });

    it('should return not found route for wildcard path', () => {
      const route = getRouteByPath('*');
      
      expect(route).toBeDefined();
      expect(route?.path).toBe('*');
      expect(route?.title).toBe('Not Found');
    });
  });

  describe('routeRequiresAuth', () => {
    it('should return true for protected routes', () => {
      expect(routeRequiresAuth('/dashboard')).toBe(true);
      expect(routeRequiresAuth('/routes')).toBe(true);
      expect(routeRequiresAuth('/buses')).toBe(true);
      expect(routeRequiresAuth('/active-buses')).toBe(true);
    });

    it('should return true by default for unknown routes', () => {
      expect(routeRequiresAuth('/unknown-route')).toBe(true);
    });

    it('should return false for not found route', () => {
      expect(routeRequiresAuth('*')).toBe(false);
    });
  });

  describe('notFoundRoute', () => {
    it('should have correct configuration', () => {
      expect(notFoundRoute.path).toBe('*');
      expect(notFoundRoute.title).toBe('Not Found');
      expect(notFoundRoute.requiresAuth).toBe(false);
      expect(notFoundRoute.showInNavigation).toBe(false);
    });
  });
});
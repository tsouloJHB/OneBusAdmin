# Performance Optimization Guide

This document outlines the performance optimizations implemented in the React Admin Dashboard application and provides guidance on how to maintain and extend these optimizations.

## Table of Contents

1. [Code Splitting](#code-splitting)
2. [Component Memoization](#component-memoization)
3. [API Response Caching](#api-response-caching)
4. [Bundle Size Optimization](#bundle-size-optimization)
5. [Performance Monitoring](#performance-monitoring)

## Code Splitting

The application uses React's lazy loading and Suspense to split the code into smaller chunks that are loaded on demand.

### Implementation Details

- Route-based code splitting in `src/config/routes.tsx`
- Named chunks for better debugging using webpack comments
- Prefetching of adjacent routes for faster navigation
- Error handling for chunk loading failures

### How to Add New Routes

When adding new routes, follow this pattern:

```jsx
// Use webpackChunkName comment for naming the chunk
const NewPage = lazy(() => import(/* webpackChunkName: "new-page" */ '../components/pages/NewPage'));

// Add to prefetchRoute function
const prefetchRoute = (routePath: string) => {
  switch (routePath) {
    // ...existing cases
    case '/new-page':
      import(/* webpackChunkName: "new-page" */ '../components/pages/NewPage');
      break;
  }
};
```

## Component Memoization

Heavy components are memoized using React.memo to prevent unnecessary re-renders.

### Memoized Components

- BusTable
- RouteTable
- ActiveBusList

### How to Memoize New Components

For complex components that receive props but don't need to re-render on every parent render:

```jsx
export default React.memo(MyComponent, (prevProps, nextProps) => {
  // Return true if props are equal (no re-render needed)
  // Return false if props changed (re-render needed)
  return prevProps.id === nextProps.id && prevProps.data === nextProps.data;
});
```

## API Response Caching

The application implements a caching layer for API responses to reduce network requests and improve perceived performance.

### Cache Implementation

- In-memory cache with TTL (Time-To-Live)
- Configurable per endpoint
- Stale-while-revalidate strategy for failed requests
- Automatic cache invalidation on mutations

### Cache Configuration

Cache TTLs are configured in `src/services/httpClient.ts`:

```javascript
const CACHE_CONFIG = {
  ttlMap: {
    '/api/dashboard/stats': 5 * 60 * 1000, // 5 minutes
    '/api/routes': 2 * 60 * 1000, // 2 minutes
    '/api/buses': 2 * 60 * 1000, // 2 minutes
    '/api/active-buses': 30 * 1000, // 30 seconds
  },
  // ...
};
```

### Cache Invalidation

To invalidate cache when data changes:

```javascript
import { invalidateRouteCache } from './httpClient';

// After creating/updating/deleting a route
invalidateRouteCache();
```

## Bundle Size Optimization

The application uses webpack optimization techniques to reduce bundle size.

### Bundle Analysis

To analyze the bundle size:

```bash
# Generate bundle analysis report
npm run analyze:bundle

# View source map explorer
npm run analyze
```

### Chunk Splitting Strategy

- React and related libraries in a vendor chunk
- Material-UI in a separate chunk
- Route-based code splitting for page components

## Performance Monitoring

### Key Metrics to Monitor

1. **First Contentful Paint (FCP)**: Time until the first content is rendered
2. **Largest Contentful Paint (LCP)**: Time until the largest content element is rendered
3. **Time to Interactive (TTI)**: Time until the page becomes fully interactive
4. **Total Bundle Size**: Keep main bundle under 200KB (compressed)
5. **API Response Times**: Monitor and optimize slow endpoints

### Performance Testing

Run performance tests regularly:

1. Use Chrome DevTools Lighthouse for overall performance scoring
2. Use the Network tab to monitor API response times
3. Use the Performance tab to identify render bottlenecks
4. Check bundle sizes with the analyze scripts

## Best Practices

1. **Avoid Large Dependencies**: Evaluate the size impact of new dependencies
2. **Use Code Splitting**: Split large components and routes
3. **Optimize Images**: Use WebP format and appropriate sizes
4. **Memoize Components**: Use React.memo for expensive components
5. **Cache API Responses**: Configure appropriate TTL for different endpoints
6. **Use Virtual Scrolling**: For large data tables
7. **Debounce Event Handlers**: For search inputs and window resize events
8. **Optimize Renders**: Avoid unnecessary re-renders by using memoization and proper state management
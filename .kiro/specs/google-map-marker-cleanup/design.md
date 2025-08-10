# Google Map Marker Cleanup Design

## Overview

The current GoogleMap component has a critical issue where markers are not properly removed when the underlying data changes. This design addresses the marker lifecycle management problem by implementing a robust marker tracking and cleanup system that ensures map markers always reflect the current application state.

## Architecture

### Current Problem Analysis

The existing Marker component has several issues:
1. **No marker tracking**: Individual Marker components don't communicate with each other
2. **Incomplete cleanup**: Markers are only cleaned up on component unmount, not on data changes
3. **No synchronization**: No mechanism to ensure markers match the current data set
4. **Memory leaks**: Orphaned marker references remain in Google Maps

### Proposed Solution Architecture

```mermaid
graph TD
    A[RouteMap Component] --> B[MarkerManager Hook]
    B --> C[Marker Registry]
    B --> D[Cleanup Controller]
    B --> E[Sync Engine]
    
    C --> F[Active Markers Map]
    D --> G[Google Maps API]
    E --> H[Data Comparison]
    
    F --> I[Marker References]
    G --> J[setMap(null)]
    H --> K[Add/Remove Operations]
```

## Components and Interfaces

### 1. MarkerManager Hook

A custom hook that manages all marker operations for a map instance.

```typescript
interface MarkerData {
  id: string;
  position: LatLngLiteral;
  title?: string;
  icon?: string | MapIcon;
  onClick?: () => void;
  isTemporary?: boolean;
}

interface MarkerManager {
  updateMarkers: (markers: MarkerData[]) => void;
  clearAllMarkers: () => void;
  getActiveMarkers: () => Map<string, google.maps.Marker>;
}

const useMarkerManager = (map: google.maps.Map | null): MarkerManager
```

### 2. Marker Registry

A centralized registry that tracks all active markers.

```typescript
class MarkerRegistry {
  private markers: Map<string, google.maps.Marker> = new Map();
  private listeners: Map<string, google.maps.MapsEventListener> = new Map();
  
  addMarker(id: string, marker: google.maps.Marker, listener?: google.maps.MapsEventListener): void
  removeMarker(id: string): void
  getMarker(id: string): google.maps.Marker | undefined
  getAllMarkers(): Map<string, google.maps.Marker>
  clearAll(): void
}
```

### 3. Sync Engine

Compares current markers with desired markers and performs efficient updates.

```typescript
interface SyncOperation {
  type: 'add' | 'remove' | 'update';
  id: string;
  markerData?: MarkerData;
}

class MarkerSyncEngine {
  calculateOperations(
    current: Map<string, google.maps.Marker>,
    desired: MarkerData[]
  ): SyncOperation[]
  
  executeOperations(
    operations: SyncOperation[],
    map: google.maps.Map,
    registry: MarkerRegistry
  ): void
}
```

## Data Models

### MarkerData Interface

```typescript
interface MarkerData {
  id: string;                    // Unique identifier for the marker
  position: LatLngLiteral;       // Lat/lng coordinates
  title?: string;                // Tooltip text
  icon?: string | MapIcon;       // Custom icon
  onClick?: () => void;          // Click handler
  isTemporary?: boolean;         // Flag for temporary markers
  metadata?: Record<string, any>; // Additional data
}
```

### MarkerState Interface

```typescript
interface MarkerState {
  activeMarkers: Map<string, google.maps.Marker>;
  pendingOperations: SyncOperation[];
  lastSyncTimestamp: number;
  isUpdating: boolean;
}
```

## Error Handling

### Marker Creation Errors

```typescript
class MarkerCreationError extends Error {
  constructor(id: string, cause: Error) {
    super(`Failed to create marker ${id}: ${cause.message}`);
    this.name = 'MarkerCreationError';
  }
}
```

### Cleanup Errors

```typescript
class MarkerCleanupError extends Error {
  constructor(id: string, cause: Error) {
    super(`Failed to cleanup marker ${id}: ${cause.message}`);
    this.name = 'MarkerCleanupError';
  }
}
```

### Error Recovery Strategy

1. **Graceful Degradation**: If marker operations fail, log errors but continue
2. **Retry Logic**: Implement exponential backoff for transient failures
3. **Fallback Cleanup**: Force cleanup all markers if sync fails
4. **User Notification**: Show non-blocking notifications for critical errors

## Testing Strategy

### Unit Tests

1. **MarkerManager Hook Tests**
   - Test marker addition and removal
   - Test bulk operations
   - Test error handling
   - Test cleanup on unmount

2. **MarkerRegistry Tests**
   - Test marker storage and retrieval
   - Test listener management
   - Test bulk operations
   - Test memory cleanup

3. **SyncEngine Tests**
   - Test operation calculation
   - Test operation execution
   - Test edge cases (empty sets, duplicates)
   - Test performance with large datasets

### Integration Tests

1. **RouteMap Integration**
   - Test marker updates with real data
   - Test temporary marker removal
   - Test batch operations
   - Test error scenarios

2. **Google Maps Integration**
   - Test with real Google Maps API
   - Test marker visibility
   - Test click handlers
   - Test memory usage

### Performance Tests

1. **Large Dataset Tests**
   - Test with 100+ markers
   - Measure update performance
   - Test memory usage
   - Test cleanup efficiency

2. **Rapid Update Tests**
   - Test frequent marker updates
   - Test concurrent operations
   - Test debouncing effectiveness

## Implementation Plan

### Phase 1: Core Infrastructure
- Implement MarkerRegistry class
- Create MarkerManager hook
- Add basic marker tracking

### Phase 2: Sync Engine
- Implement MarkerSyncEngine
- Add operation calculation logic
- Add operation execution logic

### Phase 3: Integration
- Update RouteMap to use MarkerManager
- Remove old Marker components
- Add error handling

### Phase 4: Optimization
- Add performance optimizations
- Implement debouncing
- Add memory leak prevention

### Phase 5: Testing & Polish
- Add comprehensive tests
- Performance tuning
- Documentation updates

## Migration Strategy

### Backward Compatibility

The new system will be implemented alongside the existing Marker components initially, allowing for gradual migration.

### Migration Steps

1. **Implement new system**: Add MarkerManager without breaking existing code
2. **Update RouteMap**: Switch RouteMap to use new system
3. **Test thoroughly**: Ensure all functionality works
4. **Remove old code**: Clean up old Marker components
5. **Update documentation**: Update component documentation

## Performance Considerations

### Optimization Techniques

1. **Debouncing**: Batch marker updates to avoid excessive API calls
2. **Memoization**: Cache marker instances and reuse when possible
3. **Lazy Cleanup**: Defer non-critical cleanup operations
4. **Efficient Diffing**: Use efficient algorithms for marker comparison

### Memory Management

1. **Reference Cleanup**: Ensure all marker references are properly cleaned
2. **Listener Removal**: Remove all event listeners on cleanup
3. **Weak References**: Use WeakMap where appropriate
4. **Garbage Collection**: Trigger cleanup at appropriate intervals

## Security Considerations

### Input Validation

1. **Marker Data**: Validate all marker data before processing
2. **Position Bounds**: Ensure coordinates are within valid ranges
3. **Icon URLs**: Validate icon URLs to prevent XSS
4. **Click Handlers**: Sanitize click handler functions

### API Security

1. **Rate Limiting**: Implement rate limiting for marker operations
2. **Error Sanitization**: Sanitize error messages before logging
3. **Memory Limits**: Prevent excessive memory usage
4. **Resource Cleanup**: Ensure proper resource cleanup on errors
# Route Map Page Design Document

## Overview

This design document outlines the implementation of a dedicated full-screen route map page that replaces the current dialog-based map view. The new page will provide better space utilization, improved user experience, and enhanced navigation for viewing route maps and bus stop information.

## Architecture

### Page Structure
The route map page will follow a full-screen layout pattern with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│ App Header (existing)                                       │
├─────────────────────────────────────────────────────────────┤
│ Page Header with Breadcrumbs                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│ │                         │ │                             │ │
│ │                         │ │   Bus Stop Info Panel      │ │
│ │      Google Map         │ │   (collapsible)             │ │
│ │                         │ │                             │ │
│ │                         │ └─────────────────────────────┘ │
│ │                         │                               │ │
│ │                         │ ┌─────────────────────────────┐ │
│ │                         │ │                             │ │
│ │                         │ │   Bus Stops List            │ │
│ │                         │ │   (scrollable)              │ │
│ │                         │ │                             │ │
│ └─────────────────────────┘ └─────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Routing Architecture
- **New Route**: `/routes/:id/map`
- **Route Parameters**: `id` - The route ID to display
- **Navigation**: Accessible from routes table "View in Map" action
- **Breadcrumbs**: Routes > [Route Name] > Map

## Components and Interfaces

### 1. RouteMapPage Component
**Location**: `src/components/pages/RouteMapPage.tsx`

**Props Interface**:
```typescript
interface RouteMapPageProps {
  // No props - uses URL parameters
}
```

**Key Features**:
- URL parameter extraction for route ID
- Route data fetching and error handling
- Layout management for map and side panels
- Breadcrumb navigation
- Responsive design for mobile/tablet/desktop

### 2. Enhanced RouteMap Component
**Location**: `src/components/features/RouteMap.tsx` (existing, enhanced)

**New Props Interface**:
```typescript
interface RouteMapProps {
  route: Route;
  height?: string | number;
  showFullscreenButton?: boolean;
  showLocationButton?: boolean;
  onStopSelect?: (stop: BusStop) => void;  // New
  selectedStop?: BusStop | null;           // New
  layout?: 'dialog' | 'page';              // New
}
```

**Enhancements**:
- Remove internal bus stop info panel (moved to page level)
- Add callback for stop selection
- Support for different layout modes
- Improved marker interaction

### 3. BusStopInfoPanel Component
**Location**: `src/components/features/BusStopInfoPanel.tsx` (new)

**Props Interface**:
```typescript
interface BusStopInfoPanelProps {
  stop: BusStop | null;
  onClose: () => void;
  isOpen: boolean;
}
```

**Features**:
- Collapsible panel design
- Detailed stop information display
- Close/minimize functionality
- Responsive behavior

### 4. BusStopsList Component
**Location**: `src/components/features/BusStopsList.tsx` (new)

**Props Interface**:
```typescript
interface BusStopsListProps {
  stops: BusStop[];
  selectedStop: BusStop | null;
  onStopSelect: (stop: BusStop) => void;
  maxHeight?: string;
}
```

**Features**:
- Scrollable list of all bus stops
- Highlight selected stop
- Click to select functionality
- Search/filter capability

### 5. PageBreadcrumbs Component
**Location**: `src/components/ui/PageBreadcrumbs.tsx` (new)

**Props Interface**:
```typescript
interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
}
```

## Data Models

### Enhanced Route Interface
```typescript
interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  stops: BusStop[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BusStop {
  id: string;
  name?: string;
  address: string;
  latitude: number;
  longitude: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}
```

### Page State Management
```typescript
interface RouteMapPageState {
  route: Route | null;
  loading: boolean;
  error: ApiError | null;
  selectedStop: BusStop | null;
  infoPanelOpen: boolean;
  mapCenter: LatLngLiteral;
  mapZoom: number;
}
```

## Error Handling

### Route Not Found
- Display user-friendly error message
- Provide navigation back to routes list
- Log error for debugging

### Map Loading Errors
- Fallback to static route information
- Retry mechanism for Google Maps API
- Clear error messaging

### Network Errors
- Retry functionality for route data
- Offline state indication
- Graceful degradation

## Testing Strategy

### Unit Tests
1. **RouteMapPage Component**
   - Route parameter extraction
   - Data fetching and error states
   - Stop selection handling
   - Breadcrumb generation

2. **BusStopInfoPanel Component**
   - Panel open/close functionality
   - Stop information display
   - Responsive behavior

3. **BusStopsList Component**
   - Stop selection
   - List filtering
   - Scroll behavior

### Integration Tests
1. **Navigation Flow**
   - Routes page → Map page navigation
   - Breadcrumb navigation
   - Back button functionality

2. **Map Interaction**
   - Marker click handling
   - Stop selection synchronization
   - Panel state management

### E2E Tests
1. **Complete User Journey**
   - Navigate from routes list to map
   - Interact with bus stop markers
   - View stop information
   - Navigate back to routes

## Performance Considerations

### Code Splitting
- Lazy load RouteMapPage component
- Separate chunk for Google Maps integration
- Prefetch adjacent routes

### Map Optimization
- Marker clustering for routes with many stops
- Efficient re-rendering on stop selection
- Memory management for map instances

### Data Loading
- Cache route data to avoid refetching
- Optimistic updates for better UX
- Background prefetching of related data

## Accessibility

### Keyboard Navigation
- Tab order for map controls and panels
- Keyboard shortcuts for common actions
- Focus management between components

### Screen Reader Support
- ARIA labels for map regions
- Descriptive text for bus stops
- Status announcements for selections

### Visual Accessibility
- High contrast mode support
- Scalable text and UI elements
- Color-blind friendly markers

## Mobile Responsiveness

### Layout Adaptations
- **Mobile**: Stack map above stop list
- **Tablet**: Side-by-side with collapsible panels
- **Desktop**: Full side panel layout

### Touch Interactions
- Larger touch targets for markers
- Swipe gestures for panel control
- Pinch-to-zoom map support

## Implementation Phases

### Phase 1: Core Page Structure
- Create RouteMapPage component
- Add routing configuration
- Implement basic layout

### Phase 2: Enhanced Map Integration
- Modify RouteMap component for page layout
- Add stop selection callbacks
- Implement marker interactions

### Phase 3: Side Panels
- Create BusStopInfoPanel component
- Create BusStopsList component
- Integrate with map selection

### Phase 4: Navigation & Polish
- Add breadcrumb navigation
- Implement error handling
- Add responsive design

### Phase 5: Testing & Optimization
- Comprehensive testing suite
- Performance optimization
- Accessibility improvements

## Migration Strategy

### Backward Compatibility
- Keep existing dialog-based map as fallback
- Feature flag for new page rollout
- Gradual migration of users

### Data Migration
- No data migration required
- Uses existing route and stop data
- Maintains current API contracts

## Security Considerations

### Route Access Control
- Validate route ID parameters
- Check user permissions for route access
- Sanitize URL parameters

### API Security
- Maintain existing authentication
- Rate limiting for map requests
- Secure Google Maps API key handling
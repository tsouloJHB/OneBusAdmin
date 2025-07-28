# Implementation Plan

- [x] 1. Create core page structure and routing
  - Create RouteMapPage component with basic layout structure
  - Add route configuration for `/routes/:id/map` path
  - Implement URL parameter extraction for route ID
  - Add lazy loading and error boundaries for the new page
  - _Requirements: 1.1, 4.1, 4.2_

- [ ] 2. Implement breadcrumb navigation system
  - Create PageBreadcrumbs component with Material-UI Breadcrumbs
  - Add breadcrumb generation logic for Routes > [Route Name] > Map
  - Implement navigation functionality for breadcrumb items
  - Integrate breadcrumbs into RouteMapPage header
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Create bus stop information panel component
  - Create BusStopInfoPanel component with collapsible design
  - Implement stop information display with address, coordinates, and details
  - Add close/minimize functionality with proper state management
  - Style panel with Material-UI components for consistent design
  - _Requirements: 3.2, 3.3_

- [ ] 4. Create bus stops list component
  - Create BusStopsList component with scrollable list design
  - Implement stop selection highlighting and click handlers
  - Add search/filter functionality for bus stops
  - Integrate with main page state for stop selection synchronization
  - _Requirements: 3.2, 3.3_

- [ ] 5. Enhance RouteMap component for page layout
  - Modify RouteMap component to support page layout mode
  - Add onStopSelect callback prop for external stop selection handling
  - Remove internal bus stop info panel (moved to page level)
  - Update marker click handlers to use external callbacks
  - _Requirements: 1.2, 1.3, 3.2_

- [ ] 6. Implement full-screen layout and responsive design
  - Create responsive grid layout for map and side panels
  - Implement mobile-first responsive breakpoints
  - Add proper height calculations for full viewport utilization
  - Test layout on mobile, tablet, and desktop screen sizes
  - _Requirements: 3.1, 3.2_

- [ ] 7. Add route data fetching and error handling
  - Implement route data fetching using existing routeService
  - Add loading states and error handling for invalid route IDs
  - Create error boundary for map-specific errors
  - Add retry functionality for failed requests
  - _Requirements: 4.2, 4.3_

- [ ] 8. Update routes table navigation
  - Modify RoutesPage "View in Map" action to navigate to new page
  - Remove existing map dialog implementation
  - Update button text and icons for clarity
  - Test navigation flow from routes list to map page
  - _Requirements: 1.1, 1.4_

- [ ] 9. Implement state management and stop selection
  - Add state management for selected stop and panel visibility
  - Implement stop selection synchronization between map and list
  - Add keyboard navigation support for stop selection
  - Create proper focus management for accessibility
  - _Requirements: 1.3, 3.2, 3.3_

- [ ] 10. Add comprehensive testing suite
  - Write unit tests for RouteMapPage component
  - Create tests for BusStopInfoPanel and BusStopsList components
  - Add integration tests for navigation flow
  - Implement E2E tests for complete user journey
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 11. Optimize performance and accessibility
  - Add code splitting for new components
  - Implement proper ARIA labels and keyboard navigation
  - Add loading optimizations for map and route data
  - Test with screen readers and accessibility tools
  - _Requirements: 2.1, 3.1, 4.1_

- [ ] 12. Final integration and cleanup
  - Remove unused dialog-based map code
  - Update route configuration exports
  - Add proper TypeScript types for all new components
  - Perform final testing and bug fixes
  - _Requirements: 1.1, 2.3, 3.1, 4.1_
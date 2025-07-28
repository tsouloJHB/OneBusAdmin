# Requirements Document

## Introduction

This feature will replace the current dialog-based route map view with a dedicated full-screen page that provides better space utilization and user experience for viewing route maps and bus stop information.

## Requirements

### Requirement 1

**User Story:** As an admin user, I want to view route maps on a dedicated full-screen page instead of a dialog, so that I have more space to interact with the map and view bus stop details.

#### Acceptance Criteria

1. WHEN I click "View in Map" for a route THEN the system SHALL navigate to a dedicated route map page
2. WHEN I am on the route map page THEN the system SHALL display the full route map with all bus stops
3. WHEN I click on bus stop markers THEN the system SHALL display detailed information in a side panel or below the map
4. WHEN I am on the route map page THEN the system SHALL provide a back button to return to the routes list

### Requirement 2

**User Story:** As an admin user, I want to have better navigation and breadcrumbs on the route map page, so that I know where I am and can easily navigate back.

#### Acceptance Criteria

1. WHEN I am on the route map page THEN the system SHALL display breadcrumbs showing "Routes > [Route Name] > Map"
2. WHEN I click on breadcrumb items THEN the system SHALL navigate to the appropriate page
3. WHEN I am on the route map page THEN the system SHALL display the route name prominently in the page header

### Requirement 3

**User Story:** As an admin user, I want the route map page to utilize the full screen space effectively, so that I can see more map details and bus stop information simultaneously.

#### Acceptance Criteria

1. WHEN I am on the route map page THEN the system SHALL use the full viewport height minus header/navigation
2. WHEN I click on a bus stop marker THEN the system SHALL display stop information in a dedicated panel without overlapping the map
3. WHEN viewing bus stop information THEN the system SHALL allow me to close the panel and select other stops
4. WHEN I am on the route map page THEN the system SHALL provide map controls (zoom, location, fullscreen) that work properly

### Requirement 4

**User Story:** As an admin user, I want the route map page to be accessible via direct URL, so that I can bookmark or share specific route maps.

#### Acceptance Criteria

1. WHEN I navigate to `/routes/:id/map` THEN the system SHALL display the route map page for that specific route
2. WHEN I refresh the route map page THEN the system SHALL maintain the current view and load the correct route data
3. WHEN I access an invalid route ID THEN the system SHALL display an appropriate error message and navigation options

### Requirement 5

**User Story:** As an admin user, I want to add new bus stops to a route by clicking on the map, so that I can expand route coverage and update stop locations.

#### Acceptance Criteria

1. WHEN I am on the route map page THEN the system SHALL provide an "Add Stop" mode toggle button
2. WHEN I enable "Add Stop" mode and click on the map THEN the system SHALL create a new bus stop marker at that location
3. WHEN I create a new bus stop THEN the system SHALL prompt me to enter stop details (name, address)
4. WHEN I save a new bus stop THEN the system SHALL update the route in the database with the new stop
5. WHEN I cancel adding a new stop THEN the system SHALL remove the temporary marker and return to normal mode

### Requirement 6

**User Story:** As an admin user, I want to delete existing bus stops from a route, so that I can remove outdated or incorrect stop locations.

#### Acceptance Criteria

1. WHEN I right-click on a bus stop marker THEN the system SHALL display a context menu with delete option
2. WHEN I select delete from the context menu THEN the system SHALL show a confirmation dialog
3. WHEN I confirm deletion THEN the system SHALL remove the stop from the route and update the database
4. WHEN I cancel deletion THEN the system SHALL close the confirmation dialog without changes
5. WHEN a stop is deleted THEN the system SHALL update the stop numbering for remaining stops

### Requirement 7

**User Story:** As an admin user, I want to drag and drop bus stop markers to new locations, so that I can correct stop positions and optimize route layout.

#### Acceptance Criteria

1. WHEN I am on the route map page THEN the system SHALL provide an "Edit Mode" toggle button
2. WHEN I enable "Edit Mode" THEN all bus stop markers SHALL become draggable
3. WHEN I drag a bus stop marker to a new location THEN the system SHALL update the stop coordinates in real-time
4. WHEN I finish dragging a marker THEN the system SHALL save the new coordinates to the database
5. WHEN I disable "Edit Mode" THEN markers SHALL return to non-draggable state

### Requirement 8

**User Story:** As an admin user, I want to see visual feedback when editing bus stops, so that I understand the current editing state and can track my changes.

#### Acceptance Criteria

1. WHEN I am in "Add Stop" mode THEN the system SHALL change the cursor to indicate clickable areas
2. WHEN I am in "Edit Mode" THEN draggable markers SHALL have visual indicators (different color/style)
3. WHEN I make changes to stops THEN the system SHALL show a save indicator or unsaved changes warning
4. WHEN changes are successfully saved THEN the system SHALL display a success notification
5. WHEN there are save errors THEN the system SHALL display error messages and allow retry

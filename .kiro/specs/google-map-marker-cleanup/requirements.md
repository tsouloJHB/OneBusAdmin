# Google Map Marker Cleanup Requirements

## Introduction

The GoogleMap component currently has an issue where markers are not properly removed from the map when the underlying data changes. Specifically, when temporary stops are removed from the batch session, the markers remain visible on the map even though the React state has been updated correctly.

## Requirements

### Requirement 1: Marker Lifecycle Management

**User Story:** As a user managing bus stops, I want markers to be automatically removed from the map when the underlying data is removed, so that the map accurately reflects the current state.

#### Acceptance Criteria

1. WHEN a temporary stop is removed from the batch session THEN the corresponding marker SHALL be removed from the Google Map
2. WHEN the temporaryStops array becomes empty THEN all temporary markers SHALL be removed from the map
3. WHEN the component re-renders with updated marker data THEN the map SHALL only display markers for the current data set
4. WHEN markers are removed THEN there SHALL be no memory leaks or orphaned marker references

### Requirement 2: Marker Reference Tracking

**User Story:** As a developer, I want the GoogleMap component to properly track marker references, so that markers can be efficiently added and removed.

#### Acceptance Criteria

1. WHEN markers are created THEN the component SHALL maintain references to all marker instances
2. WHEN marker data changes THEN the component SHALL compare old and new marker sets
3. WHEN markers need to be removed THEN the component SHALL call the appropriate Google Maps API cleanup methods
4. WHEN the component unmounts THEN all marker references SHALL be properly cleaned up

### Requirement 3: Efficient Marker Updates

**User Story:** As a user, I want marker updates to be performant and smooth, so that the map remains responsive during batch operations.

#### Acceptance Criteria

1. WHEN marker data changes THEN the component SHALL only update markers that have actually changed
2. WHEN removing multiple markers THEN the component SHALL batch the removal operations
3. WHEN adding and removing markers simultaneously THEN the component SHALL optimize the operations
4. WHEN marker updates occur THEN the map SHALL not flicker or reload unnecessarily

### Requirement 4: Marker State Synchronization

**User Story:** As a user, I want the map markers to always reflect the current application state, so that I can trust what I see on the map.

#### Acceptance Criteria

1. WHEN React state updates THEN the map markers SHALL update to match within one render cycle
2. WHEN temporary stops are filtered out THEN only the remaining markers SHALL be visible
3. WHEN the component receives new props THEN marker visibility SHALL be synchronized immediately
4. WHEN debugging marker issues THEN appropriate logging SHALL be available to trace marker lifecycle
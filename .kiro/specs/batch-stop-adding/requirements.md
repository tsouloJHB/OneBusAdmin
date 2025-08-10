# Batch Stop Adding Feature - Requirements Document

## Introduction

This feature improves the bus stop adding workflow by allowing users to add multiple stops in a batch session without individual backend saves. Users can add multiple stops locally, review them, and then save all stops to the backend in a single operation.

## Requirements

### Requirement 1: Local Stop Collection

**User Story:** As a route manager, I want to add multiple bus stops in a single session without each stop being immediately saved to the backend, so that I can work more efficiently and review all stops before committing them.

#### Acceptance Criteria

1. WHEN I click "Add Stop" THEN the system SHALL enter batch add mode
2. WHEN I click on the map THEN the system SHALL show a new stop form
3. WHEN I fill out the stop details and click "Save & Continue Adding" THEN the system SHALL:
   - Store the stop data locally in component state
   - Close the stop form
   - Keep the map in add mode
   - Show the new stop as a temporary marker on the map
   - Allow me to immediately click on the map to add another stop
4. WHEN I add multiple stops THEN the system SHALL show all temporary stops as distinct markers on the map
5. WHEN I am in batch add mode THEN the system SHALL display a counter showing how many stops are pending save

### Requirement 2: Temporary Stop Visualization

**User Story:** As a route manager, I want to see all the stops I've added locally before saving them, so that I can review their positions and make adjustments if needed.

#### Acceptance Criteria

1. WHEN I add stops locally THEN the system SHALL display them as temporary markers with a different visual style (e.g., different color, dashed border)
2. WHEN I hover over a temporary marker THEN the system SHALL show a tooltip with the stop details
3. WHEN I click on a temporary marker THEN the system SHALL allow me to edit or delete that temporary stop
4. WHEN I have temporary stops THEN the system SHALL show a summary panel listing all pending stops

### Requirement 3: Batch Save Operation

**User Story:** As a route manager, I want to save all my locally added stops to the backend in a single operation, so that I can commit all my work at once and handle any errors collectively.

#### Acceptance Criteria

1. WHEN I click "Save All Stops" THEN the system SHALL:
   - Save all temporary stops to the backend in sequence
   - Show a progress indicator during the save operation
   - Display success/error messages for the batch operation
   - Refresh the route data to show the saved stops
   - Exit batch add mode
2. WHEN saving fails for any stop THEN the system SHALL:
   - Show which stops failed to save
   - Keep the failed stops in temporary state
   - Allow me to retry saving or edit the failed stops
3. WHEN I click "Save & Done" on the last stop THEN the system SHALL save all stops and exit add mode

### Requirement 4: Session Management

**User Story:** As a route manager, I want to be able to cancel my batch adding session or exit add mode without losing my work accidentally, so that I have control over when my changes are committed.

#### Acceptance Criteria

1. WHEN I click "Done Adding" THEN the system SHALL:
   - Show a confirmation dialog if there are unsaved temporary stops
   - Allow me to save all stops, discard all stops, or continue adding
2. WHEN I try to navigate away with unsaved stops THEN the system SHALL warn me about unsaved changes
3. WHEN I click "Cancel" on a stop form THEN the system SHALL only cancel that specific stop, not the entire session
4. WHEN I have temporary stops THEN the system SHALL show a "Clear All" option to remove all temporary stops

### Requirement 5: Enhanced User Interface

**User Story:** As a route manager, I want clear visual feedback about my batch adding session, so that I understand what stops are temporary vs saved and what actions are available.

#### Acceptance Criteria

1. WHEN I am in batch add mode THEN the system SHALL:
   - Show a prominent header indicating "Batch Add Mode"
   - Display the count of temporary stops
   - Show "Save All Stops" and "Done Adding" buttons
2. WHEN I have temporary stops THEN the system SHALL:
   - Show them in a different color/style than saved stops
   - Display a summary panel with all temporary stop details
   - Show the total number of stops to be saved
3. WHEN I am adding a new stop THEN the form SHALL show:
   - "Add to Batch" (instead of "Save & Continue Adding")
   - "Add & Save All" (instead of "Save & Done")
   - "Cancel" (cancels only this stop)

### Requirement 6: Error Handling and Validation

**User Story:** As a route manager, I want proper error handling during batch operations, so that I don't lose my work if something goes wrong.

#### Acceptance Criteria

1. WHEN a batch save operation fails THEN the system SHALL:
   - Show detailed error messages for each failed stop
   - Keep failed stops in temporary state for retry
   - Allow partial success (some stops saved, others failed)
2. WHEN I try to add a stop with invalid data THEN the system SHALL:
   - Show validation errors
   - Prevent adding the stop to the batch until fixed
3. WHEN the network connection is lost THEN the system SHALL:
   - Preserve all temporary stops in local state
   - Show a warning about connectivity
   - Allow retry when connection is restored

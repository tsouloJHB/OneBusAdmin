# Bus Company Management Requirements

## Introduction

This feature creates a hierarchical bus management system where users first select a bus company, then navigate to either bus number management or registered buses. This provides a structured approach to managing bus operations by company, making it easier to organize and view bus-related data.

## Requirements

### Requirement 1: Company Selection Interface

**User Story:** As a bus system administrator, I want to view and select bus companies, so that I can manage buses organized by company.

#### Acceptance Criteria

1. WHEN I navigate to the Buses page THEN I SHALL see a list of all bus companies
2. WHEN I view the company list THEN each company SHALL display company name, registration number, company code, and city
3. WHEN I click on a company THEN I SHALL navigate to the company's bus management interface
4. WHEN I search for companies THEN I SHALL be able to search by name, registration number, company code, or city
5. WHEN no companies exist THEN I SHALL see an appropriate empty state message

### Requirement 2: Company Bus Management Interface

**User Story:** As a bus system administrator, I want to manage buses for a selected company, so that I can organize bus operations by company.

#### Acceptance Criteria

1. WHEN I select a company THEN I SHALL see two main sections: "Bus Number Management" and "Registered Buses"
2. WHEN I view the company interface THEN I SHALL see the company name and details in the header
3. WHEN I want to go back THEN I SHALL have a clear navigation option to return to the company list
4. WHEN I switch between sections THEN the interface SHALL maintain the selected company context

### Requirement 3: Bus Number Management Section

**User Story:** As a bus system administrator, I want to manage bus numbers for a company, so that I can assign and track bus numbers within the company.

#### Acceptance Criteria

1. WHEN I access Bus Number Management THEN I SHALL see all bus numbers associated with the selected company
2. WHEN I view bus numbers THEN each entry SHALL show bus number, route information, and status
3. WHEN I want to add a new bus number THEN I SHALL have an "Add Bus Number" button
4. WHEN I want to edit a bus number THEN I SHALL be able to click on the bus number entry
5. WHEN I want to delete a bus number THEN I SHALL have a delete option with confirmation

### Requirement 4: Registered Buses Section

**User Story:** As a bus system administrator, I want to view registered buses for a company, so that I can see the actual bus fleet and their details.

#### Acceptance Criteria

1. WHEN I access Registered Buses THEN I SHALL see all registered buses for the selected company
2. WHEN I view registered buses THEN each entry SHALL show bus details, registration info, and current status
3. WHEN I want to view bus details THEN I SHALL be able to click on a bus entry for more information
4. WHEN I want to add a new registered bus THEN I SHALL have an "Add Registered Bus" button
5. WHEN buses are assigned to routes THEN I SHALL see the route assignment information

### Requirement 5: Company Management Operations

**User Story:** As a bus system administrator, I want to manage bus companies, so that I can maintain the company database.

#### Acceptance Criteria

1. WHEN I want to add a new company THEN I SHALL have an "Add Company" button on the company list
2. WHEN I want to edit a company THEN I SHALL be able to access company edit functionality
3. WHEN I want to delete a company THEN I SHALL have a delete option with confirmation
4. WHEN I delete a company THEN the system SHALL handle associated buses appropriately
5. WHEN I save company changes THEN the system SHALL validate required fields

### Requirement 6: Search and Filter Functionality

**User Story:** As a bus system administrator, I want to search and filter companies and buses, so that I can quickly find specific information.

#### Acceptance Criteria

1. WHEN I search companies THEN I SHALL be able to search by name, registration number, company code, or city
2. WHEN I filter bus numbers THEN I SHALL be able to filter by route, status, or other criteria
3. WHEN I filter registered buses THEN I SHALL be able to filter by status, route assignment, or other criteria
4. WHEN I clear filters THEN all data SHALL be displayed again
5. WHEN search results are empty THEN I SHALL see an appropriate message

### Requirement 7: Navigation and User Experience

**User Story:** As a bus system administrator, I want intuitive navigation between different levels, so that I can efficiently manage bus operations.

#### Acceptance Criteria

1. WHEN I navigate between sections THEN the current location SHALL be clearly indicated
2. WHEN I go back to previous levels THEN my previous selections SHALL be remembered where appropriate
3. WHEN I refresh the page THEN I SHALL return to the appropriate level based on the URL
4. WHEN I use browser navigation THEN the back/forward buttons SHALL work correctly
5. WHEN I bookmark a page THEN the bookmark SHALL work correctly

### Requirement 8: Data Integration and API Usage

**User Story:** As a system, I want to integrate with the bus company API endpoints, so that data is properly synchronized.

#### Acceptance Criteria

1. WHEN loading companies THEN the system SHALL use GET /api/bus-companies
2. WHEN searching companies THEN the system SHALL use GET /api/bus-companies/search
3. WHEN getting company by registration THEN the system SHALL use GET /api/bus-companies/registration/{registrationNumber}
4. WHEN getting company by code THEN the system SHALL use GET /api/bus-companies/code/{companyCode}
5. WHEN getting companies by city THEN the system SHALL use GET /api/bus-companies/city/{city}
6. WHEN deleting a company THEN the system SHALL use DELETE /api/bus-companies/{id}
7. WHEN getting company details THEN the system SHALL use GET /api/bus-companies/{id}
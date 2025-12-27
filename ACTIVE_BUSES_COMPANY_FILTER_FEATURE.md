# Active Buses Company Filter Feature

## Overview
Enhanced the OneBus Admin application with a company selector dropdown on the Active Buses tracking page. This feature allows administrators to filter active buses by bus company, viewing real-time tracking information for buses from a specific company sending coordinate updates to the server.

---

## Changes Made

### 1. **Type Updates** (`src/types/index.ts`)
- ✅ Added `companyId?: string;` field to `ActiveBusFilters` interface
- This allows filtering active buses by selected company

### 2. **Service Layer Updates** (`src/services/activeBusService.ts`)

#### Company Filtering Logic
Added company-based filtering in two places:

**Primary filtering (API call path):**
```typescript
if (filters?.companyId) {
  // Filter by company - match against bus or route company field
  filteredBuses = filteredBuses.filter(bus => 
    bus.bus.busCompany === filters.companyId || 
    bus.route.company === filters.companyId
  );
}
```

**Fallback filtering (mock data path):**
Same logic applies when backend API is unavailable.

#### Mock Data Enhancement
Updated mock data to include company information:
- **Bus 1 (C5)**: `busCompany: 'rea-vaya-001'` → Route company: `'rea-vaya-001'`
- **Bus 2 (A1)**: `busCompany: 'uber-aeroport-001'` → Route company: `'uber-aeroport-001'`

This enables testing of company filtering with mock data.

### 3. **UI Updates** (`src/components/pages/ActiveBusesPage.tsx`)

#### New Imports
```typescript
import {
  TextField, MenuItem, FormControl, InputLabel, Select, Paper
} from '@mui/material';
import { busCompanyService } from '../../services/busCompanyService';
import { BusCompany } from '../../types';
```

#### New State Management
```typescript
const [companies, setCompanies] = useState<BusCompany[]>([]);
const [companiesLoading, setCompaniesLoading] = useState(true);
```

#### New Handlers

**1. fetchCompanies()**: Fetches all bus companies from backend
```typescript
const fetchCompanies = useCallback(async () => {
  try {
    setCompaniesLoading(true);
    const companiesData = await busCompanyService.getAllCompanies();
    setCompanies(companiesData);
  } catch (err) {
    console.error('Failed to fetch companies:', err);
    // Continue without companies data
  } finally {
    setCompaniesLoading(false);
  }
}, []);
```

**2. handleCompanyChange()**: Updates filters when company is selected
```typescript
const handleCompanyChange = useCallback((companyId: string) => {
  const newFilters: ActiveBusFilters = { ...filters };
  if (companyId) {
    newFilters.companyId = companyId;
  } else {
    delete newFilters.companyId;
  }
  handleFiltersChange(newFilters);
}, [filters, handleFiltersChange]);
```

#### URL Search Params Handling
- Parses `companyId` from URL search params (for shareable filtered views)
- Updates URL when company selection changes

#### Updated Initial Effect
```typescript
useEffect(() => {
  fetchCompanies();        // Fetch companies on mount
  fetchActiveBuses(true);
}, []);
```

#### Company Filter Component
Added before FilterPanel:
```tsx
<Paper sx={{ p: 2, mb: 3, backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
  <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
    Filter by Bus Company
  </Typography>
  <FormControl sx={{ minWidth: 300 }} disabled={companiesLoading}>
    <InputLabel id="company-select-label">Select Company</InputLabel>
    <Select
      labelId="company-select-label"
      id="company-select"
      value={filters.companyId || ''}
      label="Select Company"
      onChange={(e) => handleCompanyChange(e.target.value)}
    >
      <MenuItem value="">
        <em>All Companies</em>
      </MenuItem>
      {companies.map((company) => (
        <MenuItem key={company.id} value={company.id}>
          {company.name} ({company.status})
        </MenuItem>
      ))}
    </Select>
  </FormControl>
  {companiesLoading && (
    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
      Loading companies...
    </Typography>
  )}
  {companies.length === 0 && !companiesLoading && (
    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
      No companies available
    </Typography>
  )}
</Paper>
```

#### Enhanced Filter Dependency
Updated `fetchActiveBuses()` dependency array:
```typescript
// Before
}, [routes, refreshing, showNotification]);

// After
}, [routes, filters, refreshing, showNotification]);
```

---

## User Flow

### Step 1: Page Load
1. Component mounts
2. `fetchCompanies()` is called → fetches all bus companies
3. `fetchActiveBuses(true)` is called → fetches all active buses with initial filters (if any)
4. Company dropdown loads with available companies

### Step 2: Company Selection
1. User selects a company from dropdown (or "All Companies")
2. `handleCompanyChange()` is triggered
3. Filters are updated with new `companyId`
4. URL search params updated (e.g., `?companyId=rea-vaya-001`)
5. `fetchActiveBuses()` is called with new filters
6. Active buses list is filtered to show only buses from selected company

### Step 3: Real-time Updates
- Auto-refresh (every 30 seconds) respects company filter
- Manual refresh respects company filter
- Switching companies immediately updates the displayed bus list

---

## Data Flow

```
User Selects Company
        ↓
handleCompanyChange()
        ↓
handleFiltersChange() → Updates URL params
        ↓
fetchActiveBuses(filters)
        ↓
activeBusService.getActiveBuses(filters)
        ↓
Filter logic:
  - Try backend API with filters
  - Fallback to mock data with filters
  - Apply company filter: bus.bus.busCompany === companyId || bus.route.company === companyId
        ↓
Return filtered buses
        ↓
Update activeBuses state
        ↓
FilterPanel and ActiveBusList render with filtered data
```

---

## Technical Specifications

### Filtering Strategy
The filtering supports matching against two fields:
1. **Bus Company ID** (`bus.busCompany`)
2. **Route Company ID** (`route.company`)

This dual-field approach ensures compatibility with different backend data structures.

### Error Handling
- If company fetch fails, page continues with empty company list
- If bus fetch fails with company filter, user sees error with retry option
- Auto-refresh gracefully handles errors without interrupting the page

### Performance
- Companies are fetched once on page load (not on every refresh)
- Filtering happens on frontend (fast, no additional API calls)
- URL params enable bookmarkable filtered views

### Dark Mode Support
Company selector panel respects theme color mode (Material-UI `useTheme()`)

---

## Backend Integration

### Required API Endpoints
1. **`GET /api/bus-companies`** (already exists)
   - Returns list of all bus companies
   - Response: `BusCompany[]`

2. **`GET /api/buses/active`** (already exists)
   - Returns list of active buses
   - Should include `busCompany` field in bus object
   - Should include `company` field in route object

### Mock Data Fallback
If backend is unavailable:
- Uses `mockActiveBuses` with company fields populated
- Company filtering still works on frontend
- Enables development/testing without backend

---

## Testing Checklist

- [ ] Companies load on page mount
- [ ] Company dropdown displays all companies
- [ ] Selecting a company filters active buses
- [ ] "All Companies" option shows all buses
- [ ] URL updates when company is selected
- [ ] Company filter persists across page refresh
- [ ] Auto-refresh respects company filter
- [ ] Manual refresh respects company filter
- [ ] Switching companies updates bus list immediately
- [ ] Error states display properly
- [ ] Loading states display properly
- [ ] Dark mode styling works correctly
- [ ] Mobile responsive layout

---

## Future Enhancements

1. **Real-time Coordinate Tracking**
   - Add WebSocket listener for coordinate updates (like Flutter app)
   - Show only buses with recent coordinate updates (< 30 seconds)
   - Update bus location marker in real-time

2. **Multi-company Selection**
   - Allow selecting multiple companies at once
   - Show buses from multiple companies combined

3. **Company Statistics**
   - Display company-level stats (total buses, on-route, delayed)
   - Show company logo/branding on page

4. **Export/Report**
   - Export active buses for selected company to CSV
   - Generate daily/weekly company reports

5. **Integration with Bus Details**
   - Click bus to see detailed information
   - Edit bus information/status
   - View bus history

---

## File Summary

### Modified Files
1. **`src/types/index.ts`**
   - Added `companyId?: string;` to `ActiveBusFilters`

2. **`src/services/activeBusService.ts`**
   - Enhanced `getActiveBuses()` to support company filtering
   - Updated mock data with `busCompany` and `company` fields

3. **`src/components/pages/ActiveBusesPage.tsx`**
   - Added company state management
   - Added `fetchCompanies()` handler
   - Added `handleCompanyChange()` handler
   - Added company selector UI component
   - Updated filter handling to include company

### No Changes Required
- `busCompanyService.ts` - Already has `getAllCompanies()` method
- Other page components remain unchanged

---

## Dependencies

All dependencies are already present in the project:
- ✅ Material-UI components (FormControl, InputLabel, Select, MenuItem, Paper)
- ✅ React hooks (useState, useCallback, useMemo, useEffect)
- ✅ React Router (useSearchParams)
- ✅ Services (activeBusService, busCompanyService, routeService)
- ✅ Types (ActiveBusFilters, BusCompany, ActiveBus)

---

## Deployment Notes

1. **No environment variable changes needed**
   - Uses existing API endpoints
   - Uses existing company service

2. **Backward compatible**
   - URL without company filter still works
   - Existing filtered views (by route, status, search) unaffected

3. **No database migrations needed**
   - Uses existing bus company data
   - No new data structures required

---

## Next Steps

1. Test the feature with real backend data
2. Verify company filtering works with actual buses
3. Add WebSocket integration for real-time coordinate updates (future phase)
4. Monitor performance with large company lists (100+ companies)
5. Gather user feedback on UX

---

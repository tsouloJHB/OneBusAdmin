import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Collapse,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  SelectChangeEvent
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { ActiveBusFilters, Route, ActiveBus } from '../../types';

interface FilterPanelProps {
  filters: ActiveBusFilters;
  onFiltersChange: (filters: ActiveBusFilters) => void;
  routes: Route[];
  loading?: boolean;
  totalCount?: number;
  filteredCount?: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  routes,
  loading = false,
  totalCount = 0,
  filteredCount = 0
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expanded, setExpanded] = useState(!isMobile);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({
          ...filters,
          search: searchValue || undefined
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, filters, onFiltersChange]);

  // Update local search value when filters change externally
  useEffect(() => {
    setSearchValue(filters.search || '');
  }, [filters.search]);

  const handleRouteChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      routeId: value || undefined
    });
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as ActiveBus['status'] | '';
    onFiltersChange({
      ...filters,
      status: value || undefined
    });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.routeId) count++;
    if (filters.status) count++;
    return count;
  };

  const getSelectedRouteName = () => {
    if (!filters.routeId) return '';
    const route = routes.find(r => r.id.toString() === filters.routeId);
    return route?.name || '';
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mb: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      {/* Filter Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2}
        sx={{
          cursor: isMobile ? 'pointer' : 'default',
          '&:hover': isMobile ? { bgcolor: 'action.hover' } : {}
        }}
        onClick={isMobile ? () => setExpanded(!expanded) : undefined}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <FilterList color="action" />
          <Typography variant="h6" component="h3">
            Filters
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={activeFilterCount}
              size="small"
              color="primary"
              variant="filled"
            />
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {/* Results count */}
          {totalCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              {filteredCount} of {totalCount} buses
            </Typography>
          )}

          {/* Clear filters button */}
          {activeFilterCount > 0 && (
            <Button
              size="small"
              startIcon={<Clear />}
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              disabled={loading}
            >
              Clear
            </Button>
          )}

          {/* Expand/Collapse button for mobile */}
          {isMobile && (
            <IconButton size="small" aria-label="Toggle filters">
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Filter Controls */}
      <Collapse in={expanded}>
        <Box p={2} pt={0}>
          <Box
            display="flex"
            flexDirection={isMobile ? 'column' : 'row'}
            gap={2}
            alignItems={isMobile ? 'stretch' : 'flex-start'}
          >
            {/* Search Field */}
            <TextField
              label="Search buses or routes"
              placeholder="Enter bus number or route name..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={loading}
              size="small"
              sx={{ 
                minWidth: isMobile ? 'auto' : 300,
                flex: isMobile ? 'none' : 1
              }}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                endAdornment: searchValue && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchValue('')}
                    disabled={loading}
                    aria-label="Clear search"
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                )
              }}
            />

            {/* Route Filter */}
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: isMobile ? 'auto' : 200,
                flex: isMobile ? 'none' : 'none'
              }}
            >
              <InputLabel id="route-filter-label">Route</InputLabel>
              <Select
                labelId="route-filter-label"
                label="Route"
                value={filters.routeId || ''}
                onChange={handleRouteChange}
                disabled={loading || routes.length === 0}
              >
                <MenuItem value="">
                  <em>All Routes</em>
                </MenuItem>
                {routes.map((route) => (
                  <MenuItem key={route.id} value={route.id}>
                    {route.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: isMobile ? 'auto' : 150,
                flex: isMobile ? 'none' : 'none'
              }}
            >
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Status"
                value={filters.status || ''}
                onChange={handleStatusChange}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>All Status</em>
                </MenuItem>
                <MenuItem value="on_route">On Route</MenuItem>
                <MenuItem value="at_stop">At Stop</MenuItem>
                <MenuItem value="delayed">Delayed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active filters:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {filters.search && (
                  <Chip
                    label={`Search: "${filters.search}"`}
                    size="small"
                    onDelete={() => {
                      setSearchValue('');
                      onFiltersChange({
                        ...filters,
                        search: undefined
                      });
                    }}
                    disabled={loading}
                  />
                )}
                {filters.routeId && (
                  <Chip
                    label={`Route: ${getSelectedRouteName()}`}
                    size="small"
                    onDelete={() => onFiltersChange({
                      ...filters,
                      routeId: undefined
                    })}
                    disabled={loading}
                  />
                )}
                {filters.status && (
                  <Chip
                    label={`Status: ${filters.status.replace('_', ' ')}`}
                    size="small"
                    onDelete={() => onFiltersChange({
                      ...filters,
                      status: undefined
                    })}
                    disabled={loading}
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default FilterPanel;
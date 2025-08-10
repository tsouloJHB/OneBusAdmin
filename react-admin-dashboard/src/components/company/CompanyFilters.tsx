import React, { useState, useMemo } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Typography,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useCompanyManagement } from '../../contexts/CompanyManagementContext';
import { useUrlParams } from '../../hooks/useCompanyNavigation';

const CompanyFilters: React.FC = () => {
  const { state } = useCompanyManagement();
  const { searchParams, updateSearchParams, clearSearchParams } = useUrlParams();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const cities = Array.from(new Set(state.companies.map(c => c.city))).sort();
    const statuses = Array.from(new Set(state.companies.map(c => c.status))).sort();
    
    return {
      cities,
      statuses
    };
  }, [state.companies]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchParams.city) count++;
    if (searchParams.status) count++;
    return count;
  }, [searchParams]);

  // Handle filter changes
  const handleCityChange = (event: any) => {
    const city = event.target.value;
    updateSearchParams({ city });
  };

  const handleStatusChange = (event: any) => {
    const status = event.target.value;
    updateSearchParams({ status });
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    updateSearchParams({ city: '', status: '' });
  };

  // Toggle advanced filters
  const handleToggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Get status label and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: 'success' as const };
      case 'inactive':
        return { label: 'Inactive', color: 'warning' as const };
      case 'suspended':
        return { label: 'Suspended', color: 'error' as const };
      default:
        return { label: status, color: 'default' as const };
    }
  };

  return (
    <Box>
      {/* Filter Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="action" />
          <Typography variant="subtitle2" color="text.secondary">
            Filters
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={`${activeFilterCount} active`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {activeFilterCount > 0 && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearAllFilters}
              color="inherit"
            >
              Clear All
            </Button>
          )}
          
          <IconButton
            size="small"
            onClick={handleToggleAdvancedFilters}
            sx={{ ml: 1 }}
          >
            {showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Basic Filters */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>City</InputLabel>
            <Select
              value={searchParams.city || ''}
              onChange={handleCityChange}
              label="City"
            >
              <MenuItem value="">
                <em>All Cities</em>
              </MenuItem>
              {filterOptions.cities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 200, flex: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={searchParams.status || ''}
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="">
                <em>All Statuses</em>
              </MenuItem>
              {filterOptions.statuses.map((status) => {
                const display = getStatusDisplay(status);
                return (
                  <MenuItem key={status} value={status}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={display.label}
                        size="small"
                        color={display.color}
                        variant="outlined"
                      />
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Advanced Filters */}
      <Collapse in={showAdvancedFilters}>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Advanced Filters
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Company Statistics */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Company Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Companies: <strong>{state.companies.length}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active: <strong>{state.companies.filter(c => c.status === 'active').length}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cities: <strong>{filterOptions.cities.length}</strong>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Quick Filter Buttons */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Filters
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  size="small"
                  variant={searchParams.status === 'active' ? 'contained' : 'outlined'}
                  color="success"
                  onClick={() => updateSearchParams({ 
                    status: searchParams.status === 'active' ? '' : 'active' 
                  })}
                >
                  Active Only
                </Button>
                <Button
                  size="small"
                  variant={searchParams.status === 'inactive' ? 'contained' : 'outlined'}
                  color="warning"
                  onClick={() => updateSearchParams({ 
                    status: searchParams.status === 'inactive' ? '' : 'inactive' 
                  })}
                >
                  Inactive Only
                </Button>
                <Button
                  size="small"
                  variant={searchParams.status === 'suspended' ? 'contained' : 'outlined'}
                  color="error"
                  onClick={() => updateSearchParams({ 
                    status: searchParams.status === 'suspended' ? '' : 'suspended' 
                  })}
                >
                  Suspended Only
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* City Quick Filters */}
        {filterOptions.cities.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Filter by City
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {filterOptions.cities.slice(0, 8).map((city) => (
                <Chip
                  key={city}
                  label={city}
                  onClick={() => updateSearchParams({ 
                    city: searchParams.city === city ? '' : city 
                  })}
                  color={searchParams.city === city ? 'primary' : 'default'}
                  variant={searchParams.city === city ? 'filled' : 'outlined'}
                  size="small"
                  clickable
                />
              ))}
              {filterOptions.cities.length > 8 && (
                <Chip
                  label={`+${filterOptions.cities.length - 8} more`}
                  size="small"
                  variant="outlined"
                  color="default"
                />
              )}
            </Box>
          </Box>
        )}
      </Collapse>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'primary.50', borderRadius: 1 }}>
          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {searchParams.city && (
              <Chip
                label={`City: ${searchParams.city}`}
                onDelete={() => updateSearchParams({ city: '' })}
                size="small"
                color="primary"
              />
            )}
            {searchParams.status && (
              <Chip
                label={`Status: ${getStatusDisplay(searchParams.status).label}`}
                onDelete={() => updateSearchParams({ status: '' })}
                size="small"
                color="primary"
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CompanyFilters;
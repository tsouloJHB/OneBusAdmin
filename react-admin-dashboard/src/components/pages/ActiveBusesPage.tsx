import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Refresh as RefreshIcon, Pause, PlayArrow, Map as MapIcon, ViewList, DeleteSweep as ClearIcon } from '@mui/icons-material';
import { ActiveBusList, FilterPanel, BusTrackingMap } from '../features';
import activeBusService from '../../services/activeBusService';
import routeService from '../../services/routeService';
import { busCompanyService } from '../../services/busCompanyService';
import { ActiveBus, ActiveBusFilters, Route, ApiError } from '../../types';
import { BusCompany } from '../../types/busCompany';
import { useNotification } from '../../contexts';
import { invalidateActiveBusCache } from '../../services/httpClient';
import { config } from '../../config';

const REFRESH_INTERVAL = 30000; // 30 seconds

const ActiveBusesPage: React.FC = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showNotification } = useNotification();

  // State management
  const [activeBuses, setActiveBuses] = useState<ActiveBus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [companies, setCompanies] = useState<BusCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resettingRedis, setResettingRedis] = useState(false);

  // Parse filters from URL search params
  const filters: ActiveBusFilters = useMemo(() => {
    const params: ActiveBusFilters = {};

    const search = searchParams.get('search');
    if (search) params.search = search;

    const routeId = searchParams.get('routeId');
    if (routeId) params.routeId = routeId;

    const companyId = searchParams.get('companyId');
    if (companyId) params.companyId = companyId;

    const status = searchParams.get('status');
    if (status && ['on_route', 'at_stop', 'delayed'].includes(status)) {
      params.status = status as ActiveBus['status'];
    }

    return params;
  }, [searchParams]);

  // Update URL when filters change
  const handleFiltersChange = useCallback((newFilters: ActiveBusFilters) => {
    const params = new URLSearchParams();

    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.routeId) params.set('routeId', newFilters.routeId);
    if (newFilters.companyId) params.set('companyId', newFilters.companyId);
    if (newFilters.status) params.set('status', newFilters.status);

    setSearchParams(params);
  }, [setSearchParams]);

  // Handle company selection
  const handleCompanyChange = useCallback((companyId: string) => {
    const newFilters: ActiveBusFilters = { ...filters };
    if (companyId) {
      newFilters.companyId = companyId;
    } else {
      delete newFilters.companyId;
    }
    handleFiltersChange(newFilters);
  }, [filters, handleFiltersChange]);

  // Filter active buses based on current filters
  const filteredBuses = useMemo(() => {
    return activeBuses.filter(bus => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesBusNumber = bus.bus.busNumber.toLowerCase().includes(searchLower);
        const matchesRouteName = bus.route.name.toLowerCase().includes(searchLower);
        if (!matchesBusNumber && !matchesRouteName) {
          return false;
        }
      }

      // Route filter
      if (filters.routeId && bus.route.id.toString() !== filters.routeId) {
        return false;
      }

      // Status filter
      if (filters.status && bus.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [activeBuses, filters]);

  // Fetch companies data
  const fetchCompanies = useCallback(async () => {
    try {
      setCompaniesLoading(true);
      const companiesData = await busCompanyService.getAllCompanies();
      setCompanies(companiesData);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      // Continue without companies data, not a critical failure
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  // Fetch active buses data
  const fetchActiveBuses = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const [busesData, routesData] = await Promise.all([
        activeBusService.getActiveBuses(filters),
        routes.length === 0 ? routeService.getRoutes() : Promise.resolve({ data: routes })
      ]);

      setActiveBuses(busesData);
      if (routes.length === 0) {
        setRoutes(Array.isArray(routesData) ? routesData : routesData.data);
      }
      setLastUpdated(new Date());

      if (!showLoading && refreshing) {
        showNotification('Active buses updated', 'success');
      }
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to fetch active buses';
      setError(errorMessage);

      if (!showLoading) {
        showNotification(`Update failed: ${errorMessage}`, 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [routes, filters, refreshing, showNotification]);

  // Manual refresh handler
  const handleManualRefresh = useCallback(() => {
    fetchActiveBuses(false);
  }, [fetchActiveBuses]);

  // Reset Redis handler
  const handleResetRedis = useCallback(async () => {
    try {
      setResettingRedis(true);

      // Clear frontend cache for active buses
      invalidateActiveBusCache();

      const response = await fetch(`${config.apiBaseUrl}/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showNotification('Redis and database cache cleared successfully', 'success');
        setShowResetDialog(false);
        // Refresh buses to reload clean data
        fetchActiveBuses(true);
      } else {
        showNotification('Failed to clear cache', 'error');
      }
    } catch (err) {
      console.error('Error clearing cache:', err);
      showNotification('Error clearing cache', 'error');
    } finally {
      setResettingRedis(false);
    }
  }, [showNotification, fetchActiveBuses]);

  // Toggle auto-refresh
  const handleToggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(prev => !prev);
    showNotification(autoRefreshEnabled ? 'Auto-refresh disabled' : 'Auto-refresh enabled', 'info');
  }, [autoRefreshEnabled, showNotification]);

  // Initial data fetch
  useEffect(() => {
    fetchCompanies();
    fetchActiveBuses(true);
  }, [fetchCompanies, fetchActiveBuses]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      fetchActiveBuses(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [autoRefreshEnabled, fetchActiveBuses]);



  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading active buses...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error && activeBuses.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Active Buses
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Retry'}
          </Button>
        </Box>

        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Active Buses
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label="Real-time Monitoring"
              color="success"
              size="small"
              variant="outlined"
            />
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="list" aria-label="list view">
              <ViewList sx={{ mr: 0.5 }} fontSize="small" />
              List
            </ToggleButton>
            <ToggleButton value="map" aria-label="map view">
              <MapIcon sx={{ mr: 0.5 }} fontSize="small" />
              Map
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            startIcon={autoRefreshEnabled ? <Pause /> : <PlayArrow />}
            onClick={handleToggleAutoRefresh}
            size="small"
          >
            {autoRefreshEnabled ? 'Pause' : 'Resume'}
          </Button>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={() => setShowResetDialog(true)}
            disabled={resettingRedis}
            size="small"
          >
            Reset Redis
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && activeBuses.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Company Selector */}
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

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        routes={routes}
        loading={refreshing}
        totalCount={activeBuses.length}
        filteredCount={filteredBuses.length}
      />

      {/* Active Buses List or Map */}
      {viewMode === 'list' ? (
        <ActiveBusList
          buses={filteredBuses}
          loading={refreshing}
          onRefresh={handleManualRefresh}
          lastUpdated={lastUpdated || undefined}
        />
      ) : (
        <BusTrackingMap
          buses={filteredBuses}
          companyId={filters.companyId}
          autoCenter={true}
        />
      )}

      {/* Reset Redis Confirmation Dialog */}
      <Dialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reset Redis Cache</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will clear all cached bus tracking data from Redis. This may help resolve duplicate bus display issues on the map.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
            ⚠️ Warning: This will temporarily disable real-time bus tracking until new data is received from the trackers.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button
            onClick={handleResetRedis}
            variant="contained"
            color="error"
            disabled={resettingRedis}
          >
            {resettingRedis ? 'Resetting...' : 'Reset Redis'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ActiveBusesPage;
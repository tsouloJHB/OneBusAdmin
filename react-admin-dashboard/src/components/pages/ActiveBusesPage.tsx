import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import { Refresh as RefreshIcon, Pause, PlayArrow } from '@mui/icons-material';
import { ActiveBusList, FilterPanel } from '../features';
import { activeBusService } from '../../services/activeBusService';
import { routeService } from '../../services/routeService';
import { ActiveBus, ActiveBusFilters, Route, ApiError } from '../../types';
import { useNotification } from '../../contexts';

const REFRESH_INTERVAL = 30000; // 30 seconds

const ActiveBusesPage: React.FC = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showNotification } = useNotification();
  
  // State management
  const [activeBuses, setActiveBuses] = useState<ActiveBus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Parse filters from URL search params
  const filters: ActiveBusFilters = useMemo(() => {
    const params: ActiveBusFilters = {};
    
    const search = searchParams.get('search');
    if (search) params.search = search;
    
    const routeId = searchParams.get('routeId');
    if (routeId) params.routeId = routeId;
    
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
    if (newFilters.status) params.set('status', newFilters.status);
    
    setSearchParams(params);
  }, [setSearchParams]);

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
      if (filters.routeId && bus.route.id !== filters.routeId) {
        return false;
      }
      
      // Status filter
      if (filters.status && bus.status !== filters.status) {
        return false;
      }
      
      return true;
    });
  }, [activeBuses, filters]);

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
        activeBusService.getActiveBuses(),
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
  }, [routes, refreshing, showNotification]);

  // Manual refresh handler
  const handleManualRefresh = useCallback(() => {
    fetchActiveBuses(false);
  }, [fetchActiveBuses]);

  // Toggle auto-refresh
  const handleToggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(prev => !prev);
    showNotification(autoRefreshEnabled ? 'Auto-refresh disabled' : 'Auto-refresh enabled', 'info');
  }, [autoRefreshEnabled, showNotification]);

  // Initial data fetch
  useEffect(() => {
    fetchActiveBuses(true);
  }, []);

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
        </Box>
      </Box>

      {/* Error Alert */}
      {error && activeBuses.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        routes={routes}
        loading={refreshing}
        totalCount={activeBuses.length}
        filteredCount={filteredBuses.length}
      />

      {/* Active Buses List */}
      <ActiveBusList
        buses={filteredBuses}
        loading={refreshing}
        onRefresh={handleManualRefresh}
        lastUpdated={lastUpdated || undefined}
      />

    </Box>
  );
};

export default ActiveBusesPage;
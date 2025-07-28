import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Breadcrumbs,
  Link,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Route as RouteIcon,
  Map as MapIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { RouteMap } from '../features';
import RouteMapErrorBoundary from '../features/RouteMapErrorBoundary';
import { routeService } from '../../services/routeService';
import { Route, ApiError } from '../../types';
import { useNotification } from '../../contexts';

const RouteMapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // State management
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [selectedStop, setSelectedStop] = useState<any | null>(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempMarker, setTempMarker] = useState<any | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load route data
  const loadRoute = useCallback(async () => {
    if (!id) {
      setError({ message: 'Route ID is required' } as ApiError);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const routeData = await routeService.getRouteById(id);
      setRoute(routeData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      const errorMessage = apiError?.message || 'Failed to load route';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showNotification]);

  // Load route on component mount
  useEffect(() => {
    loadRoute();
  }, [loadRoute]);

  // Handle navigation
  const handleBackToRoutes = () => {
    navigate('/routes');
  };

  const handleBreadcrumbClick = (path: string) => {
    navigate(path);
  };

  // Handle bus stop selection
  const handleStopSelect = useCallback((stop: any) => {
    console.log('RouteMapPage: handleStopSelect called with stop:', stop);
    setSelectedStop(stop);
    setInfoPanelOpen(true);
  }, []);

  const handleCloseInfoPanel = useCallback(() => {
    setInfoPanelOpen(false);
    setSelectedStop(null);
  }, []);

  // Handle map click for adding new stops
  const handleMapClick = useCallback((e: any) => {
    if (isAddMode && e?.latLng) {
      const newStop = {
        id: `temp-${Date.now()}`,
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng(),
        coordinates: {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        },
        address: `New Stop at ${e.latLng.lat().toFixed(4)}, ${e.latLng.lng().toFixed(4)}`,
        name: '',
      };
      setTempMarker(newStop);
      setSelectedStop(newStop);
      setInfoPanelOpen(true);
    }
  }, [isAddMode]);

  // Handle mode changes
  const handleModeChange = useCallback((event: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (newMode === 'add') {
      setIsAddMode(true);
      setIsEditMode(false);
    } else if (newMode === 'edit') {
      setIsAddMode(false);
      setIsEditMode(true);
    } else {
      setIsAddMode(false);
      setIsEditMode(false);
    }
    setSelectedStop(null);
    setInfoPanelOpen(false);
    setTempMarker(null);
  }, []);

  // Handle saving new stop
  const handleSaveNewStop = useCallback(async (stopData: any) => {
    try {
      if (!route) return;
      
      console.log('Saving new stop:', stopData);
      
      const newStop = {
        coordinates: {
          latitude: stopData.coordinates.lat,
          longitude: stopData.coordinates.lng
        },
        address: stopData.address || `Stop at ${stopData.coordinates.lat.toFixed(4)}, ${stopData.coordinates.lng.toFixed(4)}`,
        bus_stop_index: (route.stops?.length || 0),
        direction: stopData.direction || "bidirectional",
        type: stopData.type || "Bus station"
      };
      
      console.log('New stop to add:', newStop);
      
      // Use the PUT endpoint for adding route stops
      await routeService.addRouteStop(route.id, newStop);
      
      // Reload route data
      await loadRoute();
      setTempMarker(null);
      setIsAddMode(false);
      setHasUnsavedChanges(false);
      showNotification('Bus stop added successfully', 'success');
    } catch (error) {
      console.error('Error saving new stop:', error);
      showNotification(`Failed to add bus stop: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }, [route, loadRoute, showNotification]);

  // Handle deleting stop
  const handleDeleteStop = useCallback(async (stopId: string) => {
    try {
      if (!route) return;
      
      console.log('Deleting stop with ID:', stopId, 'from route:', route.id);
      
      // Use the dedicated delete endpoint
      await routeService.deleteRouteStop(route.id, stopId);
      
      // Reload route data
      await loadRoute();
      setSelectedStop(null);
      setInfoPanelOpen(false);
      setHasUnsavedChanges(false);
      showNotification('Bus stop deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting stop:', error);
      showNotification(`Failed to delete bus stop: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }, [route, loadRoute, showNotification]);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" color="text.secondary">
          Loading route map...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error || !route) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={handleBackToRoutes}
            >
              <ArrowBackIcon />
            </IconButton>
          }
        >
          <Typography variant="h6" gutterBottom>
            Route Not Found
          </Typography>
          <Typography variant="body2">
            {error?.message || 'The requested route could not be found.'}
          </Typography>
        </Alert>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton
            onClick={handleBackToRoutes}
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body1" sx={{ alignSelf: 'center' }}>
            Back to Routes
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header with Breadcrumbs */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={handleBackToRoutes}
              size="small"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              {route.name} - Route Map
            </Typography>
          </Box>
          
          {/* Edit Mode Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToggleButtonGroup
              value={isAddMode ? 'add' : isEditMode ? 'edit' : null}
              exclusive
              onChange={handleModeChange}
              size="small"
            >
              <ToggleButton value="add" aria-label="add stop">
                <AddIcon fontSize="small" />
                Add Stop
              </ToggleButton>
              <ToggleButton value="edit" aria-label="edit stops">
                <EditIcon fontSize="small" />
                Edit Mode
              </ToggleButton>
            </ToggleButtonGroup>
            
            {hasUnsavedChanges && (
              <Button
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={() => {/* Handle save all changes */}}
              >
                Save Changes
              </Button>
            )}
          </Box>
        </Box>
        
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 1 }}>
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleBreadcrumbClick('/dashboard');
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <HomeIcon fontSize="small" />
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleBreadcrumbClick('/routes');
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <RouteIcon fontSize="small" />
            Routes
          </Link>
          <Typography 
            color="text.primary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <MapIcon fontSize="small" />
            {route.name}
          </Typography>
        </Breadcrumbs>
        
        {/* Route Info */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {route.startPoint} → {route.endPoint} • {route.stops?.length || 0} stops
        </Typography>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
        {/* Map Container */}
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <RouteMapErrorBoundary>
            <RouteMap
              route={route}
              height="100%"
              showFullscreenButton={true}
              showLocationButton={true}
              onStopSelect={handleStopSelect}
              selectedStop={selectedStop}
              layout="page"
              isAddMode={isAddMode}
              isEditMode={isEditMode}
              onMapClick={handleMapClick}
              tempMarker={tempMarker}
            />
          </RouteMapErrorBoundary>
        </Box>

        {/* Side Panel for Bus Stop Info */}
        {infoPanelOpen && selectedStop && (
          <Paper 
            sx={{ 
              width: 350, 
              p: 2, 
              maxHeight: '100%', 
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">
                {tempMarker ? 'New Bus Stop' : 'Bus Stop Details'}
              </Typography>
              <IconButton size="small" onClick={handleCloseInfoPanel}>
                <ArrowBackIcon />
              </IconButton>
            </Box>
            
            {tempMarker ? (
              // New stop form
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  label="Address"
                  value={selectedStop.address || ''}
                  onChange={(e) => setSelectedStop({...selectedStop, address: e.target.value})}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  required
                />
                
                <FormControl fullWidth size="small">
                  <InputLabel>Stop Type</InputLabel>
                  <Select
                    value={selectedStop.type || 'Bus station'}
                    label="Stop Type"
                    onChange={(e) => setSelectedStop({...selectedStop, type: e.target.value})}
                  >
                    <MenuItem value="Bus station">Bus Station</MenuItem>
                    <MenuItem value="Bus stop">Bus Stop</MenuItem>
                    <MenuItem value="Terminal">Terminal</MenuItem>
                    <MenuItem value="Transfer point">Transfer Point</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small">
                  <InputLabel>Direction</InputLabel>
                  <Select
                    value={selectedStop.direction || 'bidirectional'}
                    label="Direction"
                    onChange={(e) => setSelectedStop({...selectedStop, direction: e.target.value})}
                  >
                    <MenuItem value="bidirectional">Bidirectional</MenuItem>
                    <MenuItem value="Northbound">Northbound</MenuItem>
                    <MenuItem value="Southbound">Southbound</MenuItem>
                    <MenuItem value="Eastbound">Eastbound</MenuItem>
                    <MenuItem value="Westbound">Westbound</MenuItem>
                  </Select>
                </FormControl>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Coordinates:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {selectedStop.coordinates?.lat?.toFixed(6)}, {selectedStop.coordinates?.lng?.toFixed(6)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveNewStop(selectedStop)}
                    fullWidth
                    disabled={!selectedStop.address?.trim()}
                  >
                    Save Stop
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setTempMarker(null);
                      setSelectedStop(null);
                      setInfoPanelOpen(false);
                    }}
                    fullWidth
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              // Existing stop details
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Stop Number:
                  </Typography>
                  <Typography variant="h6">
                    #{route.stops?.findIndex(s => s.id === selectedStop.id) + 1 || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Address:
                  </Typography>
                  <Typography variant="body1">
                    {selectedStop.address || 'Address not available'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Coordinates:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {selectedStop.coordinates?.lat?.toFixed(6) || selectedStop.latitude?.toFixed(6)}, {selectedStop.coordinates?.lng?.toFixed(6) || selectedStop.longitude?.toFixed(6)}
                  </Typography>
                </Box>
                
                {selectedStop.name && selectedStop.name !== selectedStop.address && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Stop Name:
                    </Typography>
                    <Typography variant="body1">
                      {selectedStop.name}
                    </Typography>
                  </Box>
                )}
                
                {/* Delete button for existing stops */}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this bus stop?')) {
                        handleDeleteStop(selectedStop.id);
                      }
                    }}
                    fullWidth
                  >
                    Delete Stop
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default RouteMapPage;
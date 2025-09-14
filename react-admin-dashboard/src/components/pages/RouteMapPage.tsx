import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';

import RouteMap from '../features/RouteMap';
import BatchModeHeader from '../features/BatchModeHeader';
import { Route, BusStop, TemporaryStop } from '../../types';
import { routeService } from '../../services/routeService';

interface BatchSession {
  isActive: boolean;
  temporaryStops: TemporaryStop[];
}

const RouteMapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const isAddModeRef = useRef(false);
  
  // Keep ref in sync with state
  useEffect(() => {
    isAddModeRef.current = isAddMode;
  }, [isAddMode]);
  const [tempMarker, setTempMarker] = useState<{ position: { lat: number; lng: number }; title?: string } | null>(null);
  const [selectedStop, setSelectedStop] = useState<BusStop | TemporaryStop | null>(null);
  
  // Batch session state
  const [batchSession, setBatchSession] = useState<BatchSession>({
    isActive: false,
    temporaryStops: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load route data
  useEffect(() => {
    const loadRoute = async () => {
      if (!id) {
        setError('Route ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const routeData = await routeService.getRoute(parseInt(id));
        setRoute(routeData);
        setError(null);
      } catch (err) {
        console.error('Error loading route:', err);
        setError('Failed to load route data');
      } finally {
        setLoading(false);
      }
    };

    loadRoute();
  }, [id]);

  // Google Maps loading is handled by the GoogleMap component itself
  // We'll show the GoogleMap component and let it handle loading/fallback

  // Handle map click for adding stops
  const handleMapClick = useCallback((event: any) => {
    const currentIsAddMode = isAddModeRef.current;
    
    if (!currentIsAddMode || !event.latLng) {
      return;
    }

    const position = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };

    setTempMarker({ position, title: 'New Stop Location' });
  }, []); // Remove isAddMode dependency since we use ref

  // Handle stop selection
  const handleStopClick = useCallback((stop: BusStop | TemporaryStop) => {
    setSelectedStop(stop);
  }, []);

  // Add stop to batch
  const addTemporaryStop = useCallback((stopData: Omit<TemporaryStop, 'id'>) => {
    const newStop: TemporaryStop = {
      ...stopData,
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setBatchSession(prev => ({
      ...prev,
      isActive: true,
      temporaryStops: [...prev.temporaryStops, newStop]
    }));

    setTempMarker(null);
    // Keep isAddMode true so user can continue adding stops
  }, []);

  // Remove temporary stop
  const removeTemporaryStop = useCallback((stopId: string) => {
    setBatchSession(prev => ({
      ...prev,
      temporaryStops: prev.temporaryStops.filter(stop => stop.id !== stopId)
    }));
    setSelectedStop(null);
  }, []);

  // Save all temporary stops
  const saveAllTemporaryStops = useCallback(async () => {
    if (!route || batchSession.temporaryStops.length === 0) return;

    setSaveMessage(null);
    try {
      setIsSaving(true);
      // Convert temporary stops to regular stops
      const stopsToSave = batchSession.temporaryStops.map((tempStop, index) => ({
        address: tempStop.name, // Map name to address
        latitude: tempStop.latitude,
        longitude: tempStop.longitude,
        busStopIndex: (route.stops?.length || 0) + index + 1, // Map order to busStopIndex
        direction: 'Bidirectional', // Default direction
        type: 'Bus Stop' // Default type
      }));

      for (const stopData of stopsToSave) {
        await routeService.createBusStop({
          ...stopData,
          routeId: route.id
        });
      }
      // Reload route data to get updated stops
      const updatedRoute = await routeService.getRoute(route.id);
      setRoute(updatedRoute);
      setSaveMessage('All stops saved successfully!');
      // Clear batch session
      setBatchSession({
        isActive: false,
        temporaryStops: []
      });
      setSelectedStop(null);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error saving stops:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setSaveMessage('Failed to save stops: ' + errorMessage);
      setError('Failed to save stops');
    } finally {
      setIsSaving(false);
    }
  }, [route, batchSession.temporaryStops, routeService]);

  // Clear all temporary stops
  const clearAllTemporaryStops = useCallback(() => {
    setBatchSession({
      isActive: false,
      temporaryStops: []
    });
    setSelectedStop(null);
    setTempMarker(null);
    setIsAddMode(false);
  }, []);

  // Exit batch mode
  const exitBatchMode = useCallback(() => {
    setBatchSession({
      isActive: false,
      temporaryStops: []
    });
    setSelectedStop(null);
    setTempMarker(null);
    setIsAddMode(false);
  }, []);

  // Handle save new stop from temp marker
  const handleSaveNewStop = useCallback(() => {
    if (!tempMarker) return;

    const stopName = prompt('Enter stop name:');
    if (!stopName) return;

    addTemporaryStop({
      name: stopName,
      description: '',
      latitude: tempMarker.position.lat,
      longitude: tempMarker.position.lng
    });
  }, [tempMarker, addTemporaryStop]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/routes')}
          sx={{ mt: 2 }}
        >
          Back to Routes
        </Button>
      </Box>
    );
  }

  if (!route) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Route not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/routes')}
          sx={{ mt: 2 }}
        >
          Back to Routes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {saveMessage && (
        <Alert severity={saveMessage.startsWith('Failed') ? 'error' : 'success'} sx={{ mb: 2 }}>
          {saveMessage}
        </Alert>
      )}
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link
          color="inherit"
          href="/routes"
          onClick={(e) => {
            e.preventDefault();
            navigate('/routes');
          }}
        >
          Routes
        </Link>
        <Typography color="text.primary">{route.name}</Typography>
        <Typography color="text.primary">Map</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {route.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {route.description}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/routes')}
          >
            Back to Routes
          </Button>
          
          {!batchSession.isActive && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setIsAddMode(!isAddMode);
              }}
              color={isAddMode ? 'secondary' : 'primary'}
            >
              {isAddMode ? 'Cancel Adding' : 'Add Stops'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Batch Mode Header */}
      <BatchModeHeader
        isActive={batchSession.isActive}
        stopCount={batchSession.temporaryStops.length}
        isSaving={isSaving}
        onSaveAll={saveAllTemporaryStops}
        onDone={exitBatchMode}
        onClearAll={clearAllTemporaryStops}
      />

      {/* Add Mode Instructions */}
      {isAddMode && !batchSession.isActive && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Click on the map to add a new bus stop location.
        </Alert>
      )}

      {/* Temp Marker Actions */}
      {tempMarker && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#e8f5e8' }}>
          <Typography variant="h6" gutterBottom>
            New Stop Location Selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveNewStop}
            >
              Add to Batch
            </Button>
            <Button
              variant="outlined"
              onClick={() => setTempMarker(null)}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      )}

      {/* Selected Stop Info */}
      {selectedStop && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {'id' in selectedStop && selectedStop.id.toString().startsWith('temp_') 
              ? 'Temporary Stop' 
              : 'Bus Stop'
            }
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Name:</strong> {selectedStop.name}
          </Typography>
          {selectedStop.description && (
            <Typography variant="body2" gutterBottom>
              <strong>Description:</strong> {selectedStop.description}
            </Typography>
          )}
          <Typography variant="body2" gutterBottom>
            <strong>Location:</strong> {selectedStop.latitude.toFixed(6)}, {selectedStop.longitude.toFixed(6)}
          </Typography>
          
          {/* Actions for temporary stops */}
          {'id' in selectedStop && selectedStop.id.toString().startsWith('temp_') && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => removeTemporaryStop(selectedStop.id.toString())}
              >
                Remove from Batch
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Map */}
      <Paper sx={{ height: 600, overflow: 'hidden' }}>
        <RouteMap
          route={route}
          height={600}
          temporaryStops={batchSession.temporaryStops}
          tempMarker={tempMarker}
          onStopClick={handleStopClick}
          onMapClick={handleMapClick}
        />
      </Paper>
    </Box>
  );
};

export default RouteMapPage;
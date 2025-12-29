import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

import RouteMap from '../features/RouteMap';
import { FullRoute, Coordinate } from '../../types';
import fullRouteService from '../../services/fullRouteService';

interface TempCoordinate {
  id: string;
  lat: number;
  lng: number;
}

const FullRouteMapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [fullRoute, setFullRoute] = useState<FullRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isAddMode, setIsAddMode] = useState(false);
  const isAddModeRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isAddModeRef.current = isAddMode;
  }, [isAddMode]);

  const [tempMarker, setTempMarker] = useState<TempCoordinate | null>(null);

  // Load full route data
  useEffect(() => {
    const loadFullRoute = async () => {
      if (!id) {
        setError('Full Route ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const routeData = await fullRouteService.getFullRouteById(parseInt(id));
        setFullRoute(routeData);
        // Initialize coordinates from the route
        if (routeData.coordinates && Array.isArray(routeData.coordinates)) {
          setCoordinates(routeData.coordinates);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading full route:', err);
        setError('Failed to load full route data');
      } finally {
        setLoading(false);
      }
    };

    loadFullRoute();
  }, [id]);

  // Handle map click for adding coordinates
  const handleMapClick = useCallback((event: any) => {
    const currentIsAddMode = isAddModeRef.current;

    if (!currentIsAddMode || !event.latLng) {
      return;
    }

    const position = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
      id: `temp_${Date.now()}`,
    };

    setTempMarker(position);
  }, []);

  // Add coordinate to list
  const addCoordinate = useCallback(() => {
    if (!tempMarker) return;

    const newCoordinate: Coordinate = {
      lat: tempMarker.lat,
      lon: tempMarker.lng,
    };

    setCoordinates((prev) => [...prev, newCoordinate]);
    setTempMarker(null);
  }, [tempMarker]);

  // Remove coordinate by index
  const removeCoordinate = useCallback((index: number) => {
    setCoordinates((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Save coordinates to backend
  const saveCoordinates = useCallback(async () => {
    if (!fullRoute) return;

    try {
      setIsSaving(true);
      setSaveMessage(null);

      // Update the full route with new coordinates
      await fullRouteService.updateFullRoute(fullRoute.id, {
        companyId: fullRoute.companyId,
        routeId: fullRoute.routeId,
        name: fullRoute.name,
        direction: fullRoute.direction,
        description: fullRoute.description,
        coordinates: coordinates,
      });

      setSaveMessage('Coordinates saved successfully!');
      // Reload the route to confirm
      const updatedRoute = await fullRouteService.getFullRouteById(fullRoute.id);
      setFullRoute(updatedRoute);
      setIsAddMode(false);
    } catch (err) {
      console.error('Error saving coordinates:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setSaveMessage('Failed to save coordinates: ' + errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [fullRoute, coordinates]);

  // Convert to RouteMapPage-compatible format for display
  const routeForMap = fullRoute
    ? {
        ...fullRoute,
        id: fullRoute.id,
        name: fullRoute.name,
        startPoint: coordinates[0]
          ? `${coordinates[0].lat.toFixed(4)}, ${coordinates[0].lon.toFixed(4)}`
          : 'No start point',
        endPoint:
          coordinates.length > 0
            ? `${coordinates[coordinates.length - 1].lat.toFixed(4)}, ${coordinates[coordinates.length - 1].lon.toFixed(4)}`
            : 'No end point',
        stops: coordinates.map((coord, index) => ({
          id: index,
          name: `Point ${index + 1}`,
          address: `${coord.lat.toFixed(6)}, ${coord.lon.toFixed(6)}`,
          latitude: coord.lat,
          longitude: coord.lon,
          busStopIndex: index + 1,
          direction: 'Bidirectional',
          type: 'Coordinate',
          description: '',
          routeId: fullRoute.routeId,
          order: index + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        description: fullRoute.description || '',
        schedule: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    : null;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 600 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
        <Box sx={{ mt: 2 }}>
          <Button onClick={() => navigate('/routes')} startIcon={<ArrowBackIcon />}>
            Back to Routes
          </Button>
        </Box>
      </Alert>
    );
  }

  if (!fullRoute || !routeForMap) {
    return (
      <Alert severity="warning">
        Full Route not found
        <Box sx={{ mt: 2 }}>
          <Button onClick={() => navigate('/routes')} startIcon={<ArrowBackIcon />}>
            Back to Routes
          </Button>
        </Box>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {fullRoute.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Editing route coordinates on map
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/routes')}>
            Back to Routes
          </Button>
        </Box>
      </Box>

      {/* Messages */}
      {saveMessage && (
        <Alert
          severity={saveMessage.includes('Failed') ? 'error' : 'success'}
          onClose={() => setSaveMessage(null)}
          sx={{ mb: 2 }}
        >
          {saveMessage}
        </Alert>
      )}

      {/* Add Mode Instructions */}
      {isAddMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Click on the map to add coordinate points. When done, click "Add to Route" to add the selected point.
        </Alert>
      )}

      {/* Temp Marker Actions */}
      {tempMarker && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#e8f5e8' }}>
          <Typography variant="h6" gutterBottom>
            New Coordinate Selected
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Lat: {tempMarker.lat.toFixed(6)}, Lon: {tempMarker.lng.toFixed(6)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="primary" onClick={addCoordinate}>
              Add to Route
            </Button>
            <Button variant="outlined" onClick={() => setTempMarker(null)}>
              Cancel
            </Button>
          </Box>
        </Paper>
      )}

      {/* Map and Coordinates Panel */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Map */}
        <Paper sx={{ flex: 1, minWidth: 0, height: 600, overflow: 'hidden' }}>
          {routeForMap && (
            <RouteMap
              route={routeForMap}
              height={600}
              temporaryStops={[]}
              tempMarker={tempMarker as any}
              onStopClick={() => {}}
              onMapClick={handleMapClick}
            />
          )}
        </Paper>

        {/* Right Panel: Coordinates List and Actions */}
        <Box sx={{ width: { xs: '100%', md: 360 } }}>
          <Paper sx={{ p: 2, mb: 2, position: { md: 'sticky' }, top: { md: 80 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Route Coordinates ({coordinates.length})</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!isAddMode ? (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddMode(true)}
                  >
                    Add Points
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setIsAddMode(false);
                      setTempMarker(null);
                    }}
                  >
                    Done Adding
                  </Button>
                )}
              </Box>
            </Box>

            {/* Coordinates List */}
            {coordinates.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No coordinates added yet. Click "Add Points" to start.
              </Typography>
            ) : (
              <List
                sx={{
                  maxHeight: 300,
                  overflow: 'auto',
                  border: 1,
                  borderColor: 'grey.300',
                  borderRadius: 1,
                }}
              >
                {coordinates.map((coord: Coordinate, index: number) => (
                  <ListItem
                    key={index}
                    sx={{
                      borderBottom: index < coordinates.length - 1 ? 1 : 0,
                      borderColor: 'grey.200',
                    }}
                  >
                    <ListItemText
                      primary={`Point ${index + 1}`}
                      secondary={`Lat: ${coord.lat.toFixed(6)}, Lon: ${coord.lon.toFixed(6)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeCoordinate(index)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            {/* Save Button */}
            {coordinates.length > 0 && (
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={saveCoordinates}
                disabled={isSaving}
                fullWidth
                sx={{ mt: 2 }}
              >
                {isSaving ? 'Saving...' : 'Save Coordinates'}
              </Button>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default FullRouteMapPage;

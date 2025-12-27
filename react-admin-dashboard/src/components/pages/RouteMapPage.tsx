import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  NavigateNext as NavigateNextIcon
  ,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import RouteMap from '../features/RouteMap';
import BatchModeHeader from '../features/BatchModeHeader';
import { Route, BusStop, TemporaryStop } from '../../types';
import routeService from '../../services/routeService';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingIndex, setIsUpdatingIndex] = useState(false);
  const [editedIndex, setEditedIndex] = useState<number | ''>('');
  const [editedName, setEditedName] = useState<string>('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

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
    // Pre-fill edited index and name
    if (!('id' in stop) || !stop.id.toString().startsWith('temp_')) {
      setEditedIndex((stop as BusStop).busStopIndex ?? '');
      setEditedName(((stop as any).address as string) ?? (stop as BusStop).name ?? '');
    } else {
      setEditedIndex('');
      setEditedName((stop as TemporaryStop).name ?? '');
    }
  }, []);

  // Keep editedIndex in sync when selectedStop changes (but not during user input)
  useEffect(() => {
    try {
      if (!selectedStop || !route) return;
      // Only care about persisted stops
      if ('id' in selectedStop && !selectedStop.id.toString().startsWith('temp_')) {
        const matching = route.stops?.find(s => s.id === selectedStop.id);
        if (matching) {
          const newIndex = matching.busStopIndex ?? '';
          // Only update editedIndex when selectedStop changes (not when route changes during user input)
          setEditedIndex(newIndex);
          // Keep editedName in sync when selectedStop changes
          setEditedName((matching as any).address ?? matching.name ?? '');
        }
      }
    } catch (err) {
      // Defensive: don't crash UI if something unexpected happens
      console.warn('Failed to sync editedIndex with selectedStop', err);
    }
  }, [selectedStop]); // Only depend on selectedStop, not route or editedIndex

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
    setEditedName('');
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
  // Reload route data to get updated stops (force reload to bypass cache)
  const updatedRoute = await routeService.getRoute(route.id, true);
    console.info('Refreshed route after saveAllTemporaryStops:', updatedRoute?.stops?.map((s:any)=>({id:s.id,busStopIndex:s.busStopIndex})));
    setRoute(updatedRoute);
      setSaveMessage('All stops saved successfully!');
      // Clear batch session
      setBatchSession({
        isActive: false,
        temporaryStops: []
      });
      setSelectedStop(null);
      setEditedName('');
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
    setEditedName('');
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
    setEditedName('');
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

  // Delete selected (existing) stop
  const deleteSelectedStop = useCallback(async () => {
    if (!route || !selectedStop) return;

    // Only allow deleting persisted stops (non-temporary)
    if ('id' in selectedStop && selectedStop.id.toString().startsWith('temp_')) {
      // It's a temporary stop, nothing to delete on server
      removeTemporaryStop(selectedStop.id.toString());
      return;
    }

    const should = window.confirm('Are you sure you want to delete this stop?');
    if (!should) return;

    try {
      setIsDeleting(true);
      setSaveMessage(null);

      await routeService.deleteRouteStop(route.id.toString(), selectedStop.id.toString());

      // Client-side normalization: remove deleted stop and normalize remaining indices
      try {
        const currentStops = route.stops ? route.stops.map((s:any) => ({ ...s })) : [];
        const deletedStopId = selectedStop.id;
        const deletedStop = currentStops.find((s:any) => s.id === deletedStopId);
        const deletedIndex = deletedStop?.busStopIndex;
        
        if (deletedIndex !== undefined) {
          // Remove the deleted stop
          const remainingStops = currentStops.filter((s:any) => s.id !== deletedStopId);
          
          // Decrement indices of stops that had higher indices than the deleted stop
          remainingStops.forEach((s:any) => {
            if ((s.busStopIndex ?? 0) > deletedIndex) {
              s.busStopIndex = (s.busStopIndex ?? 0) - 1;
            }
          });
          
          // Normalize to ensure sequential indices starting from 1
          const normalized = remainingStops.slice()
            .sort((a:any,b:any) => (a.busStopIndex ?? 0) - (b.busStopIndex ?? 0))
            .map((s:any, idx:number) => ({ ...s, busStopIndex: idx + 1 }));
          
          console.info('Client-normalized stops after deletion:', normalized.map((s:any)=>({id:s.id,busStopIndex:s.busStopIndex})));
          setRoute({ ...route, stops: normalized });
          setSaveMessage('Stop deleted successfully (client-side normalized)');
        }
        
        setSelectedStop(null);
        
        // Still fetch authoritative route to reconcile with server
        routeService.getRoute(route.id, true).then((fresh: any) => {
          console.info('Authoritative route fetched after deletion:', fresh?.stops?.map((s:any)=>({id:s.id,busStopIndex:s.busStopIndex})));
          setRoute(fresh);
        }).catch((bgErr: any) => {
          console.warn('Background authoritative refresh failed:', bgErr);
        });
        
      } catch (clientErr) {
        console.error('Client-side normalization after deletion failed:', clientErr);
        // Fallback to just reloading from server
        const updatedRoute = await routeService.getRoute(route.id, true);
        console.info('Fallback: Refreshed route after deleteSelectedStop:', updatedRoute?.stops?.map((s:any)=>({id:s.id,busStopIndex:s.busStopIndex})));
        setRoute(updatedRoute);
        setSelectedStop(null);
        setSaveMessage('Stop deleted successfully.');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error deleting stop:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setSaveMessage('Failed to delete stop: ' + errorMessage);
      setError('Failed to delete stop');
    } finally {
      setIsDeleting(false);
    }
  }, [route, selectedStop, removeTemporaryStop]);

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

      {/* Map and right-side selected-stop panel */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
        <Paper sx={{ flex: 1, minWidth: 0, height: 600, overflow: 'hidden' }}>
          <RouteMap
            route={route}
            height={600}
            temporaryStops={batchSession.temporaryStops}
            tempMarker={tempMarker}
            onStopClick={handleStopClick}
            onMapClick={handleMapClick}
          />
        </Paper>

        {/* Right panel: shows selected stop info when present */}
        <Box sx={{ width: { xs: '100%', md: 360 } }}>
          {selectedStop && (
            <Paper sx={{ p: 2, mb: { xs: 2, md: 0 }, position: { md: 'sticky' }, top: { md: 80 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton aria-label="Close stop info" onClick={() => { setSelectedStop(null); setEditedName(''); }} size="small">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
              <Typography variant="h6" gutterBottom>
                {'id' in selectedStop && selectedStop.id.toString().startsWith('temp_') 
                  ? 'Temporary Stop' 
                  : 'Bus Stop'
                }
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                <TextField
                  label="Stop Name"
                  size="small"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={async () => {
                    if (!route || !selectedStop) return;
                    const trimmed = (editedName || '').trim();
                    if (!trimmed) {
                      setSaveMessage('Stop name cannot be empty');
                      return;
                    }

                    // If unchanged, do nothing
                    if (trimmed === (selectedStop.name || '')) {
                      setSaveMessage('No changes to save');
                      return;
                    }

                    try {
                      setIsUpdatingName(true);
                      setSaveMessage(null);

                      const stopPayload = {
                        id: selectedStop.id,
                        name: trimmed,
                        // include address for backends that expect address field
                        address: trimmed,
                        // keep existing busStopIndex/direction if present
                        busStopIndex: ('busStopIndex' in selectedStop) ? (selectedStop as any).busStopIndex : undefined,
                        direction: (selectedStop as BusStop).direction || undefined
                      };

                      // Optimistic UI update
                      try {
                        if (route && route.stops) {
                          const newStops = route.stops.map((s:any) => s.id === selectedStop.id ? { ...s, name: trimmed, address: trimmed } : s);
                          setRoute({ ...route, stops: newStops });
                        }
                      } catch (optErr) {
                        console.warn('Optimistic name update failed:', optErr);
                      }

                      await routeService.updateRouteStopFields(route.id.toString(), stopPayload);

                      // Authoritative refresh
                      const fresh = await routeService.getRoute(route.id, true);
                      setRoute(fresh);
                      const authSelected = fresh?.stops?.find((s:any) => s.id === selectedStop.id) || null;
                      if (authSelected) {
                        setSelectedStop(authSelected as any);
                        setEditedName(authSelected.name || '');
                      }
                      setSaveMessage('Stop name updated');
                    } catch (err) {
                      console.error('Failed to update stop name:', err);
                      setSaveMessage('Failed to update stop name');
                    } finally {
                      setIsUpdatingName(false);
                    }
                  }}
                  disabled={isUpdatingName}
                >
                  {isUpdatingName ? 'Saving...' : 'Save'}
                </Button>
              </Box>
              {selectedStop.description && (
                <Typography variant="body2" gutterBottom>
                  <strong>Description:</strong> {selectedStop.description}
                </Typography>
              )}
              <Typography variant="body2" gutterBottom>
                <strong>Location:</strong> {selectedStop.latitude.toFixed(6)}, {selectedStop.longitude.toFixed(6)}
              </Typography>
              {/* Show and edit bus stop index for persisted stops */}
              {!('id' in selectedStop && selectedStop.id.toString().startsWith('temp_')) && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Index:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      label="Bus Stop Index"
                      type="number"
                      size="small"
                      value={editedIndex}
                      onChange={(e) => setEditedIndex(e.target.value === '' ? '' : parseInt(e.target.value))}
                      inputProps={{ min: 1 }}
                      sx={{ width: 120 }}
                    />
                    <Button
                      variant="contained"
                      onClick={async () => {
                        if (!route || !selectedStop) return;
                        // Validate
                        if (editedIndex === '' || typeof editedIndex !== 'number' || editedIndex < 1) {
                          setSaveMessage('Please enter a valid bus stop index (>= 1)');
                          return;
                        }

                        try {
                          setIsUpdatingIndex(true);
                          setSaveMessage(null);
                          // Prepare stop payload using backend DTO shape
                          const stopPayload = {
                            id: selectedStop.id,
                            busStopIndex: editedIndex,
                            direction: (selectedStop as BusStop).direction || undefined
                          };

                          console.info('Updating stop index', { routeId: route.id, stopPayload });

                          await routeService.updateRouteStop(route.id.toString(), stopPayload);

                            // Fetch authoritative route from server to normalize all indices immediately
                            // Client-side normalization: mirror backend shifting logic so UI updates immediately
                            try {
                              const currentStops = route.stops ? route.stops.map((s:any) => ({ ...s })) : [];
                              const stopId = selectedStop.id;
                              const oldPos = currentStops.findIndex((s:any) => s.id === stopId);
                              const oldIndexVal = oldPos !== -1 ? (currentStops[oldPos].busStopIndex ?? (oldPos + 1)) : undefined;
                              const newIndexVal = editedIndex as number;

                              if (oldIndexVal !== undefined && newIndexVal >= 1) {
                                // Move logic: if newIndex > oldIndex decrement intervening stops, if newIndex < oldIndex increment intervening stops
                                if (newIndexVal > oldIndexVal) {
                                  currentStops.forEach((s:any) => {
                                    if ((s.busStopIndex ?? 0) > oldIndexVal && (s.busStopIndex ?? 0) <= newIndexVal) {
                                      s.busStopIndex = (s.busStopIndex ?? 0) - 1;
                                    }
                                  });
                                  // set moved stop
                                  if (oldPos !== -1) currentStops[oldPos].busStopIndex = newIndexVal;
                                } else if (newIndexVal < oldIndexVal) {
                                  currentStops.forEach((s:any) => {
                                    if ((s.busStopIndex ?? 0) >= newIndexVal && (s.busStopIndex ?? 0) < oldIndexVal) {
                                      s.busStopIndex = (s.busStopIndex ?? 0) + 1;
                                    }
                                  });
                                  if (oldPos !== -1) currentStops[oldPos].busStopIndex = newIndexVal;
                                }

                                // Ensure unique ordering by sorting and normalizing
                                const normalized = currentStops.slice().sort((a:any,b:any) => (a.busStopIndex ?? 0) - (b.busStopIndex ?? 0)).map((s:any, idx:number) => ({ ...s, busStopIndex: idx + 1 }));
                                console.info('Client-normalized stops after index update:', normalized.map((s:any)=>({id:s.id,busStopIndex:s.busStopIndex})));
                                setRoute({ ...route, stops: normalized });
                                setSaveMessage('Stop index updated (client-side normalized)');
                                // Don't update selectedStop here to avoid interfering with user input
                              }

                              // Still fetch authoritative route to reconcile
                              routeService.getRoute(route.id, true).then((fresh: any) => {
                                console.info('Authoritative route fetched after update:', fresh?.stops?.map((s:any)=>({id:s.id,busStopIndex:s.busStopIndex})));
                                setRoute(fresh);
                                // Update selectedStop and editedIndex to the authoritative stop after successful update
                                try {
                                  const authSelected = fresh?.stops?.find((s:any) => s.id === stopId) || null;
                                  if (authSelected) {
                                    setSelectedStop(authSelected as any);
                                    setEditedIndex(authSelected.busStopIndex ?? '');
                                  }
                                } catch (e) {
                                  console.warn('Failed to update selectedStop from authoritative fetch', e);
                                }
                              }).catch((bgErr: any) => {
                                console.warn('Background authoritative refresh failed:', bgErr);
                              });
                            } catch (clientErr) {
                              console.error('Client-side normalization failed:', clientErr);
                            }
                        } catch (err: any) {
                          // Try to extract structured API error if available
                          console.error('Error updating stop index:', err);
                          let userMessage = 'Failed to update stop index';
                          if (err?.message) userMessage += ': ' + err.message;
                          // Axios / httpClient may return a structured ApiError
                          if (err?.type && err?.statusCode) {
                            userMessage += ` (${err.type} - ${err.statusCode})`;
                            if (err.fieldErrors) {
                              userMessage += ' - ' + JSON.stringify(err.fieldErrors);
                            }
                          }
                          // If server returned a response body, include it for debugging
                          if (err?.response) {
                            try {
                              userMessage += ' - server: ' + JSON.stringify(err.response.data);
                            } catch (jsonErr) {
                              userMessage += ' - server error details unavailable';
                            }
                          }

                          setSaveMessage(userMessage);
                        } finally {
                          setIsUpdatingIndex(false);
                        }
                      }}
                      disabled={isUpdatingIndex}
                    >
                      {isUpdatingIndex ? 'Updating...' : 'Update Index'}
                    </Button>
                  </Box>
                </Box>
              )}
              
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
              {/* Delete persisted stop */}
              {!('id' in selectedStop && selectedStop.id.toString().startsWith('temp_')) && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={isDeleting ? <CircularProgress size={18} /> : <DeleteIcon />}
                    onClick={deleteSelectedStop}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Stop'}
                  </Button>
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RouteMapPage;
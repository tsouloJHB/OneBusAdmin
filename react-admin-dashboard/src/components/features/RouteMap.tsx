import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  MyLocation as MyLocationIcon,
  Route as RouteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import GoogleMap, { Marker } from '../ui/GoogleMap';
import { Route } from '../../types';
import { LatLngLiteral, MapMouseEvent } from '../../types/google-maps';

interface RouteMapProps {
  route: Route;
  height?: string | number;
  showFullscreenButton?: boolean;
  showLocationButton?: boolean;
  onStopSelect?: (stop: any) => void;
  selectedStop?: any | null;
  layout?: 'dialog' | 'page';
  isAddMode?: boolean;
  isEditMode?: boolean;
  onMapClick?: (e: any) => void;
  tempMarker?: any | null;
}

const RouteMap: React.FC<RouteMapProps> = ({
  route,
  height = 400,
  showFullscreenButton = true,
  showLocationButton = true,
  onStopSelect,
  selectedStop: externalSelectedStop,
  layout = 'dialog',
  isAddMode = false,
  isEditMode = false,
  onMapClick,
  tempMarker,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLngLiteral | null>(null);
  const [selectedStop, setSelectedStop] = useState<any | null>(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

  // Use external selected stop in page layout, internal in dialog layout
  const currentSelectedStop = layout === 'page' ? externalSelectedStop : selectedStop;

  // Default center (Johannesburg, South Africa)
  const defaultCenter = useMemo(() => ({ lat: -26.2041, lng: 28.0473 }), []);
  
  // Process stops with actual backend coordinate data
  const processedStops = useMemo(() => {
    if (route?.stops && route.stops.length > 0) {
      return route.stops.map((stop: any) => ({
        ...stop,
        coordinates: {
          lat: stop.latitude || stop.coordinates?.lat || defaultCenter.lat,
          lng: stop.longitude || stop.coordinates?.lng || defaultCenter.lng,
        }
      })).filter(stop => 
        typeof stop.coordinates.lat === 'number' && 
        typeof stop.coordinates.lng === 'number'
      );
    }
    return [];
  }, [route?.stops, defaultCenter]);

  // Calculate map center based on processed stops
  const mapCenter = useMemo(() => {
    if (processedStops.length > 0) {
      const avgLat = processedStops.reduce((sum, stop) => sum + stop.coordinates.lat, 0) / processedStops.length;
      const avgLng = processedStops.reduce((sum, stop) => sum + stop.coordinates.lng, 0) / processedStops.length;
      return { lat: avgLat, lng: avgLng };
    }
    return defaultCenter;
  }, [processedStops, defaultCenter]);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
        },
        (error) => {
          console.warn('Error getting user location:', error);
        }
      );
    }
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Handle map click
  const handleMapClick = useCallback((e: MapMouseEvent) => {
    if (e?.latLng) {
      console.log('Map clicked at:', e.latLng.toJSON());
      
      if (isAddMode && onMapClick) {
        // In add mode, call external handler
        onMapClick(e);
      } else {
        // Close info window when clicking on map
        setInfoWindowOpen(false);
        setSelectedStop(null);
      }
    }
  }, [isAddMode, onMapClick]);

  // Handle bus stop marker click
  const handleStopClick = useCallback((stop: any) => {
    console.log('Bus stop marker clicked:', stop.address || stop.name);
    console.log('Layout:', layout, 'onStopSelect available:', !!onStopSelect);
    
    if (layout === 'page' && onStopSelect) {
      // In page layout, use external callback
      console.log('Calling onStopSelect with stop:', stop);
      onStopSelect(stop);
    } else {
      // In dialog layout, use internal state
      console.log('Using internal state for stop selection');
      setSelectedStop(stop);
      setInfoWindowOpen(true);
    }
  }, [layout, onStopSelect]);

  const mapHeight = isFullscreen ? '80vh' : height;

  // Safety check for route data
  if (!route) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6" gutterBottom>
          Route Data Missing
        </Typography>
        <Typography variant="body2">
          Unable to display map: Route information is not available.
        </Typography>
      </Alert>
    );
  }

  // Debug: Log route data
  console.log('RouteMap - Route data:', route);
  console.log('RouteMap - Map center:', mapCenter);
  console.log('RouteMap - Processed stops:', processedStops);
  console.log('RouteMap - First stop coordinates:', processedStops[0]?.coordinates);
  console.log('RouteMap - Number of markers to render:', processedStops.length);

  return (
    <Card sx={{ height: isFullscreen ? '85vh' : 'auto' }}>
      <CardHeader
        avatar={<RouteIcon color="primary" />}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">
              {route.name}
            </Typography>
            <Chip
              label={route.isActive ? 'Active' : 'Inactive'}
              color={route.isActive ? 'success' : 'default'}
              size="small"
              variant="outlined"
            />
          </Box>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {route.startPoint} → {route.endPoint}
            {route.stops && route.stops.length > 0 && (
              <> • {route.stops.length} stop{route.stops.length === 1 ? '' : 's'}</>
            )}
          </Typography>
        }
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {showLocationButton && (
              <Tooltip title="Get Current Location">
                <IconButton onClick={getCurrentLocation} size="small">
                  <MyLocationIcon />
                </IconButton>
              </Tooltip>
            )}
            {showFullscreenButton && (
              <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                <IconButton onClick={toggleFullscreen} size="small">
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <GoogleMap
          center={mapCenter}
          zoom={12}
          height={mapHeight}
          onClick={handleMapClick}
          style={{ 
            cursor: isAddMode ? 'crosshair' : 'default'
          }}
        >
          {/* Route stops markers */}
          {processedStops.length > 0 ? (
            processedStops.map((stop, index) => (
              <Marker
                key={`stop-${stop.id || index}-${index}`}
                position={stop.coordinates}
                title={`${stop.address || stop.name || 'Stop'} (Stop ${index + 1})`}
                icon={undefined}
                onClick={() => {
                  console.log('Marker onClick triggered for stop:', stop.id, stop.address);
                  handleStopClick(stop);
                }}
              />
            ))
          ) : (
            // Show a single marker at the center if no stops
            <Marker
              key="route-center"
              position={mapCenter}
              title={`${route.name} - Route Center`}
              icon={'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#1976d2" stroke="#fff" stroke-width="3"/>
                    <path d="M16 8L20 14H12L16 8Z" fill="white"/>
                    <circle cx="16" cy="20" r="2" fill="white"/>
                  </svg>
                `)}
            />
          )}
          
          {/* Temporary marker for new stops */}
          {tempMarker && (
            <Marker
              key="temp-marker"
              position={tempMarker.coordinates}
              title="New Bus Stop"
              onClick={() => {
                if (onStopSelect) {
                  onStopSelect(tempMarker);
                }
              }}
            />
          )}
          
          {/* User location marker */}
          {userLocation && (
            <Marker
              key="user-location"
              position={userLocation}
              title="Your Location"
              icon={'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="6" fill="#4285f4" stroke="#fff" stroke-width="2"/>
                    <circle cx="10" cy="10" r="2" fill="#fff"/>
                  </svg>
                `)}
            />
          )}
        </GoogleMap>
      </CardContent>
      
      {/* Bus Stops List - Only show in dialog layout */}
      {layout === 'dialog' && (
        <CardContent sx={{ borderTop: 1, borderColor: 'divider', maxHeight: '200px', overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Bus Stops ({processedStops.length})
          </Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {processedStops.map((stop, index) => (
              <Box
                key={stop.id}
                sx={{
                  p: 1,
                  border: 1,
                  borderColor: currentSelectedStop?.id === stop.id ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  backgroundColor: currentSelectedStop?.id === stop.id ? 'primary.50' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'grey.100'
                  }
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Stop clicked:', stop.address);
                  setSelectedStop(stop);
                  setInfoWindowOpen(true);
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  #{index + 1} - {stop.address || 'Unknown Address'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stop.coordinates.lat.toFixed(4)}, {stop.coordinates.lng.toFixed(4)}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      )}

      {/* Bus Stop Information Panel - Only show in dialog layout */}
      {layout === 'dialog' && currentSelectedStop && infoWindowOpen && (
        <CardContent sx={{ borderTop: 1, borderColor: 'divider', backgroundColor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" color="primary">
              Bus Stop #{processedStops.findIndex(s => s.id === currentSelectedStop.id) + 1}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => {
                setInfoWindowOpen(false);
                setSelectedStop(null);
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'grid', gap: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Address:
              </Typography>
              <Typography variant="body1">
                {currentSelectedStop.address || 'Address not available'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Coordinates:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                {currentSelectedStop.coordinates.lat.toFixed(6)}, {currentSelectedStop.coordinates.lng.toFixed(6)}
              </Typography>
            </Box>
            
            {currentSelectedStop.name && currentSelectedStop.name !== currentSelectedStop.address && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Stop Name:
                </Typography>
                <Typography variant="body1">
                  {currentSelectedStop.name}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip 
                label={`Stop ID: ${currentSelectedStop.id}`} 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                label={`Lat: ${currentSelectedStop.coordinates.lat.toFixed(4)}`} 
                size="small" 
                variant="outlined" 
                color="primary"
              />
              <Chip 
                label={`Lng: ${currentSelectedStop.coordinates.lng.toFixed(4)}`} 
                size="small" 
                variant="outlined" 
                color="primary"
              />
            </Box>
          </Box>
        </CardContent>
      )}
      
      {/* Route info footer */}
      {!isFullscreen && layout === 'dialog' && (
        <CardContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Click on bus stop markers to view details
            </Typography>
            <Button
              size="small"
              startIcon={<RouteIcon />}
              onClick={() => {
                // This will be used later for opening detailed route view
                console.log('View route details:', route.id);
              }}
            >
              View Details
            </Button>
          </Box>
        </CardContent>
      )}
      
      {/* Mode indicator for page layout */}
      {layout === 'page' && (isAddMode || isEditMode) && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            bgcolor: isAddMode ? 'success.main' : 'warning.main',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
            zIndex: 1000,
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {isAddMode ? '🎯 Click on map to add stop' : '✏️ Edit mode active'}
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default RouteMap;
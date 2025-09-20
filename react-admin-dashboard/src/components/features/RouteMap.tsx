import React, { useCallback, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import GoogleMap from '../ui/GoogleMap';
import { useMarkerManager } from '../../hooks/useMarkerManager';
import { MarkerData } from '../../types/marker';
import { Route, BusStop, TemporaryStop } from '../../types';

export interface RouteMapProps {
  route: Route | null;
  height?: string | number;
  temporaryStops?: TemporaryStop[];
  tempMarker?: { position: google.maps.LatLngLiteral; title?: string } | null;
  onStopClick?: (stop: BusStop | TemporaryStop) => void;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
}

const RouteMap: React.FC<RouteMapProps> = ({
  route,
  height = 400,
  temporaryStops = [],
  tempMarker = null,
  onStopClick,
  onMapClick,
  center,
  zoom = 12
}) => {

  const [mapInstance, setMapInstance] = React.useState<google.maps.Map | null>(null);

  // Default center (Johannesburg CBD)
  const defaultCenter = useMemo(() => ({
    lat: -26.2041,
    lng: 28.0473
  }), []);

  const mapCenter = center || defaultCenter;

  // Handle map ready callback
  const handleMapReady = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  // Handle marker clicks
  const handleMarkerClick = useCallback((markerId: string) => {
    if (!onStopClick) return;

    // Find the stop in route stops
    const routeStop = route?.stops?.find(stop => `stop-${stop.id}` === markerId);
    if (routeStop) {
      onStopClick(routeStop);
      return;
    }

    // Find the stop in temporary stops
    const tempStop = temporaryStops.find(stop => `temp-${stop.id}` === markerId);
    if (tempStop) {
      onStopClick(tempStop);
      return;
    }
  }, [route?.stops, temporaryStops, onStopClick]);

  // Initialize marker manager
  const markerManager = useMarkerManager(mapInstance, {
    debugMode: process.env.NODE_ENV === 'development',
    eventHandlers: {
      onClick: handleMarkerClick
    }
  });

  // Convert stops to marker data
  const markerData = useMemo((): MarkerData[] => {
    const markers: MarkerData[] = [];

    // Only create markers if Google Maps is loaded
    if (!window.google || !window.google.maps) {
      return markers;
    }

    // Add route stops
    if (route?.stops) {
      route.stops.forEach((stop) => {
        // Use explicit busStopIndex when available so UI updates immediately after index change
        const displayIndex = (stop as any).busStopIndex ?? undefined;
        const titlePrefix = displayIndex !== undefined ? `${displayIndex}. ` : '';
        markers.push({
          id: `stop-${stop.id}`,
          position: { lat: stop.latitude, lng: stop.longitude },
          title: `${titlePrefix}${stop.name}`,
          // Add visible numeric label showing the bus stop index
          label: {
            text: displayIndex !== undefined ? String(displayIndex) : '',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#1976d2',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          },
          zIndex: 100
        });
      });
    }

    // Add temporary stops
    temporaryStops.forEach((stop, index) => {
      markers.push({
        id: `temp-${stop.id}`,
        position: { lat: stop.latitude, lng: stop.longitude },
        title: `${(route?.stops?.length || 0) + index + 1}. ${stop.name} (Temporary)`,
        label: {
          text: String((route?.stops?.length || 0) + index + 1),
          color: '#000000',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ff9800',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        zIndex: 200
      });
    });

    // Add temporary marker
    if (tempMarker) {
      markers.push({
        id: 'temp-marker',
        position: tempMarker.position,
        title: tempMarker.title || 'New Stop Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: '#4caf50',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        },
        zIndex: 300
      });
    }


    
    return markers;
    }, [route, temporaryStops, tempMarker]);

  // Debug: log marker data when it changes to help detect stale props
  useEffect(() => {
    try {
      if (markerData && markerData.length > 0) {
        console.info('RouteMap markerData:', markerData.map(m => ({ id: m.id, title: m.title })));
      } else {
        console.info('RouteMap markerData: []');
      }
    } catch (err) {
      console.warn('Error logging markerData', err);
    }
  }, [markerData]);

  // Update markers when data changes
  useEffect(() => {
    if (mapInstance && window.google && window.google.maps) {
      try {
        markerManager.updateMarkers(markerData);
      } catch (error) {
        console.error('Error updating markers:', error);
      }
    }
  }, [mapInstance, markerData, markerManager]);

  // Auto-fit map bounds to include all markers when they change
  useEffect(() => {
    if (!mapInstance || !window.google || !window.google.maps) return;

    try {
      if (markerData && markerData.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markerData.forEach(m => {
          // Ensure position exists and is valid
          if (m.position && typeof m.position.lat === 'number' && typeof m.position.lng === 'number') {
            bounds.extend(m.position);
          }
        });

        // Only fit bounds if we actually extended it with at least one point
        // Guard against calling fitBounds with an empty bounds
        try {
          mapInstance.fitBounds(bounds);
        } catch (err) {
          // In some edge cases fitBounds can throw if invalid; fallback to setCenter
          const first = markerData[0];
          if (first && first.position) {
            mapInstance.setCenter(first.position);
          }
        }
      } else {
        // No markers: reset to default center and zoom
        mapInstance.setCenter(mapCenter);
        mapInstance.setZoom(zoom);
      }
    } catch (error) {
      console.error('Error while fitting map bounds:', error);
    }
  }, [mapInstance, markerData, mapCenter, zoom]);

  return (
    <Box sx={{ height, width: '100%' }}>
      <GoogleMap
        center={mapCenter}
        zoom={zoom}
        height={height}
        onClick={onMapClick}
        onMapReady={handleMapReady}
        mapOptions={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        }}
      />
    </Box>
  );
};

export default RouteMap;
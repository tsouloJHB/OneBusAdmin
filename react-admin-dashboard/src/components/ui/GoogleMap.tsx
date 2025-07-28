import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { config } from '../../config';
import { LatLngLiteral, MapMouseEvent, MapIcon } from '../../types/google-maps';

interface MapProps {
  center: LatLngLiteral;
  zoom: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: (e: MapMouseEvent) => void;
  onIdle?: (map: any) => void;
}

interface MarkerProps {
  position: LatLngLiteral;
  map?: any;
  title?: string;
  icon?: string | MapIcon;
  onClick?: () => void;
}

// Map component that renders the actual Google Map
const Map: React.FC<MapProps> = ({
  center,
  zoom,
  style,
  children,
  onClick,
  onIdle,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initializingRef = useRef(false);

  // Load Google Maps script and initialize map
  useEffect(() => {
    console.log('GoogleMap useEffect - checking conditions:', {
      hasRef: !!ref.current,
      hasMap: !!map,
      isInitializing: initializingRef.current,
      hasApiKey: !!config.googleMapsApiKey,
      apiKey: config.googleMapsApiKey?.substring(0, 10) + '...'
    });

    if (!ref.current) {
      console.log('GoogleMap: No ref.current, skipping');
      return;
    }
    if (map) {
      console.log('GoogleMap: Map already exists, skipping');
      return;
    }
    if (initializingRef.current) {
      console.log('GoogleMap: Already initializing, skipping');
      return;
    }
    if (!config.googleMapsApiKey) {
      console.log('GoogleMap: No API key, skipping');
      return;
    }

    initializingRef.current = true;
    console.log('GoogleMap: Starting script load...');

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded, creating map...');
      createMap();
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      createMap();
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      setError('Failed to load Google Maps script');
      initializingRef.current = false;
    };

    document.head.appendChild(script);

    function createMap() {
      if (ref.current && !map && window.google) {
        try {
          const newMap = new window.google.maps.Map(ref.current, {
            center,
            zoom,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
          });
          
          console.log('Google Map instance created successfully');
          setMap(newMap);
          initializingRef.current = false;
        } catch (mapError) {
          console.error('Error creating map instance:', mapError);
          const errorMessage = mapError instanceof Error ? mapError.message : 'Unknown error';
          setError('Failed to create map instance: ' + errorMessage);
          initializingRef.current = false;
        }
      }
    }

    // Cleanup function
    return () => {
      // Don't remove the script as it might be used by other components
      initializingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once

  // Update map center and zoom when props change
  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  // Add click listener
  useEffect(() => {
    if (map && onClick && window.google) {
      const listener = map.addListener('click', onClick);
      return () => {
        window.google.maps.event.removeListener(listener);
      };
    }
  }, [map, onClick]);

  // Add idle listener
  useEffect(() => {
    if (map && onIdle && window.google) {
      const listener = map.addListener('idle', () => onIdle(map));
      return () => {
        window.google.maps.event.removeListener(listener);
      };
    }
  }, [map, onIdle]);

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6" gutterBottom>
          Google Maps Error
        </Typography>
        <Typography variant="body2">
          {error}
        </Typography>
      </Alert>
    );
  }

  return (
    <>
      <div 
        ref={ref} 
        style={{
          ...style,
          minHeight: style?.height || '400px',
          width: '100%',
          position: 'relative'
        }} 
      />
      {!map && !error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 1000,
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading Google Maps...
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ref status: {ref.current ? 'Ready' : 'Waiting...'}
          </Typography>
        </Box>
      )}
      {map && React.Children.map(children as React.ReactElement[], (child) => {
        if (React.isValidElement(child)) {
          // Clone child and pass map as prop
          return React.cloneElement(child, { map } as any);
        }
        return child;
      })}
    </>
  );
};

// Marker component
export const Marker: React.FC<MarkerProps> = ({
  position,
  map,
  title,
  icon,
  onClick,
}) => {
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!marker && map && window.google) {
      try {
        console.log('Creating marker at position:', position, 'with title:', title);
        const newMarker = new window.google.maps.Marker({
          position,
          map,
          title,
          icon,
        });
        
        console.log('Marker created successfully:', newMarker);
        setMarker(newMarker);
      } catch (error) {
        console.error('Error creating marker:', error);
      }
    }

    return () => {
      if (marker) {
        console.log('Cleaning up marker');
        marker.setMap(null);
      }
    };
  }, [map]); // Only depend on map, not on other props

  useEffect(() => {
    if (marker) {
      marker.setPosition(position);
      if (title) marker.setTitle(title);
      if (icon) marker.setIcon(icon);
    }
  }, [marker, position, title, icon]);

  useEffect(() => {
    if (marker && onClick && window.google) {
      console.log('Adding click listener to marker with onClick:', !!onClick);
      const listener = marker.addListener('click', () => {
        console.log('Marker clicked!');
        onClick();
      });
      return () => {
        window.google.maps.event.removeListener(listener);
      };
    } else {
      console.log('Not adding click listener - marker:', !!marker, 'onClick:', !!onClick, 'google:', !!window.google);
    }
  }, [marker, onClick]);

  return null;
};



// Main GoogleMap component
interface GoogleMapProps extends Omit<MapProps, 'children'> {
  height?: string | number;
  width?: string | number;
  children?: React.ReactNode;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom,
  height = 400,
  width = '100%',
  children,
  onClick,
  onIdle,
}) => {
  const mapStyle: React.CSSProperties = {
    height,
    width,
  };

  if (!config.googleMapsApiKey) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        <Typography variant="h6" gutterBottom>
          Google Maps API Key Required
        </Typography>
        <Typography variant="body2">
          Please add your Google Maps API key to the environment variables:
          <br />
          <code>REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here</code>
        </Typography>
      </Alert>
    );
  }

  return (
    <Map
      center={center}
      zoom={zoom}
      style={mapStyle}
      onClick={onClick}
      onIdle={onIdle}
    >
      {children}
    </Map>
  );
};

export default GoogleMap;
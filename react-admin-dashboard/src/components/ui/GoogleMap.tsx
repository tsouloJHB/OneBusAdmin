import React, { useEffect, useRef, useCallback } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';

export interface GoogleMapProps {
  center: google.maps.LatLngLiteral;
  zoom?: number;
  height?: string | number;
  width?: string | number;
  children?: React.ReactNode;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  onMapReady?: (map: google.maps.Map) => void;
  mapOptions?: Partial<google.maps.MapOptions>;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom = 12,
  height = 400,
  width = '100%',
  children,
  onClick,
  onMapReady,
  mapOptions = {}
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const initializeMap = useCallback(() => {
    console.log('Attempting to initialize map...');
    console.log('mapRef.current:', !!mapRef.current);
    console.log('window.google:', !!window.google);
    console.log('window.google.maps:', !!(window.google && window.google.maps));
    
    if (!mapRef.current) {
      console.error('Map container ref is null');
      return;
    }
    
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not available');
      return;
    }

    try {
      console.log('Creating Google Map instance...');
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        ...mapOptions
      });

      mapInstanceRef.current = map;
      console.log('Map instance created successfully');

      // Add click listener if provided
      if (onClick) {
        console.log('Adding click listener to map...');
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          console.log('GoogleMap: Click event received', event);
          onClick(event);
        });
        console.log('Click listener added successfully');
      } else {
        console.log('No onClick prop provided to GoogleMap');
      }

      // Call onMapReady callback if provided
      if (onMapReady) {
        onMapReady(map);
        console.log('onMapReady callback called');
      }

      setIsLoaded(true);
      setError(null);
      console.log('Map initialization complete');
    } catch (err) {
      console.error('Error initializing Google Map:', err);
      setError(`Failed to initialize map: ${err}`);
    }
  }, [center, zoom, onClick, onMapReady, mapOptions]);

  // Load Google Maps API if not already loaded
  useEffect(() => {
    console.log('GoogleMap useEffect triggered');
    
    // Check if API key is configured first
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    console.log('API Key available:', !!apiKey);
    
    if (!apiKey) {
      setError('Google Maps API key not configured. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file.');
      return;
    }

    // Function to initialize map when both API and DOM are ready
    const tryInitialize = () => {
      console.log('Trying to initialize map...');
      console.log('mapRef.current:', !!mapRef.current);
      console.log('window.google:', !!window.google);
      console.log('window.google.maps:', !!(window.google && window.google.maps));
      
      if (mapRef.current && window.google && window.google.maps) {
        console.log('Both DOM and Google Maps ready, initializing...');
        initializeMap();
        return true;
      }
      return false;
    };

    // If Google Maps is already loaded, try to initialize
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded');
      if (!tryInitialize()) {
        // DOM not ready yet, wait a bit
        const timer = setTimeout(tryInitialize, 100);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('Google Maps script already exists, waiting for load...');
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds
      
      const checkGoogleMaps = () => {
        attempts++;
        console.log(`Checking Google Maps availability, attempt ${attempts}`);
        
        if (tryInitialize()) {
          return; // Success
        }
        
        if (attempts < maxAttempts) {
          setTimeout(checkGoogleMaps, 100);
        } else {
          console.error('Timeout waiting for Google Maps to load');
          setError('Timeout waiting for Google Maps to load');
        }
      };
      checkGoogleMaps();
      return;
    }

    // Load Google Maps API
    console.log('Loading Google Maps script...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      // Try to initialize, with retries if DOM not ready
      let attempts = 0;
      const maxAttempts = 10;
      
      const retryInit = () => {
        attempts++;
        if (tryInitialize()) {
          return; // Success
        }
        
        if (attempts < maxAttempts) {
          setTimeout(retryInit, 100);
        } else {
          console.error('DOM container not ready after Google Maps loaded');
          setError('Failed to initialize map container');
        }
      };
      
      retryInit();
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      setError('Failed to load Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts during loading
      if (script.parentNode) {
        console.log('Cleaning up Google Maps script');
        script.parentNode.removeChild(script);
      }
    };
  }, []); // Remove initializeMap dependency to prevent re-runs

  // Update map center and zoom when props change
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom, isLoaded]);

  if (error) {
    return (
      <Box
        sx={{
          height,
          width,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height, width, position: 'relative' }}>
      <div
        ref={mapRef}
        style={{
          height: '100%',
          width: '100%'
        }}
      />
      
      {/* Loading overlay */}
      {!isLoaded && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            zIndex: 1000
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {children}
    </Box>
  );
};

export default GoogleMap;
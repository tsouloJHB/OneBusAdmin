import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { LocationOn as LocationIcon, Map as MapIcon } from '@mui/icons-material';
import { Route, BusStop, TemporaryStop } from '../../types';

interface FallbackMapProps {
  route: Route | null;
  height?: string | number;
  temporaryStops?: TemporaryStop[];
  tempMarker?: { position: { lat: number; lng: number }; title?: string } | null;
  onStopClick?: (stop: BusStop | TemporaryStop) => void;
}

const FallbackMap: React.FC<FallbackMapProps> = ({
  route,
  height = 400,
  temporaryStops = [],
  tempMarker,
  onStopClick
}) => {
  const allStops = [
    ...(route?.stops || []),
    ...temporaryStops
  ];

  return (
    <Box
      sx={{
        height,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        border: '2px dashed #ccc',
        borderRadius: 1
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: '#e3f2fd',
          borderBottom: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <MapIcon color="primary" />
        <Typography variant="h6" color="primary">
          Map View (Development Mode)
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Google Maps is not available. Showing route information instead.
        </Typography>

        {route && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {route.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {route.startPoint} → {route.endPoint}
            </Typography>
            {route.description && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {route.description}
              </Typography>
            )}
          </Paper>
        )}

        {/* Stops List */}
        {allStops.length > 0 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bus Stops ({allStops.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {allStops.map((stop, index) => {
                const isTemporary = 'id' in stop && stop.id.toString().startsWith('temp_');
                return (
                  <Box
                    key={stop.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1,
                      backgroundColor: isTemporary ? '#fff3e0' : '#f8f9fa',
                      borderRadius: 1,
                      cursor: onStopClick ? 'pointer' : 'default',
                      '&:hover': onStopClick ? {
                        backgroundColor: isTemporary ? '#ffe0b2' : '#e9ecef'
                      } : {}
                    }}
                    onClick={() => onStopClick && onStopClick(stop)}
                  >
                    <LocationIcon 
                      color={isTemporary ? 'warning' : 'primary'} 
                      fontSize="small" 
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {index + 1}. {stop.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                      </Typography>
                    </Box>
                    {isTemporary && (
                      <Chip 
                        label="Temporary" 
                        size="small" 
                        color="warning" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Paper>
        )}

        {/* Temporary Marker */}
        {tempMarker && (
          <Paper sx={{ p: 2, backgroundColor: '#e8f5e8' }}>
            <Typography variant="h6" gutterBottom color="success.main">
              New Stop Location
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="success" fontSize="small" />
              <Typography variant="body2">
                {tempMarker.title || 'New Stop Location'}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {tempMarker.position.lat.toFixed(6)}, {tempMarker.position.lng.toFixed(6)}
            </Typography>
          </Paper>
        )}

        {allStops.length === 0 && !tempMarker && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              color: 'text.secondary'
            }}
          >
            <MapIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body1">
              No stops to display
            </Typography>
            <Typography variant="body2">
              Add stops to see them here
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 1,
          backgroundColor: '#fff3e0',
          borderTop: '1px solid #ccc',
          textAlign: 'center'
        }}
      >
        <Typography variant="caption" color="text.secondary">
          To enable Google Maps, set up a valid API key in your .env file
        </Typography>
      </Box>
    </Box>
  );
};

export default FallbackMap;
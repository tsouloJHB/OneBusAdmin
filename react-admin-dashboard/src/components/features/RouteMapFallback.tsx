import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  Route as RouteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { Route } from '../../types';

interface RouteMapFallbackProps {
  route: Route;
  height?: string | number;
}

const RouteMapFallback: React.FC<RouteMapFallbackProps> = ({
  route,
  height = 400,
}) => {
  if (!route) {
    return (
      <Alert severity="error">
        Route data is not available.
      </Alert>
    );
  }

  return (
    <Card sx={{ height: 'auto' }}>
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
      />
      <CardContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Map view is temporarily unavailable. Showing route details instead.
          </Typography>
        </Alert>
        
        {route.stops && route.stops.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="primary" />
              Route Stops
            </Typography>
            <List dense>
              {route.stops.map((stop, index) => (
                <ListItem key={stop.id}>
                  <ListItemText
                    primary={`${index + 1}. ${stop.name}`}
                    secondary={
                      stop.coordinates 
                        ? `Coordinates: ${stop.coordinates.lat.toFixed(6)}, ${stop.coordinates.lng.toFixed(6)}`
                        : 'Coordinates not available'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {(!route.stops || route.stops.length === 0) && (
          <Typography variant="body2" color="text.secondary">
            No stops defined for this route.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteMapFallback;
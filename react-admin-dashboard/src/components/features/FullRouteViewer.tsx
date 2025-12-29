import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
  Route as RouteIcon,
  Navigation as NavigationIcon,
} from '@mui/icons-material';
import { FullRoute, Coordinate } from '../../types';

interface FullRouteViewerProps {
  open: boolean;
  onClose: () => void;
  route: FullRoute | null;
}

const FullRouteViewer: React.FC<FullRouteViewerProps> = ({ open, onClose, route }) => {
  if (!route) return null;

  // Parse coordinates if they're in JSON string format
  const coordinates: Coordinate[] = route.coordinates || 
    (route.coordinatesJson ? JSON.parse(route.coordinatesJson) : []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="full-route-viewer-title"
    >
      <DialogTitle
        id="full-route-viewer-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RouteIcon />
          <Typography variant="h6">Full Route Details</Typography>
        </Box>
        <Button
          onClick={onClose}
          sx={{ color: 'primary.contrastText', minWidth: 'auto' }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* Route Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Route Information
          </Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Route Name
              </Typography>
              <Typography variant="body1">{route.name}</Typography>
            </Box>

            {route.direction && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Direction
                </Typography>
                <Chip
                  icon={<NavigationIcon />}
                  label={route.direction}
                  color="primary"
                  size="small"
                />
              </Box>
            )}

            {route.description && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">{route.description}</Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Company ID
                </Typography>
                <Typography variant="body1">{route.companyId}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Route ID
                </Typography>
                <Typography variant="body1">{route.routeId}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Coordinates */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Route Coordinates ({coordinates.length} points)
          </Typography>
          <List
            sx={{
              maxHeight: 300,
              overflow: 'auto',
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: 1,
              borderColor: 'grey.300',
            }}
          >
            {coordinates.map((coord, index) => (
              <ListItem
                key={index}
                sx={{
                  borderBottom: index < coordinates.length - 1 ? 1 : 0,
                  borderColor: 'grey.200',
                }}
              >
                <ListItemText
                  primary={`Point ${index + 1}`}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant="caption" component="span">
                        Lat: {coord.lat.toFixed(6)}
                      </Typography>
                      <Typography variant="caption" component="span">
                        Lon: {coord.lon.toFixed(6)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Timestamps */}
        {(route.createdAt || route.updatedAt) && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', gap: 3 }}>
              {route.createdAt && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body2">
                    {new Date(route.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              )}

              {route.updatedAt && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Updated At
                  </Typography>
                  <Typography variant="body2">
                    {new Date(route.updatedAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FullRouteViewer;

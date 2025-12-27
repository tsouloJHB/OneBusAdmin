import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Grid,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  DirectionsBus,
  LocationOn,
  People,
  Schedule,
  Refresh,
  Warning,
  CheckCircle,
  AccessTime
} from '@mui/icons-material';
import { ActiveBus, ApiError } from '../../types';
import { CardSkeleton, RetryComponent } from '../ui';

interface ActiveBusListProps {
  buses: ActiveBus[];
  loading?: boolean;
  error?: ApiError | null;
  onRefresh?: () => void;
  onRetry?: () => void;
  lastUpdated?: Date;
}

const ActiveBusList: React.FC<ActiveBusListProps> = ({
  buses,
  loading = false,
  error,
  onRefresh,
  onRetry,
  lastUpdated
}) => {
  const theme = useTheme();

  const getStatusColor = (status: ActiveBus['status']) => {
    switch (status) {
      case 'on_route':
        return 'success';
      case 'at_stop':
        return 'info';
      case 'delayed':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: ActiveBus['status']) => {
    switch (status) {
      case 'on_route':
        return <CheckCircle fontSize="small" />;
      case 'at_stop':
        return <LocationOn fontSize="small" />;
      case 'delayed':
        return <Warning fontSize="small" />;
      default:
        return <DirectionsBus fontSize="small" />;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h ago`;
  };

  const getLocationString = (location: { lat: number; lng: number }) => {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  };

  // Show skeleton loader when loading initially
  if (loading && buses.length === 0) {
    return (
      <Box>
        {/* Header skeleton */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" component="h2">
            Active Buses
          </Typography>
        </Box>
        <CardSkeleton count={6} showImage={false} />
      </Box>
    );
  }

  // Show error with retry option
  if (error && buses.length === 0) {
    return (
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" component="h2">
            Active Buses
          </Typography>
        </Box>
        <RetryComponent
          error={error}
          onRetry={onRetry || (() => {})}
          variant="card"
          size="large"
        />
      </Box>
    );
  }

  if (buses.length === 0 && !loading && !error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
        textAlign="center"
      >
        <DirectionsBus sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Active Buses
        </Typography>
        <Typography variant="body2" color="text.secondary">
          There are currently no buses active on any routes.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Show error banner if there's an error but we have cached data */}
      {error && buses.length > 0 && (
        <RetryComponent
          error={error}
          onRetry={onRetry || (() => {})}
          variant="banner"
        />
      )}

      {/* Header with refresh button and last updated time */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" component="h2">
          Active Buses ({buses.length})
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Updated {formatLastUpdated(lastUpdated)}
            </Typography>
          )}
          {onRefresh && (
            <Tooltip title="Refresh">
              <IconButton
                onClick={onRefresh}
                disabled={loading}
                size="small"
                aria-label="Refresh active buses"
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Bus Cards Grid */}
      <Grid container spacing={2}>
        {buses.map((activeBus) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            key={activeBus.id}
          >
            <Card
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                {/* Bus Header */}
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      mr: 2
                    }}
                  >
                    <DirectionsBus />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="h6" component="h3" noWrap>
                      Bus {activeBus.bus.busNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {activeBus.bus.model}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getStatusIcon(activeBus.status)}
                    label={activeBus.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(activeBus.status)}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Route Information */}
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Route: {activeBus.route.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {activeBus.route.startPoint} → {activeBus.route.endPoint}
                  </Typography>
                </Box>

                {/* Last Stop Coordinates */}
                {activeBus.lastStop && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Last Stop: {activeBus.lastStop.name || `Stop ${activeBus.lastStop.order}`}
                    </Typography>
                    {activeBus.lastStop.coordinates && (
                      <Typography variant="caption" color="text.secondary">
                        {activeBus.lastStop.coordinates.lat.toFixed(4)}, {activeBus.lastStop.coordinates.lng.toFixed(4)}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Status Information Grid */}
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {/* Current Location */}
                  <Grid size={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {getLocationString(activeBus.currentLocation)}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Next Stop */}
                  <Grid size={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Next: {activeBus.nextStop.name}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Passenger Count */}
                  <Grid size={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {activeBus.passengerCount}/{activeBus.bus.capacity}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Estimated Arrival */}
                  <Grid size={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(activeBus.estimatedArrival)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Passenger Capacity Bar */}
                <Box mb={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Capacity
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round((activeBus.passengerCount / activeBus.bus.capacity) * 100)}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 6,
                      bgcolor: 'grey.200',
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${Math.min((activeBus.passengerCount / activeBus.bus.capacity) * 100, 100)}%`,
                        height: '100%',
                        bgcolor: activeBus.passengerCount / activeBus.bus.capacity > 0.8 
                          ? 'warning.main' 
                          : 'primary.main',
                        transition: 'width 0.3s ease-in-out'
                      }}
                    />
                  </Box>
                </Box>

                {/* Last Updated */}
                <Typography variant="caption" color="text.secondary">
                  Updated {formatLastUpdated(activeBus.lastUpdated)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(ActiveBusList, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  // Only re-render if these props change
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.lastUpdated === nextProps.lastUpdated &&
    JSON.stringify(prevProps.buses) === JSON.stringify(nextProps.buses)
  );
});
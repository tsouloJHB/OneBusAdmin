import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert,
  Skeleton,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { 
  DirectionsBus as BusIcon,
  Route as RouteIcon,
  PlayArrow as ActiveIcon,
  People as UsersIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { dashboardService } from '../../services/dashboardService';
import { DashboardStats } from '../../types';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleRefresh = () => {
    fetchDashboardStats();
  };

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning';
  }> = ({ title, value, icon, color = 'primary' }) => (
    <Card 
      sx={{ height: '100%' }}
      role="region"
      aria-labelledby={`stat-${title.toLowerCase().replace(/\s+/g, '-')}-title`}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            p: { xs: 0.75, sm: 1 }, 
            borderRadius: 1, 
            bgcolor: `${color}.light`,
            color: `${color}.contrastText`,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {icon}
          </Box>
          <Typography 
            variant="h6" 
            component="h2" 
            id={`stat-${title.toLowerCase().replace(/\s+/g, '-')}-title`}
            color="text.secondary"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            {title}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton 
            variant="text" 
            width="60%" 
            height={48}
            aria-label={`Loading ${title.toLowerCase()}`}
          />
        ) : (
          <Typography 
            variant="h3" 
            color={`${color}.main`} 
            fontWeight="bold"
            sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem' } }}
            aria-label={`${title}: ${value}`}
          >
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }} role="main" aria-labelledby="dashboard-title">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        mb: 3 
      }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            id="dashboard-title"
            gutterBottom
            sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}
          >
            Dashboard
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Welcome to the Bus Admin Dashboard
          </Typography>
        </Box>
        <IconButton 
          onClick={handleRefresh} 
          disabled={loading}
          aria-label={loading ? 'Refreshing dashboard data' : 'Refresh dashboard data'}
          sx={{ 
            bgcolor: 'background.paper',
            minWidth: 44,
            minHeight: 44,
            alignSelf: { xs: 'flex-end', sm: 'center' },
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Total Routes"
          value={stats?.totalRoutes ?? '--'}
          icon={<RouteIcon />}
          color="primary"
        />
        <StatCard
          title="Total Buses"
          value={stats?.totalBuses ?? '--'}
          icon={<BusIcon />}
          color="secondary"
        />
        <StatCard
          title="Active Buses"
          value={stats?.activeBuses ?? '--'}
          icon={<ActiveIcon />}
          color="success"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? '--'}
          icon={<UsersIcon />}
          color="warning"
        />
      </Box>

      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Recent Activity
          </Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {stats.recentActivity.map((activity) => (
              <Box
                key={activity.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                <Box>
                  <Typography variant="body2">
                    {activity.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    by {activity.userName}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Route as RouteIcon,
  PlayArrow as ActiveIcon,
  People as UsersIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { StatsCard, ModernCard, ModernButton, OneBusLogo } from '../ui';
import { designTokens } from '../../theme';
import dashboardService from '../../services/dashboardService';
import { DashboardStats } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const SimpleDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = user?.role === 'COMPANY_ADMIN' ? user.companyId : undefined;
      const data = await dashboardService.getDashboardStats(companyId);
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const handleRefresh = () => {
    loadDashboardStats();
  };

  return (
    <Box sx={{
      p: { xs: 2, sm: 3 }, // Responsive padding
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 2, sm: 3 } }}>
          <OneBusLogo
            size={{ xs: 48, sm: 64 }} // Responsive logo size
          />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, // More responsive sizing
              fontWeight: 700,
              mb: 1,
              // Use gradient text only in light mode, solid color in dark mode
              ...(theme.palette.mode === 'light' ? {
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              } : {
                color: theme.palette.primary.main,
              }),
            }}
          >
            Dashboard
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }, // Responsive subtitle
              px: { xs: 1, sm: 0 }, // Add padding on mobile
            }}
          >
            Monitor your bus fleet operations in real-time
          </Typography>
        </Box>

        <Box sx={{
          mt: 2,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <ModernButton
            variant="primary"
            icon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' }, // Responsive button text
              px: { xs: 2, sm: 3 }, // Responsive padding
            }}
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </ModernButton>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && !stats && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Stats Cards */}
      {stats && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, sm: 3 }, // Responsive gap
            mb: { xs: 3, sm: 4 },
          }}
        >
          <StatsCard
            title="Total Routes"
            value={stats.totalRoutes?.toString() || '0'}
            icon={<RouteIcon />}
            color="primary"
            change={stats.routesChange}
            changeLabel="vs last month"
          />

          <StatsCard
            title="Total Buses"
            value={stats.totalBuses?.toString() || '0'}
            icon={<BusIcon />}
            color="secondary"
            change={stats.busesChange}
            changeLabel="vs last month"
          />

          <StatsCard
            title="Active Buses"
            value={stats.activeBuses?.toString() || '0'}
            icon={<ActiveIcon />}
            color="success"
            changeLabel="currently active"
          />

          <StatsCard
            title="Total Users"
            value={stats.totalUsers?.toString() || '0'}
            icon={<UsersIcon />}
            color="warning"
            change={stats.usersChange}
            changeLabel="vs last month"
          />
        </Box>
      )}

      {/* System Status */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '2fr 1fr',
          },
          gap: { xs: 2, sm: 3 }, // Responsive gap
        }}
      >
        <ModernCard
          title="System Status"
          variant="gradient"
          headerAction={
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'success.main'
            }} />
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: 'success.main'
            }} />
            <Box>
              <Typography variant="body1" fontWeight="600">
                All Systems Operational
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
        </ModernCard>

        <ModernCard
          title="Quick Actions"
          variant="elevated"
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ModernButton
              variant="primary"
              icon={<BusIcon />}
              fullWidth
            >
              Add New Bus
            </ModernButton>
            <ModernButton
              variant="outline"
              icon={<RouteIcon />}
              fullWidth
            >
              Create Route
            </ModernButton>
            <ModernButton
              variant="ghost"
              icon={<AddIcon />}
              fullWidth
              sx={{ px: 3, py: 1.5 }}
            >
              Manage Fleet
            </ModernButton>
          </Box>
        </ModernCard>
      </Box>
    </Box>
  );
};

export default SimpleDashboard;
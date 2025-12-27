import React from 'react';
import { 
  Box, 
  Typography, 
  useTheme,
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

const SimpleDashboard: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <OneBusLogo 
            size={64} 
            sx={{ boxShadow: designTokens.shadows.soft }}
          />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem' },
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
            sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
          >
            Monitor your bus fleet operations in real-time
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <ModernButton
            variant="primary"
            icon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </ModernButton>
        </Box>
      </Box>

      {/* Stats Cards */}
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
        <StatsCard
          title="Total Routes"
          value="12"
          icon={<RouteIcon />}
          color="primary"
          change={8}
          changeLabel="vs last month"
        />

        <StatsCard
          title="Total Buses"
          value="45"
          icon={<BusIcon />}
          color="secondary"
          change={12}
          changeLabel="vs last month"
        />

        <StatsCard
          title="Active Buses"
          value="32"
          icon={<ActiveIcon />}
          color="success"
          change={-3}
          changeLabel="vs yesterday"
        />

        <StatsCard
          title="Total Users"
          value="1,234"
          icon={<UsersIcon />}
          color="warning"
          change={25}
          changeLabel="vs last month"
        />
      </Box>

      {/* System Status */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '2fr 1fr',
          },
          gap: 3,
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
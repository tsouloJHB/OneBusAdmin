import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  alpha,
  Skeleton,
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { ModernCard } from './ModernCard';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  variant?: 'default' | 'gradient' | 'minimal';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  loading = false,
  variant = 'default',
  color = 'primary',
}) => {
  const theme = useTheme();

  const getColorValue = () => {
    switch (color) {
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getTrendIcon = () => {
    if (change === undefined) return null;
    
    if (change > 0) {
      return <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />;
    } else if (change < 0) {
      return <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />;
    } else {
      return <TrendingFlat sx={{ fontSize: 16, color: theme.palette.text.secondary }} />;
    }
  };

  const getTrendColor = () => {
    if (change === undefined) return theme.palette.text.secondary;
    return change > 0 ? theme.palette.success.main : 
           change < 0 ? theme.palette.error.main : 
           theme.palette.text.secondary;
  };

  const cardVariant = variant === 'gradient' ? 'gradient' : 'default';

  if (loading) {
    return (
      <ModernCard variant={cardVariant}>
        <Box sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="50%" height={16} />
        </Box>
      </ModernCard>
    );
  }

  return (
    <ModernCard 
      variant={cardVariant}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        ...(variant === 'minimal' && {
          boxShadow: 'none',
          border: `1px solid ${alpha(getColorValue(), 0.2)}`,
        }),
      }}
    >
      {/* Background decoration */}
      {variant !== 'minimal' && (
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(getColorValue(), 0.1)} 0%, ${alpha(getColorValue(), 0.05)} 100%)`,
            zIndex: 0,
          }}
        />
      )}

      <Box sx={{ position: 'relative', zIndex: 1, p: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '12px',
                backgroundColor: alpha(getColorValue(), 0.1),
                color: getColorValue(),
              }}
            >
              {icon && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    fontSize: 20,
                  }}
                >
                  {icon}
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Value */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>

        {/* Change indicator */}
        {(change !== undefined || changeLabel) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getTrendIcon()}
            <Typography
              variant="body2"
              sx={{
                color: getTrendColor(),
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            >
              {change !== undefined && (
                <>
                  {change > 0 ? '+' : ''}{change}%
                  {changeLabel && ' '}
                </>
              )}
              {changeLabel}
            </Typography>
          </Box>
        )}
      </Box>
    </ModernCard>
  );
};

export default StatsCard;
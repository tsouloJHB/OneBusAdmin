import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Typography,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { designTokens } from '../../theme';

interface ModernCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass' | 'elevated';
  hover?: boolean;
  onClick?: () => void;
  sx?: any;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  headerAction,
  variant = 'default',
  hover = true,
  onClick,
  sx = {},
}) => {
  const theme = useTheme();

  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: designTokens.borderRadius.md,
      transition: designTokens.transitions.medium,
      cursor: onClick ? 'pointer' : 'default',
    };

    switch (variant) {
      case 'gradient':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          '&:hover': hover ? {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
          } : {},
        };
      
      case 'glass':
        return {
          ...baseStyles,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          '&:hover': hover ? {
            transform: 'translateY(-2px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
          } : {},
        };
      
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          '&:hover': hover ? {
            transform: 'translateY(-6px)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 16px 48px rgba(0, 0, 0, 0.5)'
              : '0 8px 32px rgba(0, 0, 0, 0.15)',
          } : {},
        };
      
      default:
        return {
          ...baseStyles,
          '&:hover': hover ? {
            transform: 'translateY(-2px)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.4)'
              : '0 4px 20px rgba(0, 0, 0, 0.12)',
          } : {},
        };
    }
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        ...getCardStyles(),
        ...sx,
      }}
    >
      {(title || subtitle || headerAction) && (
        <CardHeader
          title={title && (
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          )}
          subheader={subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          action={headerAction || (
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <MoreVert />
            </IconButton>
          )}
          sx={{
            pb: title || subtitle ? 1 : 0,
          }}
        />
      )}
      
      <CardContent sx={{ pt: (title || subtitle) ? 0 : 2 }}>
        {children}
      </CardContent>
      
      {actions && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          {actions}
        </CardActions>
      )}
    </Card>
  );
};

export default ModernCard;
import React from 'react';
import {
  Button,
  ButtonProps,
  CircularProgress,
  useTheme,
  alpha,
  Box,
} from '@mui/material';
import { designTokens } from '../../theme';

interface ModernButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  variant = 'primary',
  loading = false,
  icon,
  iconPosition = 'start',
  children,
  disabled,
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  const renderIcon = () => {
    if (loading) {
      return (
        <CircularProgress
          size={16}
          sx={{
            color: 'inherit',
            mr: iconPosition === 'start' ? { xs: 0.5, sm: 1 } : 0,
            ml: iconPosition === 'end' ? { xs: 0.5, sm: 1 } : 0,
          }}
        />
      );
    }
    
    if (icon) {
      return (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            fontSize: { xs: 16, sm: 18 }, // Responsive icon size
            mr: iconPosition === 'start' ? { xs: 0.5, sm: 1 } : 0,
            ml: iconPosition === 'end' ? { xs: 0.5, sm: 1 } : 0,
          }}
        >
          {icon}
        </Box>
      );
    }
    
    return null;
  };

  // Simplified styling approach
  const getVariantProps = () => {
    switch (variant) {
      case 'primary':
        return {
          variant: 'contained' as const,
          color: 'primary' as const,
        };
      case 'secondary':
        return {
          variant: 'contained' as const,
          color: 'secondary' as const,
        };
      case 'outline':
        return {
          variant: 'outlined' as const,
          color: 'primary' as const,
        };
      case 'ghost':
        return {
          variant: 'text' as const,
          color: 'primary' as const,
        };
      case 'gradient':
        return {
          variant: 'contained' as const,
          color: 'primary' as const,
        };
      default:
        return {
          variant: 'contained' as const,
          color: 'primary' as const,
        };
    }
  };

  const variantProps = getVariantProps();

  return (
    <Button
      {...props}
      {...variantProps}
      disabled={disabled || loading}
      sx={{
        borderRadius: designTokens.borderRadius.md,
        padding: { xs: '10px 16px', sm: '12px 24px' }, // Responsive padding
        minHeight: { xs: '40px', sm: '44px' }, // Responsive height
        fontWeight: 500,
        textTransform: 'none',
        fontSize: { xs: '0.875rem', sm: '1rem' }, // Responsive font size
        transition: designTokens.transitions.medium,
        ...(variant === 'gradient' && {
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
          },
        }),
        '&:hover': {
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        ...sx,
      }}
    >
      {iconPosition === 'start' && renderIcon()}
      {children}
      {iconPosition === 'end' && renderIcon()}
    </Button>
  );
};

export default ModernButton;
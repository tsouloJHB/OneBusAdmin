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
            mr: iconPosition === 'start' ? 1 : 0,
            ml: iconPosition === 'end' ? 1 : 0,
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
            fontSize: 18,
            mr: iconPosition === 'start' ? 1 : 0,
            ml: iconPosition === 'end' ? 1 : 0,
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
        padding: '12px 24px',
        minHeight: '44px',
        fontWeight: 500,
        textTransform: 'none',
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
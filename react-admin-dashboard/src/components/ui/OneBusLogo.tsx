import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface OneBusLogoProps {
  size?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  variant?: 'default' | 'white' | 'gradient-bg';
  sx?: SxProps<Theme>;
}

export const OneBusLogo: React.FC<OneBusLogoProps> = ({
  size = 32,
  variant = 'default',
  sx = {},
}) => {
  // Handle responsive size
  const getResponsiveSize = () => {
    if (typeof size === 'number') {
      return size;
    }
    return size;
  };

  const responsiveSize = getResponsiveSize();

  const getLogoStyles = () => {
    const baseStyles = {
      height: responsiveSize,
      width: 'auto', // Let width adjust to maintain aspect ratio
      maxWidth: typeof responsiveSize === 'number' ? responsiveSize * 1.5 : 'none',
      borderRadius: 0.5,
      objectFit: 'contain' as const,
    };

    switch (variant) {
      case 'white':
        return {
          ...baseStyles,
          filter: 'brightness(0) invert(1)',
        };
      case 'gradient-bg':
        return {
          ...baseStyles,
          p: 1,
          background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
          borderRadius: 1,
          boxShadow: '0 4px 16px rgba(220, 0, 78, 0.12)',
        };
      default:
        return baseStyles;
    }
  };

  if (variant === 'gradient-bg') {
    return (
      <Box 
        sx={{ 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: responsiveSize,
          height: responsiveSize,
          background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
          borderRadius: 1,
          boxShadow: '0 4px 16px rgba(220, 0, 78, 0.12)',
          p: 1,
          ...sx 
        }}
      >
        <Box
          component="img"
          src="/redlogo.png"
          alt="OneBus Logo"
          sx={{
            height: '70%',
            width: 'auto',
            maxWidth: '70%',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src="/redlogo.png"
      alt="OneBus Logo"
      sx={{
        ...getLogoStyles(),
        ...sx,
      }}
    />
  );
};

export default OneBusLogo;
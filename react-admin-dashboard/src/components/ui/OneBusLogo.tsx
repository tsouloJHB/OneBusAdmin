import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface OneBusLogoProps {
  size?: number;
  variant?: 'default' | 'white' | 'gradient-bg';
  sx?: SxProps<Theme>;
}

export const OneBusLogo: React.FC<OneBusLogoProps> = ({
  size = 32,
  variant = 'default',
  sx = {},
}) => {
  const getLogoStyles = () => {
    const baseStyles = {
      height: size,
      width: 'auto', // Let width adjust to maintain aspect ratio
      maxWidth: size * 1.5, // Prevent it from getting too wide
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
          width: size,
          height: size,
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
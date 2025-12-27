import React from 'react';
import {
  IconButton,
  Tooltip,
  useTheme as useMuiTheme,
  Box,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  Brightness4,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'switch' | 'menu';
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  showLabel = false,
  size = 'medium',
}) => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  const getIcon = () => {
    switch (mode) {
      case 'light':
        return <LightMode />;
      case 'dark':
        return <DarkMode />;
      default:
        return <Brightness4 />;
    }
  };

  const getTooltipText = () => {
    return mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  };

  if (variant === 'switch') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: showLabel ? 1 : 0,
        }}
      >
        <LightMode
          sx={{
            color: mode === 'light' ? 'primary.main' : 'text.disabled',
            fontSize: size === 'small' ? 18 : 20,
          }}
        />
        <Switch
          checked={mode === 'dark'}
          onChange={toggleTheme}
          size={size === 'large' ? 'medium' : 'small'}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
              },
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: 'primary.main',
            },
          }}
        />
        <DarkMode
          sx={{
            color: mode === 'dark' ? 'primary.main' : 'text.disabled',
            fontSize: size === 'small' ? 18 : 20,
          }}
        />
        {showLabel && (
          <Typography variant="body2" sx={{ ml: 1 }}>
            {mode === 'light' ? 'Light' : 'Dark'} Mode
          </Typography>
        )}
      </Box>
    );
  }

  if (variant === 'menu') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={mode === 'dark'}
            onChange={toggleTheme}
            size="small"
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getIcon()}
            <Typography variant="body2">
              {mode === 'light' ? 'Light' : 'Dark'} Mode
            </Typography>
          </Box>
        }
        sx={{
          margin: 0,
          '& .MuiFormControlLabel-label': {
            display: 'flex',
            alignItems: 'center',
          },
        }}
      />
    );
  }

  // Default icon variant
  return (
    <Tooltip title={getTooltipText()} arrow>
      <IconButton
        onClick={toggleTheme}
        size={size}
        sx={{
          color: 'text.primary',
          transition: muiTheme.transitions.create(['transform', 'color'], {
            duration: muiTheme.transitions.duration.short,
          }),
          '&:hover': {
            transform: 'rotate(180deg)',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
          },
        }}
        aria-label={getTooltipText()}
      >
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
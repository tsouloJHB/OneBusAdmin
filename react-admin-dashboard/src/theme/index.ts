import { createTheme, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Design tokens for consistent spacing and sizing
export const designTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    round: 50,
  },
  shadows: {
    soft: '0 2px 8px rgba(220, 0, 78, 0.08)',
    medium: '0 4px 16px rgba(220, 0, 78, 0.12)',
    strong: '0 8px 32px rgba(220, 0, 78, 0.16)',
  },
  transitions: {
    fast: '0.15s ease-in-out',
    medium: '0.25s ease-in-out',
    slow: '0.35s ease-in-out',
  },
};

// Warm red-based color palette
const colorPalette = {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Warm orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef', // Purple accent
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

// Typography configuration with modern, rounded fonts
const typography = {
  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none' as const,
    letterSpacing: '0.01em',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    fontWeight: 400,
  },
};

// Light theme configuration
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light' as PaletteMode,
    primary: {
      main: colorPalette.primary[500],
      light: colorPalette.primary[400],
      dark: colorPalette.primary[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colorPalette.secondary[500],
      light: colorPalette.secondary[400],
      dark: colorPalette.secondary[600],
      contrastText: '#ffffff',
    },
    error: {
      main: colorPalette.primary[500],
      light: colorPalette.primary[400],
      dark: colorPalette.primary[600],
    },
    warning: {
      main: colorPalette.secondary[500],
      light: colorPalette.secondary[400],
      dark: colorPalette.secondary[600],
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: colorPalette.neutral[900],
      secondary: colorPalette.neutral[600],
      disabled: colorPalette.neutral[400],
    },
    divider: colorPalette.neutral[200],
    grey: {
      50: colorPalette.neutral[50],
      100: colorPalette.neutral[100],
      200: colorPalette.neutral[200],
      300: colorPalette.neutral[300],
      400: colorPalette.neutral[400],
      500: colorPalette.neutral[500],
      600: colorPalette.neutral[600],
      700: colorPalette.neutral[700],
      800: colorPalette.neutral[800],
      900: colorPalette.neutral[900],
    },
  },
  typography,
  shape: {
    borderRadius: designTokens.borderRadius.md,
  },
};

// Dark theme configuration
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark' as PaletteMode,
    primary: {
      main: colorPalette.primary[400],
      light: colorPalette.primary[300],
      dark: colorPalette.primary[500],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colorPalette.secondary[400],
      light: colorPalette.secondary[300],
      dark: colorPalette.secondary[500],
      contrastText: '#ffffff',
    },
    error: {
      main: colorPalette.primary[400],
      light: colorPalette.primary[300],
      dark: colorPalette.primary[500],
    },
    warning: {
      main: colorPalette.secondary[400],
      light: colorPalette.secondary[300],
      dark: colorPalette.secondary[500],
    },
    success: {
      main: '#34d399',
      light: '#6ee7b7',
      dark: '#10b981',
    },
    background: {
      default: '#0f0f0f',
      paper: '#1a1a1a',
    },
    text: {
      primary: colorPalette.neutral[50],    // #fafafa - very light
      secondary: colorPalette.neutral[200], // #e5e5e5 - lighter than before
      disabled: colorPalette.neutral[400],  // #a3a3a3 - medium gray
    },
    divider: colorPalette.neutral[700],
    grey: {
      50: colorPalette.neutral[800],   // Dark equivalent of grey.50
      100: colorPalette.neutral[700],  // Dark equivalent of grey.100
      200: colorPalette.neutral[600],  // Dark equivalent of grey.200
      300: colorPalette.neutral[500],  // Dark equivalent of grey.300
      400: colorPalette.neutral[400],  // Keep as is
      500: colorPalette.neutral[300],  // Lighter for dark mode
      600: colorPalette.neutral[200],  // Much lighter for dark mode
      700: colorPalette.neutral[100],  // Very light for dark mode
      800: colorPalette.neutral[50],   // Almost white for dark mode
      900: colorPalette.neutral[50],   // White for dark mode
    },
  },
  typography,
  shape: {
    borderRadius: designTokens.borderRadius.md,
  },
};

// Enhanced component overrides
const getComponentOverrides = (mode: PaletteMode) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        scrollbarColor: mode === 'dark' ? '#404040 #1a1a1a' : '#d4d4d4 #f5f5f5',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
        },
        '&::-webkit-scrollbar-thumb': {
          background: mode === 'dark' ? '#404040' : '#d4d4d4',
          borderRadius: '4px',
          '&:hover': {
            background: mode === 'dark' ? '#525252' : '#a3a3a3',
          },
        },
        '& *:focus-visible': {
          outline: `2px solid ${colorPalette.primary[mode === 'dark' ? 400 : 500]}`,
          outlineOffset: '2px',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: designTokens.borderRadius.md,
        padding: '12px 24px',
        minHeight: '44px',
        fontWeight: 500,
        textTransform: 'none' as const,
        boxShadow: 'none',
        transition: designTokens.transitions.medium,
        '&:hover': {
          boxShadow: designTokens.shadows.soft,
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      contained: {
        background: `linear-gradient(135deg, ${colorPalette.primary[500]} 0%, ${colorPalette.primary[600]} 100%)`,
        '&:hover': {
          background: `linear-gradient(135deg, ${colorPalette.primary[600]} 0%, ${colorPalette.primary[700]} 100%)`,
          boxShadow: designTokens.shadows.medium,
        },
      },
      outlined: {
        borderWidth: '2px',
        '&:hover': {
          borderWidth: '2px',
          backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: designTokens.borderRadius.md,
        boxShadow: mode === 'dark' ? 
          '0 4px 16px rgba(0, 0, 0, 0.3)' : 
          '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: mode === 'dark' ? '1px solid #262626' : 'none',
        transition: designTokens.transitions.medium,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: mode === 'dark' ? 
            '0 8px 32px rgba(0, 0, 0, 0.4)' : 
            '0 4px 20px rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: designTokens.borderRadius.md,
          transition: designTokens.transitions.medium,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colorPalette.primary[mode === 'dark' ? 400 : 500],
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px',
            borderColor: colorPalette.primary[mode === 'dark' ? 400 : 500],
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: designTokens.borderRadius.round,
        fontWeight: 500,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: designTokens.borderRadius.md,
        backgroundImage: 'none',
      },
      elevation1: {
        boxShadow: mode === 'dark' ? 
          '0 2px 8px rgba(0, 0, 0, 0.3)' : 
          '0 1px 6px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
        borderBottom: `1px solid ${mode === 'dark' ? '#262626' : '#e5e5e5'}`,
        backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: `1px solid ${mode === 'dark' ? '#262626' : '#e5e5e5'}`,
        backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: designTokens.borderRadius.md,
        margin: '4px 8px',
        transition: designTokens.transitions.medium,
        '&:hover': {
          backgroundColor: mode === 'dark' ? 
            'rgba(239, 68, 68, 0.08)' : 
            'rgba(239, 68, 68, 0.04)',
        },
        '&.Mui-selected': {
          backgroundColor: mode === 'dark' ? 
            'rgba(239, 68, 68, 0.12)' : 
            'rgba(239, 68, 68, 0.08)',
          '&:hover': {
            backgroundColor: mode === 'dark' ? 
              'rgba(239, 68, 68, 0.16)' : 
              'rgba(239, 68, 68, 0.12)',
          },
        },
      },
    },
  },
});

// Create themes
export const createAppTheme = (mode: PaletteMode) => {
  const baseOptions = mode === 'light' ? lightThemeOptions : darkThemeOptions;
  
  return createTheme({
    ...baseOptions,
    components: getComponentOverrides(mode),
  });
};

export { colorPalette };
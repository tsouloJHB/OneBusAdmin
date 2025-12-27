import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  CssBaseline,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { OneBusLogo } from '../ui';
import { Sidebar } from './Sidebar';
import { designTokens } from '../../theme';

interface AppLayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_TABLET = 240;

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const { user, logout } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Could add notification here in the future
    }
  };

  // Focus management for mobile drawer
  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile, mobileOpen]);

  const isUserMenuOpen = Boolean(anchorEl);
  const currentDrawerWidth = isTablet ? DRAWER_WIDTH_TABLET : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { 
            md: `calc(100% - ${currentDrawerWidth}px)`,
            lg: `calc(100% - ${DRAWER_WIDTH}px)` 
          },
          ml: { 
            md: `${currentDrawerWidth}px`,
            lg: `${DRAWER_WIDTH}px` 
          },
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(10px)',
          background: alpha(theme.palette.background.paper, 0.95),
        }}
        role="banner"
      >
        <Toolbar sx={{ 
          minHeight: { xs: 64, sm: 72 },
          px: { xs: 2, sm: 3 },
        }}>
          <IconButton
            color="inherit"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              minWidth: 44,
              minHeight: 44,
              borderRadius: designTokens.borderRadius.md,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <OneBusLogo size={36} />
          </Box>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThemeToggle variant="icon" size="medium" />
            
            <Typography 
              variant="body2" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
                mr: 1,
              }}
            >
              Welcome, {user?.username}
            </Typography>
            
            <IconButton
              size="large"
              aria-label={`Account menu for ${user?.username || 'current user'}`}
              aria-controls={isUserMenuOpen ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isUserMenuOpen}
              onClick={handleUserMenuOpen}
              sx={{
                minWidth: 44,
                minHeight: 44,
                borderRadius: designTokens.borderRadius.md,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Avatar 
                sx={{ 
                  width: { xs: 32, sm: 36 }, 
                  height: { xs: 32, sm: 36 },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  fontWeight: 600,
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || <AccountCircle />}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={isUserMenuOpen}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        MenuListProps={{
          'aria-labelledby': 'user-menu-button',
          role: 'menu',
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 4px 16px rgba(0,0,0,0.1))',
            mt: 1.5,
            minWidth: 220,
            borderRadius: designTokens.borderRadius.lg,
            border: `1px solid ${theme.palette.divider}`,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              border: `1px solid ${theme.palette.divider}`,
              borderBottom: 'none',
              borderRight: 'none',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={handleUserMenuClose}
          role="menuitem"
          sx={{ 
            minHeight: 56,
            borderRadius: designTokens.borderRadius.md,
            mx: 1,
            my: 0.5,
          }}
        >
          <Avatar 
            sx={{ 
              mr: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="600">
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider sx={{ mx: 1 }} />
        
        <MenuItem 
          onClick={handleUserMenuClose}
          role="menuitem"
          sx={{ 
            minHeight: 48,
            borderRadius: designTokens.borderRadius.md,
            mx: 1,
            my: 0.5,
          }}
        >
          <Settings fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} />
          Settings
        </MenuItem>
        
        <MenuItem 
          onClick={handleLogout}
          role="menuitem"
          sx={{ 
            minHeight: 48,
            borderRadius: designTokens.borderRadius.md,
            mx: 1,
            my: 0.5,
            color: 'error.main',
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <Logout fontSize="small" sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Sidebar Navigation */}
      <Sidebar
        drawerWidth={currentDrawerWidth}
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box
        component="main"
        ref={mainContentRef}
        id="main-content"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { 
            md: `calc(100% - ${currentDrawerWidth}px)`,
            lg: `calc(100% - ${DRAWER_WIDTH}px)` 
          },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          transition: theme.transitions.create(['background-color'], {
            duration: theme.transitions.duration.standard,
          }),
        }}
        role="main"
        aria-label="Main content"
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }} /> {/* Spacer for fixed AppBar */}
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
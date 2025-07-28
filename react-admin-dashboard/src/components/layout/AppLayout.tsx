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
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';

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
        }}
        role="banner"
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
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
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="h1" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Bus Admin Dashboard
          </Typography>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            <Typography 
              variant="body2" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                fontSize: { sm: '0.75rem', md: '0.875rem' },
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
              color="inherit"
              sx={{
                minWidth: 44,
                minHeight: 44,
              }}
            >
              <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
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
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 200,
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
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={handleUserMenuClose}
          role="menuitem"
          sx={{ minHeight: 48 }}
        >
          <Avatar sx={{ mr: 2 }}>
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={handleUserMenuClose}
          role="menuitem"
          sx={{ minHeight: 48 }}
        >
          <Settings fontSize="small" sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        
        <MenuItem 
          onClick={handleLogout}
          role="menuitem"
          sx={{ minHeight: 48 }}
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
          backgroundColor: 'grey.50',
        }}
        role="main"
        aria-label="Main content"
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;
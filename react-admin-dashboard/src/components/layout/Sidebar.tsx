import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  Route as RouteIcon,
  DirectionsBus,
  TrackChanges,
  Settings,
} from '@mui/icons-material';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactElement;
  description?: string;
}

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
  isMobile: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: <Dashboard />,
    description: 'Overview and statistics',
  },
  {
    id: 'routes',
    label: 'Routes',
    path: '/routes',
    icon: <RouteIcon />,
    description: 'Manage bus routes',
  },
  {
    id: 'buses',
    label: 'Buses',
    path: '/buses',
    icon: <DirectionsBus />,
    description: 'Manage bus fleet',
  },
  {
    id: 'active-buses',
    label: 'Active Buses',
    path: '/active-buses',
    icon: <TrackChanges />,
    description: 'Monitor active buses',
  },
];

const secondaryItems: NavigationItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: <Settings />,
    description: 'Application settings',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  drawerWidth,
  mobileOpen,
  onMobileClose,
  isMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onMobileClose();
    }
  };

  const isActiveRoute = (path: string): boolean => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const renderNavigationItems = (items: NavigationItem[], showDivider = false) => (
    <>
      {showDivider && <Divider sx={{ my: 1 }} role="separator" />}
      <List role="list">
        {items.map((item) => {
          const isActive = isActiveRoute(item.path);
          
          return (
            <ListItem key={item.id} disablePadding role="listitem">
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                role="button"
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}. ${item.description}`}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  minHeight: 48, // Minimum touch target size
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.contrastText,
                    },
                  },
                  '&:hover': {
                    backgroundColor: isActive 
                      ? theme.palette.primary.dark 
                      : theme.palette.action.hover,
                  },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: theme.palette.primary.main,
                    outlineOffset: '2px',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive 
                      ? theme.palette.primary.contrastText 
                      : theme.palette.text.secondary,
                    minWidth: isTablet ? 36 : 40,
                  }}
                  aria-hidden="true"
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={!isTablet ? item.description : undefined}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: isTablet ? '0.8125rem' : '0.875rem',
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: isActive 
                      ? theme.palette.primary.contrastText 
                      : theme.palette.text.secondary,
                    sx: { opacity: 0.8 },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  const drawerContent = (
    <Box 
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header */}
      <Box sx={{ p: { xs: 1.5, md: 2 }, borderBottom: 1, borderColor: 'divider' }}>
        <Typography 
          variant="h6" 
          component="div" 
          fontWeight="bold"
          sx={{ fontSize: isTablet ? '1rem' : '1.25rem' }}
        >
          Bus Management
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: isTablet ? '0.75rem' : '0.875rem' }}
        >
          Admin Dashboard
        </Typography>
      </Box>

      {/* Navigation Items */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          '&:focus-within': {
            outline: 'none',
          },
        }}
        role="navigation"
        aria-label="Primary navigation"
      >
        {renderNavigationItems(navigationItems)}
        {renderNavigationItems(secondaryItems, true)}
      </Box>

      {/* Footer */}
      <Box sx={{ p: { xs: 1.5, md: 2 }, borderTop: 1, borderColor: 'divider' }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center" 
          display="block"
          sx={{ fontSize: isTablet ? '0.6875rem' : '0.75rem' }}
        >
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="navigation menu"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
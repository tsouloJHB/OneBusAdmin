import React, { useState } from 'react';
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
  alpha,
  Collapse,
} from '@mui/material';
import {
  Dashboard,
  Route as RouteIcon,
  DirectionsBus,
  TrackChanges,
  Sensors,
  Settings,
  Business,
  ExpandLess,
  ExpandMore,
  Person as PersonIcon,
} from '@mui/icons-material';
import { designTokens } from '../../theme';
import { OneBusLogo } from '../ui';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactElement;
  description?: string;
  children?: NavigationItem[]; // Support nested items
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
    id: 'companies',
    label: 'Companies',
    path: '/companies-menu',
    icon: <Business />,
    description: 'Manage companies and buses',
    children: [
      {
        id: 'company-management',
        label: 'Company Management',
        path: '/companies',
        icon: <Business />,
        description: 'Manage bus companies',
      },
      {
        id: 'buses',
        label: 'Buses',
        path: '/buses',
        icon: <DirectionsBus />,
        description: 'Manage bus fleet',
      },
    ],
  },
  {
    id: 'active-buses',
    label: 'Active Buses',
    path: '/active-buses',
    icon: <TrackChanges />,
    description: 'Monitor active buses',
  },
  {
    id: 'trackers',
    label: 'Trackers',
    path: '/trackers',
    icon: <Sensors />,
    description: 'Manage GPS trackers',
  },
  {
    id: 'drivers',
    label: 'Drivers',
    path: '/drivers',
    icon: <PersonIcon />,
    description: 'Manage bus drivers',
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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const handleToggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

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

  const renderNavigationItems = (items: NavigationItem[], showDivider = false, isNested = false) => (
    <>
      {showDivider && <Divider sx={{ my: 1 }} role="separator" />}
      <List role="list">
        {items.map((item) => {
          const isActive = isActiveRoute(item.path);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems[item.id] || false;
          
          return (
            <React.Fragment key={item.id}>
              <ListItem disablePadding role="listitem">
                <ListItemButton
                  onClick={() => {
                    if (hasChildren) {
                      handleToggleExpand(item.id);
                    } else {
                      handleNavigation(item.path);
                    }
                  }}
                  selected={isActive && !hasChildren}
                  role="button"
                  aria-current={isActive && !hasChildren ? 'page' : undefined}
                  aria-label={`Navigate to ${item.label}. ${item.description}`}
                  aria-expanded={hasChildren ? isExpanded : undefined}
                  sx={{
                    mx: 1,
                    ml: isNested ? 3 : 1,
                    borderRadius: designTokens.borderRadius.md,
                    minHeight: 48, // Minimum touch target size
                    transition: designTokens.transitions.medium,
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.16),
                      },
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.main,
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3,
                        height: '60%',
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: '0 2px 2px 0',
                      },
                    },
                    '&:hover': {
                      backgroundColor: isActive && !hasChildren
                        ? alpha(theme.palette.primary.main, 0.16)
                        : alpha(theme.palette.text.primary, 0.04),
                      transform: 'translateX(2px)',
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: theme.palette.primary.main,
                      outlineOffset: '2px',
                    },
                    position: 'relative',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: theme.palette.primary.main, // Always red
                      minWidth: isTablet ? 36 : 40,
                      transition: designTokens.transitions.medium,
                      opacity: (isActive && !hasChildren) ? 1 : 0.8, // Slightly transparent when not active
                    }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={!isTablet ? item.description : undefined}
                    primaryTypographyProps={{
                      fontWeight: (isActive && !hasChildren) ? 600 : 500,
                      fontSize: isTablet ? '0.8125rem' : '0.875rem',
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem',
                      color: theme.palette.text.secondary,
                      sx: { opacity: 0.8 },
                    }}
                  />
                  {hasChildren && (
                    isExpanded ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>
              
              {hasChildren && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  {renderNavigationItems(item.children!, false, true)}
                </Collapse>
              )}
            </React.Fragment>
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
      <Box sx={{ 
        p: { xs: 2, md: 3 }, 
        borderBottom: 1, 
        borderColor: 'divider',
        background: alpha(theme.palette.primary.main, 0.02),
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <OneBusLogo size={40} />
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: isTablet ? '0.75rem' : '0.875rem',
            fontWeight: 500,
            textAlign: 'center',
          }}
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
      <Box sx={{ 
        p: { xs: 2, md: 3 }, 
        borderTop: 1, 
        borderColor: 'divider',
        background: alpha(theme.palette.background.paper, 0.5),
      }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          align="center" 
          display="block"
          sx={{ 
            fontSize: isTablet ? '0.6875rem' : '0.75rem',
            fontWeight: 500,
          }}
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
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { RouteTable, RouteForm, FullRouteTable, FullRouteViewer, FullRouteForm } from '../features';
import routeService from '../../services/routeService';
import fullRouteService from '../../services/fullRouteService';
import { busCompanyService } from '../../services/busCompanyService';
import { Route, RouteFilters, CreateRouteRequest, UpdateRouteRequest, ApiError, FullRoute, CreateFullRouteRequest, UpdateFullRouteRequest } from '../../types';
import { BusCompany } from '../../types/busCompany';
import { useNotification } from '../../contexts';

const RoutesPage: React.FC = () => {
  // Notification
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  // Company selection state
  const [companies, setCompanies] = useState<BusCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<BusCompany | null>(null);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  
  // State management
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Full routes state
  const [routeViewMode, setRouteViewMode] = useState<'stops' | 'full'>('stops');
  const [fullRoutes, setFullRoutes] = useState<FullRoute[]>([]);
  const [fullRoutesLoading, setFullRoutesLoading] = useState(false);
  const [fullRoutesError, setFullRoutesError] = useState<ApiError | null>(null);
  const [selectedFullRoute, setSelectedFullRoute] = useState<FullRoute | null>(null);
  const [fullViewerOpen, setFullViewerOpen] = useState(false);
  const [fullFormOpen, setFullFormOpen] = useState(false);
  const [editingFullRoute, setEditingFullRoute] = useState<FullRoute | undefined>(undefined);
  const [fullFormLoading, setFullFormLoading] = useState(false);
  const [deleteFullDialogOpen, setDeleteFullDialogOpen] = useState(false);
  const [fullRouteToDelete, setFullRouteToDelete] = useState<number | null>(null);
  
  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  

  
  // Filters state
  const [filters, setFilters] = useState<RouteFilters>({
    search: '',
    isActive: undefined,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Load companies on component mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Load companies data
  const loadCompanies = useCallback(async () => {
    try {
      setCompaniesLoading(true);
      setCompaniesError(null);
      const companiesData = await busCompanyService.getAllCompanies();
      setCompanies(companiesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load companies';
      setCompaniesError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setCompaniesLoading(false);
    }
  }, [showNotification]);

  // Load routes data (only when company is selected)
  const loadRoutes = useCallback(async () => {
    if (!selectedCompany) {
      setRoutes([]);
      setTotalCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add company filter to the request
      const companyFilters = {
        ...filters,
        company: selectedCompany.name, // Filter by company name
      };
      
      const response = await routeService.getRoutes(companyFilters, page + 1, pageSize);
      setRoutes(response.data);
      setTotalCount(response.pagination.total);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      const errorMessage = apiError?.message || 'Failed to load routes';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCompany, filters, page, pageSize, showNotification]);

  // Load full routes (only when company is selected)
  const loadFullRoutes = useCallback(async () => {
    if (!selectedCompany) {
      setFullRoutes([]);
      return;
    }

    try {
      setFullRoutesLoading(true);
      setFullRoutesError(null);
      const data = await fullRouteService.getFullRoutes({ companyId: selectedCompany.id });
      setFullRoutes(data);
    } catch (err) {
      const apiError = err as ApiError;
      setFullRoutesError(apiError);
      const errorMessage = apiError?.message || 'Failed to load full routes';
      showNotification(errorMessage, 'error');
    } finally {
      setFullRoutesLoading(false);
    }
  }, [selectedCompany, showNotification]);

  // Load routes/full routes based on view mode
  useEffect(() => {
    if (routeViewMode === 'stops') {
      loadRoutes();
    } else {
      loadFullRoutes();
    }
  }, [routeViewMode, loadRoutes, loadFullRoutes]);

  // Handle company selection
  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    setSelectedCompany(company || null);
    setPage(0); // Reset to first page when changing company
    // Clear any existing filters when changing company
    setFilters({
      search: '',
      isActive: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    });
    // Default back to stops routes when switching companies
    setRouteViewMode('stops');
  };
  // Search and filter handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: event.target.value }));
    setPage(0); // Reset to first page when searching
  };

  const handleActiveFilterChange = (value: boolean | undefined) => {
    setFilters(prev => ({ ...prev, isActive: value }));
    setPage(0); // Reset to first page when filtering
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ 
      ...prev, 
      sortBy: sortBy as 'name' | 'createdAt' | 'updatedAt', 
      sortOrder 
    }));
  };

  // CRUD operation handlers
  const handleAddRoute = () => {
    if (!selectedCompany) {
      showNotification('Please select a company first', 'warning');
      return;
    }
    setSelectedRoute(undefined);
    setFormOpen(true);
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setFormOpen(true);
  };

  const handleDeleteRoute = (routeId: number) => {
    setRouteToDelete(routeId.toString());
    setDeleteDialogOpen(true);
  };

  const handleMapView = (route: Route) => {
    navigate(`/routes/${route.id}/map`);
  };





  const handleFormSubmit = async (data: CreateRouteRequest | UpdateRouteRequest) => {
    try {
      setFormLoading(true);
      
      if (selectedRoute) {
        // Update existing route
        await routeService.updateRoute(selectedRoute.id, data as UpdateRouteRequest);
        showNotification('Route updated successfully', 'success');
      } else {
        // Create new route
        await routeService.createRoute(data as CreateRouteRequest);
        showNotification('Route created successfully', 'success');
      }
      
      setFormOpen(false);
      await loadRoutes(); // Reload the routes list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save route';
      throw new Error(errorMessage); // Let the form handle the error display
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!routeToDelete) return;
    
    try {
      setDeleteLoading(true);
      await routeService.deleteRoute(routeToDelete);
      showNotification('Route deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setRouteToDelete(null);
      await loadRoutes(); // Reload the routes list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete route';
      showNotification(errorMessage, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRouteToDelete(null);
  };

  const handleFullRouteView = (route: FullRoute) => {
    setSelectedFullRoute(route);
    setFullViewerOpen(true);
  };

  const handleFullRouteViewerClose = () => {
    setFullViewerOpen(false);
    setSelectedFullRoute(null);
  };

  const handleAddFullRoute = () => {
    if (!selectedCompany) {
      showNotification('Please select a company first', 'warning');
      return;
    }
    setEditingFullRoute(undefined);
    setFullFormOpen(true);
  };

  const handleEditFullRoute = (route: FullRoute) => {
    setEditingFullRoute(route);
    setFullFormOpen(true);
  };

  const handleDeleteFullRoute = (routeId: number) => {
    setFullRouteToDelete(routeId);
    setDeleteFullDialogOpen(true);
  };

  const handleFullRouteMapView = (route: FullRoute) => {
    navigate(`/full-routes/${route.id}/map`);
  };

  const handleFullFormSubmit = async (data: CreateFullRouteRequest | UpdateFullRouteRequest) => {
    try {
      setFullFormLoading(true);
      
      if (editingFullRoute) {
        // Update existing full route
        await fullRouteService.updateFullRoute(editingFullRoute.id, data as UpdateFullRouteRequest);
        showNotification('Full route updated successfully', 'success');
      } else {
        // Create new full route
        await fullRouteService.createFullRoute(data as CreateFullRouteRequest);
        showNotification('Full route created successfully', 'success');
      }
      
      setFullFormOpen(false);
      await loadFullRoutes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save full route';
      showNotification(errorMessage, 'error');
      throw new Error(errorMessage);
    } finally {
      setFullFormLoading(false);
    }
  };

  const handleConfirmDeleteFullRoute = async () => {
    if (!fullRouteToDelete) return;
    
    try {
      setFullFormLoading(true);
      await fullRouteService.deleteFullRoute(fullRouteToDelete);
      showNotification('Full route deleted successfully', 'success');
      setDeleteFullDialogOpen(false);
      setFullRouteToDelete(null);
      await loadFullRoutes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete full route';
      showNotification(errorMessage, 'error');
    } finally {
      setFullFormLoading(false);
    }
  };

  const handleCancelDeleteFullRoute = () => {
    setDeleteFullDialogOpen(false);
    setFullRouteToDelete(null);
  };

  const handleFullFormClose = () => {
    if (!fullFormLoading) {
      setFullFormOpen(false);
      setEditingFullRoute(undefined);
    }
  };

  const handleFormClose = () => {
    if (!formLoading) {
      setFormOpen(false);
      setSelectedRoute(undefined);
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, // Responsive padding
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        mb: 3 
      }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }, // Responsive title
              mb: 1,
            }}
          >
            Routes Management
          </Typography>
          {selectedCompany && (
            <Typography variant="body1" color="text.secondary">
              Managing routes for {selectedCompany.name}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={routeViewMode === 'stops' ? handleAddRoute : handleAddFullRoute}
          disabled={loading || fullRoutesLoading || !selectedCompany}
          sx={{
            minWidth: { xs: '100%', sm: 'auto' }, // Full width on mobile
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {routeViewMode === 'stops' ? 'Add Route' : 'Add Full Route'}
        </Button>
      </Box>

      {/* Company Selection */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 300 } }}>
          <InputLabel>Select Company</InputLabel>
          <Select
            value={selectedCompany?.id || ''}
            label="Select Company"
            onChange={(e) => handleCompanyChange(e.target.value)}
            disabled={companiesLoading}
            startAdornment={
              <InputAdornment position="start">
                <BusinessIcon />
              </InputAdornment>
            }
          >
            <MenuItem value="">
              <em>Choose a company...</em>
            </MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>{company.name}</Typography>
                  <Chip
                    label={company.status}
                    size="small"
                    color={company.status === 'active' ? 'success' : 'default'}
                    sx={{ ml: 1 }}
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {companiesLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Loading companies...
            </Typography>
          </Box>
        )}
        
        {companiesError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {companiesError}
            <Button size="small" onClick={loadCompanies} sx={{ ml: 1 }}>
              Retry
            </Button>
          </Alert>
        )}
        
        {!selectedCompany && !companiesLoading && !companiesError && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Please select a company to view and manage their routes.
          </Alert>
        )}
      </Box>

      {/* Filters - Only show when company is selected */}
      {selectedCompany && (
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          mb: 3, 
          flexWrap: 'wrap',
          flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile
        }}>
          <FormControl sx={{ minWidth: { xs: '100%', sm: 180 } }}>
            <InputLabel size="small">Route Data</InputLabel>
            <Select
              size="small"
              value={routeViewMode}
              label="Route Data"
              onChange={(e) => setRouteViewMode(e.target.value as 'stops' | 'full')}
            >
              <MenuItem value="stops">Stops Routes</MenuItem>
              <MenuItem value="full">Full Routes</MenuItem>
            </Select>
          </FormControl>

          <TextField
            placeholder="Search routes..."
            value={filters.search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: { xs: '100%', sm: 250 }, // Full width on mobile
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
            size="small" // Smaller input on mobile
          />
          
          <FormControl sx={{ 
            minWidth: { xs: '100%', sm: 150 }, // Full width on mobile
          }}>
            <InputLabel size="small">Status</InputLabel>
            <Select
              value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
              label="Status"
              size="small" // Smaller select on mobile
              onChange={(e) => {
                const value = e.target.value;
                handleActiveFilterChange(
                  value === 'all' ? undefined : value === 'active'
                );
              }}
            >
              <MenuItem value="all">All Routes</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="inactive">Inactive Only</MenuItem>
            </Select>
          </FormControl>
          
          {(filters.search || filters.isActive !== undefined) && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              width: { xs: '100%', sm: 'auto' }, // Full width on mobile
              flexWrap: 'wrap',
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Filters:
              </Typography>
              {filters.search && (
                <Chip
                  label={`Search: "${filters.search}"`}
                  onDelete={() => setFilters(prev => ({ ...prev, search: '' }))}
                  size="small"
                />
              )}
              {filters.isActive !== undefined && (
                <Chip
                  label={`Status: ${filters.isActive ? 'Active' : 'Inactive'}`}
                  onDelete={() => setFilters(prev => ({ ...prev, isActive: undefined }))}
                  size="small"
                />
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Routes / Full Routes Table - Only show when company is selected */}
      {selectedCompany && routeViewMode === 'stops' && (
        <RouteTable
          routes={routes}
          loading={loading}
          error={error}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          filters={filters}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSortChange={handleSortChange}
          onEdit={handleEditRoute}
          onDelete={handleDeleteRoute}
          onMapView={handleMapView}
        />
      )}

      {selectedCompany && routeViewMode === 'full' && (
        <FullRouteTable
          fullRoutes={fullRoutes}
          loading={fullRoutesLoading}
          error={fullRoutesError}
          onView={handleFullRouteView}
          onEdit={handleEditFullRoute}
          onDelete={handleDeleteFullRoute}
          onMapView={handleFullRouteMapView}
          onRetry={loadFullRoutes}
        />
      )}

      {/* Route Form Dialog */}
      <RouteForm
        route={selectedRoute}
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this route? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full Route Viewer */}
      <FullRouteViewer
        open={fullViewerOpen}
        onClose={handleFullRouteViewerClose}
        route={selectedFullRoute}
      />

      {/* Full Route Form Dialog */}
      {selectedCompany && (
        <FullRouteForm
          open={fullFormOpen}
          onClose={handleFullFormClose}
          onSave={handleFullFormSubmit}
          route={editingFullRoute}
          companyId={parseInt(selectedCompany.id)}
          routeId={0} // You can make this dynamic if needed
        />
      )}

      {/* Full Route Delete Confirmation Dialog */}
      <Dialog
        open={deleteFullDialogOpen}
        onClose={handleCancelDeleteFullRoute}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete Full Route</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this full route? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeleteFullRoute} disabled={fullFormLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteFullRoute}
            color="error"
            variant="contained"
            disabled={fullFormLoading}
          >
            {fullFormLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
};

export default RoutesPage;
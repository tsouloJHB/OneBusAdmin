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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { RouteTable, RouteForm } from '../features';
import { routeService } from '../../services/routeService';
import { Route, RouteFilters, CreateRouteRequest, UpdateRouteRequest, ApiError } from '../../types';
import { useNotification } from '../../contexts';

const RoutesPage: React.FC = () => {
  // Navigation and notification
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // State management
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
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

  // Load routes data
  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await routeService.getRoutes(filters, page + 1, pageSize);
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
  }, [filters, page, pageSize, showNotification]);

  // Load routes on component mount and when dependencies change
  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

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
    setSelectedRoute(undefined);
    setFormOpen(true);
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setFormOpen(true);
  };

  const handleDeleteRoute = (routeId: string) => {
    setRouteToDelete(routeId);
    setDeleteDialogOpen(true);
  };

  const handleViewMap = (route: Route) => {
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

  const handleFormClose = () => {
    if (!formLoading) {
      setFormOpen(false);
      setSelectedRoute(undefined);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Routes Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRoute}
          disabled={loading}
        >
          Add Route
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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
          sx={{ minWidth: 250 }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
            label="Status"
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
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

      {/* Routes Table */}
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
        onViewMap={handleViewMap}
      />

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



    </Box>
  );
};

export default RoutesPage;
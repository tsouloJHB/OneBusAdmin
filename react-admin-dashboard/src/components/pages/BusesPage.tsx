import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  DirectionsBus as BusIcon,
} from '@mui/icons-material';
import { BusTable, BusForm } from '../features';
import { busService } from '../../services/busService';
import { Bus, BusFilters, CreateBusRequest, UpdateBusRequest, ApiError } from '../../types';
import { useNotification } from '../../contexts';

const BusesPage: React.FC = () => {
  // Global notification system
  const { showNotification } = useNotification();
  
  // State management
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [busToDelete, setBusToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<BusFilters>({
    search: '',
    status: undefined,
    assignedRouteId: undefined,
    sortBy: 'busNumber',
    sortOrder: 'asc',
  });

  // Load buses data
  const loadBuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await busService.getBuses(filters, page + 1, pageSize);
      setBuses(response.data);
      setTotalCount(response.pagination.total);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      const errorMessage = apiError?.message || 'Failed to load buses';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]); // Removed showNotification from dependencies

  // Load buses on component mount and when dependencies change
  useEffect(() => {
    loadBuses();
  }, [loadBuses]);

  // Search and filter handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: event.target.value }));
    setPage(0); // Reset to first page when searching
  };

  const handleStatusFilterChange = (value: Bus['status'] | undefined) => {
    setFilters(prev => ({ ...prev, status: value }));
    setPage(0); // Reset to first page when filtering
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ 
      ...prev, 
      sortBy: sortBy as 'busNumber' | 'capacity' | 'createdAt', 
      sortOrder 
    }));
  };

  // CRUD operation handlers
  const handleAddBus = () => {
    setSelectedBus(undefined);
    setFormOpen(true);
  };

  const handleEditBus = (bus: Bus) => {
    setSelectedBus(bus);
    setFormOpen(true);
  };

  const handleDeleteBus = (busId: string) => {
    setBusToDelete(busId);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: CreateBusRequest | UpdateBusRequest) => {
    try {
      setFormLoading(true);
      
      if (selectedBus) {
        // Update existing bus
        await busService.updateBus(selectedBus.id, data as UpdateBusRequest);
        showNotification('Bus updated successfully', 'success');
      } else {
        // Create new bus
        await busService.createBus(data as CreateBusRequest);
        showNotification('Bus created successfully', 'success');
      }
      
      setFormOpen(false);
      await loadBuses(); // Reload the buses list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save bus';
      throw new Error(errorMessage); // Let the form handle the error display
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!busToDelete) return;
    
    try {
      setDeleteLoading(true);
      await busService.deleteBus(busToDelete);
      showNotification('Bus deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setBusToDelete(null);
      await loadBuses(); // Reload the buses list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bus';
      showNotification(errorMessage, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setBusToDelete(null);
  };

  const handleFormClose = () => {
    if (!formLoading) {
      setFormOpen(false);
      setSelectedBus(undefined);
    }
  };

  const getStatusLabel = (status: Bus['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'maintenance':
        return 'Maintenance';
      case 'retired':
        return 'Retired';
      default:
        return 'Unknown';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }} role="main" aria-labelledby="buses-page-title">
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        mb: 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <BusIcon 
            color="primary" 
            sx={{ fontSize: { xs: 28, sm: 32 } }} 
            aria-hidden="true"
          />
          <Typography 
            variant="h4" 
            component="h1"
            id="buses-page-title"
            sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}
          >
            Bus Fleet Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBus}
          disabled={loading}
          aria-label="Add new bus to fleet"
          sx={{
            minHeight: 44,
            alignSelf: { xs: 'stretch', sm: 'center' },
          }}
        >
          Add Bus
        </Button>
      </Box>

      {/* Filters */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 3, 
          flexWrap: 'wrap',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          flexDirection: { xs: 'column', sm: 'row' },
        }}
        role="search"
        aria-label="Bus filters"
      >
        <TextField
          placeholder="Search buses..."
          value={filters.search}
          onChange={handleSearchChange}
          aria-label="Search buses by number, model, or other details"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon aria-hidden="true" />
              </InputAdornment>
            ),
          }}
          sx={{ 
            minWidth: { xs: '100%', sm: 250 },
            flex: { xs: 1, sm: 'none' },
          }}
        />
        
        <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={filters.status || 'all'}
            label="Status"
            aria-label="Filter buses by status"
            onChange={(e) => {
              const value = e.target.value;
              handleStatusFilterChange(
                value === 'all' ? undefined : value as Bus['status']
              );
            }}
          >
            <MenuItem value="all">All Buses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
            <MenuItem value="retired">Retired</MenuItem>
          </Select>
        </FormControl>
        
        {(filters.search || filters.status) && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flexWrap: 'wrap',
              width: { xs: '100%', sm: 'auto' },
            }}
            role="region"
            aria-label="Active filters"
          >
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Filters:
            </Typography>
            {filters.search && (
              <Chip
                label={`Search: "${filters.search}"`}
                onDelete={() => setFilters(prev => ({ ...prev, search: '' }))}
                size="small"
                aria-label={`Remove search filter: ${filters.search}`}
              />
            )}
            {filters.status && (
              <Chip
                label={`Status: ${getStatusLabel(filters.status)}`}
                onDelete={() => setFilters(prev => ({ ...prev, status: undefined }))}
                size="small"
                aria-label={`Remove status filter: ${getStatusLabel(filters.status)}`}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Buses Table */}
      <BusTable
        buses={buses}
        loading={loading}
        error={error}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        filters={filters}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={handleSortChange}
        onEdit={handleEditBus}
        onDelete={handleDeleteBus}
      />

      {/* Bus Form Dialog */}
      <BusForm
        bus={selectedBus}
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
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusIcon color="error" />
          Confirm Delete Bus
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this bus? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Note: Active buses cannot be deleted. Please change the bus status first.
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
            startIcon={<BusIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Bus'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default BusesPage;
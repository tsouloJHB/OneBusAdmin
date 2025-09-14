import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsBus as BusIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as ActivateIcon,
  Pause as DeactivateIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { BusNumberManagementProps, BusNumber, BusNumberFormData } from '../../types/busCompany';
import BusNumberForm from './BusNumberForm';

const BusNumberManagement: React.FC<BusNumberManagementProps> = ({
  companyId,
  busNumbers,
  loading,
  onAdd,
  onEdit,
  onDelete
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBusNumber, setEditingBusNumber] = useState<BusNumber | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingBusNumber, setDeletingBusNumber] = useState<BusNumber | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBusNumber, setSelectedBusNumber] = useState<BusNumber | null>(null);

  // Handle add new bus number
  const handleAdd = () => {
    console.log('BusNumberManagement: Add new bus number for company:', companyId);
    setShowAddForm(true);
  };

  // Handle add form submit
  const handleAddFormSubmit = async (formData: BusNumberFormData) => {
    console.log('=== BUS NUMBER MANAGEMENT SUBMISSION ===');
    console.log('BusNumberManagement: Received form data:', formData);
    console.log('BusNumberManagement: Company ID:', companyId);
    console.log('BusNumberManagement: onAdd function:', typeof onAdd);
    
    try {
      console.log('BusNumberManagement: Calling onAdd...');
      await onAdd(companyId, formData);
      setShowAddForm(false);
      console.log('BusNumberManagement: Bus number created successfully');
    } catch (error) {
      console.error('BusNumberManagement: Error creating bus number:', error);
      console.error('BusNumberManagement: Error details:', error);
      // Error is handled by the form component
      throw error; // Re-throw so the form can handle it
    }
  };

  // Handle add form cancel
  const handleAddFormCancel = () => {
    setShowAddForm(false);
  };

  // Handle edit bus number
  const handleEdit = (busNumber: BusNumber) => {
    console.log('BusNumberManagement: Edit bus number:', busNumber.id);
    setEditingBusNumber(busNumber);
    setShowEditForm(true);
    handleMenuClose();
  };

  // Handle edit form submit
  const handleEditFormSubmit = async (formData: BusNumberFormData) => {
    if (!editingBusNumber) return;
    
    try {
      await onEdit(editingBusNumber.id, formData);
      setShowEditForm(false);
      setEditingBusNumber(null);
      console.log('BusNumberManagement: Bus number updated successfully');
    } catch (error) {
      console.error('BusNumberManagement: Error updating bus number:', error);
      // Error is handled by the form component
    }
  };

  // Handle edit form cancel
  const handleEditFormCancel = () => {
    setShowEditForm(false);
    setEditingBusNumber(null);
  };

  // Handle delete bus number
  const handleDelete = (busNumber: BusNumber) => {
    console.log('BusNumberManagement: Delete bus number:', busNumber.id);
    setDeletingBusNumber(busNumber);
    setShowDeleteDialog(true);
    handleMenuClose();
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingBusNumber) return;
    
    try {
      await onDelete(deletingBusNumber.id);
      setShowDeleteDialog(false);
      setDeletingBusNumber(null);
      console.log('BusNumberManagement: Bus number deleted successfully');
    } catch (error) {
      console.error('BusNumberManagement: Error deleting bus number:', error);
      // Error is handled by the context
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeletingBusNumber(null);
  };

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, busNumber: BusNumber) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedBusNumber(busNumber);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedBusNumber(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Bus Number Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage bus numbers and route assignments for this company
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={loading}
        >
          Add Bus Number
        </Button>
      </Box>

      {/* Content */}
      {loading && busNumbers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary">
              Loading bus numbers...
            </Typography>
          </Box>
        </Paper>
      ) : busNumbers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BusIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Bus Numbers Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by adding bus numbers for this company
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add First Bus Number
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bus Number</TableCell>
                <TableCell>Route Details</TableCell>
                <TableCell>Distance & Duration</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {busNumbers.map((busNumber) => (
                <TableRow key={busNumber.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {busNumber.busNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {busNumber.direction}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {busNumber.routeName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <LocationIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {busNumber.startDestination} → {busNumber.endDestination}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {busNumber.distanceKm} km
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ~{busNumber.estimatedDurationMinutes} min
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Every {busNumber.frequencyMinutes} min
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={busNumber.isActive ? 'Active' : 'Inactive'}
                      color={busNumber.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="More actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, busNumber)}
                        disabled={loading}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Bus Number Form */}
      {showAddForm && (
        <BusNumberForm
          open={showAddForm}
          onSubmit={handleAddFormSubmit}
          onCancel={handleAddFormCancel}
          title="Add New Bus Number"
        />
      )}

      {/* Edit Bus Number Form */}
      {showEditForm && editingBusNumber && (
        <BusNumberForm
          open={showEditForm}
          onSubmit={handleEditFormSubmit}
          onCancel={handleEditFormCancel}
          title={`Edit Bus Number ${editingBusNumber.busNumber}`}
          initialData={{
            busNumber: editingBusNumber.busNumber,
            routeName: editingBusNumber.routeName,
            description: editingBusNumber.description,
            startDestination: editingBusNumber.startDestination,
            endDestination: editingBusNumber.endDestination,
            direction: editingBusNumber.direction,
            distanceKm: editingBusNumber.distanceKm,
            estimatedDurationMinutes: editingBusNumber.estimatedDurationMinutes,
            frequencyMinutes: editingBusNumber.frequencyMinutes,
            isActive: editingBusNumber.isActive
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Bus Number</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete bus number "{deletingBusNumber?.busNumber}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Route: {deletingBusNumber?.routeName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => selectedBusNumber && handleEdit(selectedBusNumber)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        {selectedBusNumber?.isActive ? (
          <MenuItem onClick={() => {
            // TODO: Implement deactivate functionality
            handleMenuClose();
          }}>
            <ListItemIcon>
              <DeactivateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => {
            // TODO: Implement activate functionality
            handleMenuClose();
          }}>
            <ListItemIcon>
              <ActivateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => selectedBusNumber && handleDelete(selectedBusNumber)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default BusNumberManagement;
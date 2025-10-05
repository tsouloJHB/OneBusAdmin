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
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as TruckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { RegisteredBusesProps } from '../../types/busCompany';
import { getStatusColor, getStatusLabel, isInspectionDue, isInspectionOverdue, formatDate } from '../../utils/busCompanyUtils';
import RegisteredBusForm from './RegisteredBusForm';
import { useCompanyManagement } from '../../contexts/CompanyManagementContext';

const RegisteredBuses: React.FC<RegisteredBusesProps> = ({
  companyId,
  companyName,
  registeredBuses,
  loading,
  availableRoutes = [],
  onAdd,
  onEdit,
  onDelete
}) => {
  const { state } = useCompanyManagement();

  const [openForm, setOpenForm] = useState(false);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);

  // Handle add new registered bus
  const handleAdd = () => {
    console.log('RegisteredBuses: Add new registered bus for company:', companyId);
    setEditingBusId(null);
    setOpenForm(true);
  };

  // Handle edit registered bus
  const handleEdit = (id: string) => {
    console.log('RegisteredBuses: Edit registered bus:', id);
    setEditingBusId(id);
    setOpenForm(true);
  };

  // Handle delete registered bus
  const handleDelete = (id: string) => {
    console.log('RegisteredBuses: Delete registered bus:', id);
    const ok = window.confirm('Are you sure you want to delete this registered bus?');
    if (!ok) return;
    onDelete(id).catch(err => console.error('Failed to delete registered bus', err));
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Registered Buses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the physical bus fleet and their registration details
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={loading}
        >
          Add Registered Bus
        </Button>
      </Box>

      {/* Content */}
      {loading && registeredBuses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary">
              Loading registered buses...
            </Typography>
          </Box>
        </Paper>
      ) : registeredBuses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TruckIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Registered Buses Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by registering buses for this company's fleet
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Register First Bus
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Registration Number</TableCell>
                <TableCell>Bus Number</TableCell>
                <TableCell>Bus ID</TableCell>
                <TableCell>Driver ID</TableCell>
                <TableCell>Driver Name</TableCell>
                <TableCell>Model & Year</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Route Assignment</TableCell>
                <TableCell>Tracker IMEI</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registeredBuses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {bus.registrationNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {bus.busNumber ? (
                      <Typography variant="body2">
                        {bus.busNumber}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {bus.busId ? (
                      <Typography variant="body2">
                        {bus.busId}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not set
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {bus.driverId ? (
                      <Typography variant="body2">
                        {bus.driverId}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not set
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {bus.driverName ? (
                      <Typography variant="body2">
                        {bus.driverName}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not set
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {bus.model} ({bus.year})
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {bus.capacity} seats
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(bus.status)}
                      color={getStatusColor(bus.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {bus.routeName ? (
                      <Box>
                        <Typography variant="body2">
                          {bus.routeName}
                        </Typography>
                        {bus.routeAssignedAt && (
                          <Typography variant="caption" color="text.secondary">
                            Since {formatDate(bus.routeAssignedAt)}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {bus.trackerImei ? (
                      <Typography variant="body2">
                        {bus.trackerImei}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not set
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(bus.id)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(bus.id)}
                      disabled={loading}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Development Notice */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Development Note:</strong> Registered Bus Management functionality is currently under development.
          Forms and CRUD operations will be implemented in the next phase.
        </Typography>
      </Alert>

      {/* Registered Bus Form Dialog */}
      <RegisteredBusForm
        open={openForm}
        companyId={companyId}
        companyName={companyName}
        companyBusNumbers={(state.busNumbers || []).map(b => b.busNumber)}
        availableRoutes={availableRoutes}
        initialData={editingBusId ? registeredBuses.find(b => b.id === editingBusId) as any : undefined}
        onCancel={() => setOpenForm(false)}
        onSubmit={async (data) => {
          try {
            if (editingBusId) {
              await onEdit(editingBusId, data as any, companyId);
            } else {
              await onAdd(companyId, data as any);
            }
            setOpenForm(false);
          } catch (err) {
            console.error('Failed to save registered bus', err);
            throw err;
          }
        }}
      />
    </Box>
  );
};

export default RegisteredBuses;
import React from 'react';
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
  Alert
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

const RegisteredBuses: React.FC<RegisteredBusesProps> = ({
  companyId,
  registeredBuses,
  loading,
  onAdd,
  onEdit,
  onDelete
}) => {
  // Handle add new registered bus
  const handleAdd = () => {
    console.log('RegisteredBuses: Add new registered bus for company:', companyId);
    // TODO: Open form dialog
  };

  // Handle edit registered bus
  const handleEdit = (id: string) => {
    console.log('RegisteredBuses: Edit registered bus:', id);
    // TODO: Open form dialog with existing data
  };

  // Handle delete registered bus
  const handleDelete = (id: string) => {
    console.log('RegisteredBuses: Delete registered bus:', id);
    // TODO: Show confirmation dialog
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
      {registeredBuses.length === 0 ? (
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
                <TableCell>Model & Year</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Route Assignment</TableCell>
                <TableCell>Next Inspection</TableCell>
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
                    {bus.routeAssignment ? (
                      <Box>
                        <Typography variant="body2">
                          {bus.routeAssignment.routeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Since {formatDate(bus.routeAssignment.assignedAt)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {bus.nextInspection ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isInspectionOverdue(bus.nextInspection) && (
                          <WarningIcon color="error" fontSize="small" />
                        )}
                        {isInspectionDue(bus.nextInspection) && !isInspectionOverdue(bus.nextInspection) && (
                          <WarningIcon color="warning" fontSize="small" />
                        )}
                        <Box>
                          <Typography 
                            variant="body2"
                            color={
                              isInspectionOverdue(bus.nextInspection) 
                                ? 'error.main' 
                                : isInspectionDue(bus.nextInspection) 
                                ? 'warning.main' 
                                : 'text.primary'
                            }
                          >
                            {formatDate(bus.nextInspection)}
                          </Typography>
                          {isInspectionOverdue(bus.nextInspection) && (
                            <Typography variant="caption" color="error.main">
                              Overdue
                            </Typography>
                          )}
                          {isInspectionDue(bus.nextInspection) && !isInspectionOverdue(bus.nextInspection) && (
                            <Typography variant="caption" color="warning.main">
                              Due soon
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not scheduled
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
    </Box>
  );
};

export default RegisteredBuses;
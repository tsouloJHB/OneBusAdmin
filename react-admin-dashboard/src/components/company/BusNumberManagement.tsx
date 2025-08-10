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
  DirectionsBus as BusIcon
} from '@mui/icons-material';
import { BusNumberManagementProps } from '../../types/busCompany';
import { getStatusColor, getStatusLabel } from '../../utils/busCompanyUtils';

const BusNumberManagement: React.FC<BusNumberManagementProps> = ({
  companyId,
  busNumbers,
  loading,
  onAdd,
  onEdit,
  onDelete
}) => {
  // Handle add new bus number
  const handleAdd = () => {
    console.log('BusNumberManagement: Add new bus number for company:', companyId);
    // TODO: Open form dialog
  };

  // Handle edit bus number
  const handleEdit = (id: string) => {
    console.log('BusNumberManagement: Edit bus number:', id);
    // TODO: Open form dialog with existing data
  };

  // Handle delete bus number
  const handleDelete = (id: string) => {
    console.log('BusNumberManagement: Delete bus number:', id);
    // TODO: Show confirmation dialog
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
      {busNumbers.length === 0 ? (
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
                <TableCell>Route</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned Driver</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {busNumbers.map((busNumber) => (
                <TableRow key={busNumber.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {busNumber.busNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {busNumber.routeName ? (
                      <Typography variant="body2">
                        {busNumber.routeName}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(busNumber.status)}
                      color={getStatusColor(busNumber.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {busNumber.assignedDriver ? (
                      <Typography variant="body2">
                        {busNumber.assignedDriver}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {busNumber.capacity ? (
                      <Typography variant="body2">
                        {busNumber.capacity} seats
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not specified
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(busNumber.id)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(busNumber.id)}
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
          <strong>Development Note:</strong> Bus Number Management functionality is currently under development. 
          Forms and CRUD operations will be implemented in the next phase.
        </Typography>
      </Alert>
    </Box>
  );
};

export default BusNumberManagement;
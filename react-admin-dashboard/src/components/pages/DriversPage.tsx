import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { driverService } from '../../services/driverService';
import { busCompanyService } from '../../services/busCompanyService';
import { Driver, DriverRegistrationRequest, DriverStatistics } from '../../types/driver';
import { BusCompany } from '../../types/busCompany';
import { useNotification } from '../../contexts';
import DriverDetailsDialog from '../driver/DriverDetailsDialog';

const DriversPage: React.FC = () => {
  // Notification
  const { showNotification } = useNotification();
  
  // Company selection state
  const [companies, setCompanies] = useState<BusCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<BusCompany | null>(null);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  
  // Driver state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [registrationType, setRegistrationType] = useState<'admin' | 'self'>('admin');
  const [statistics, setStatistics] = useState<DriverStatistics | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const [formData, setFormData] = useState<DriverRegistrationRequest>({
    driverId: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    companyId: undefined,
  });

  // Load companies and drivers on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Load drivers when company is selected
  useEffect(() => {
    if (selectedCompany) {
      loadDrivers();
      loadStatistics();
    } else {
      setDrivers([]);
      setStatistics(null);
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
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
  };

  const loadDrivers = async () => {
    if (!selectedCompany) {
      setDrivers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await driverService.getDriversByCompany(parseInt(selectedCompany.id));
      setDrivers(data);
    } catch (err) {
      console.error('Failed to load drivers:', err);
      const errorMessage = 'Failed to load drivers. Please try again.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await driverService.getDriverStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  // Handle company selection
  const handleCompanyChange = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    setSelectedCompany(company || null);
    setSearchTerm(''); // Clear search when changing company
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!selectedCompany) return;
    
    if (term.trim() === '') {
      loadDrivers();
    } else {
      try {
        setLoading(true);
        const results = await driverService.searchDrivers(term);
        // Filter results by selected company
        const filteredResults = results.filter(driver => 
          driver.companyId === parseInt(selectedCompany.id)
        );
        setDrivers(filteredResults);
      } catch (err) {
        setError('Failed to search drivers.');
        showNotification('Failed to search drivers.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenDialog = (driver?: Driver) => {
    if (!selectedCompany) {
      showNotification('Please select a company first', 'warning');
      return;
    }
    
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        driverId: driver.driverId,
        fullName: driver.fullName,
        email: driver.email,
        phoneNumber: driver.phoneNumber || '',
        licenseNumber: driver.licenseNumber || '',
        licenseExpiryDate: driver.licenseExpiryDate || '',
        companyId: parseInt(selectedCompany.id),
      });
    } else {
      setEditingDriver(null);
      setFormData({
        driverId: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        licenseNumber: '',
        licenseExpiryDate: '',
        companyId: parseInt(selectedCompany.id),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDriver(null);
  };

  const handleOpenDetailsDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedDriver(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveDriver = async () => {
    try {
      if (editingDriver) {
        await driverService.updateDriver(editingDriver.id, formData);
        showNotification('Driver updated successfully', 'success');
      } else {
        if (registrationType === 'admin') {
          await driverService.registerDriverByAdmin(formData);
          showNotification('Driver registered successfully', 'success');
        } else {
          if (!formData.password) {
            setError('Password is required for self-registration');
            return;
          }
          await driverService.registerDriver(formData);
          showNotification('Driver registered successfully', 'success');
        }
      }
      loadDrivers();
      loadStatistics();
      handleCloseDialog();
    } catch (err) {
      const errorMessage = 'Failed to save driver. Please try again.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteDriver = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await driverService.deleteDriver(id);
        showNotification('Driver deleted successfully', 'success');
        loadDrivers();
        loadStatistics();
      } catch (err) {
        const errorMessage = 'Failed to delete driver.';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      }
    }
  };

  const handleChangeStatus = async (id: number, newStatus: string) => {
    try {
      await driverService.updateDriverStatus(id, newStatus);
      showNotification('Driver status updated successfully', 'success');
      loadDrivers();
    } catch (err) {
      const errorMessage = 'Failed to update driver status.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'error';
      case 'ON_LEAVE':
        return 'warning';
      default:
        return 'default';
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
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
      }}>
        <Box>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }, // Responsive title
            }}
          >
            <PersonAddIcon fontSize="large" />
            Driver Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedCompany 
              ? `Managing drivers for ${selectedCompany.name}`
              : 'Select a company to manage their drivers'
            }
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={!selectedCompany}
          color="primary"
          sx={{
            minWidth: { xs: '100%', sm: 'auto' }, // Full width on mobile
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Add Driver
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
            Please select a company to view and manage their drivers.
          </Alert>
        )}
      </Box>

      {/* Statistics - Only show when company is selected */}
      {selectedCompany && statistics && (
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile
        }}>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total Drivers
            </Typography>
            <Typography variant="h5">{statistics.totalDrivers}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Active Drivers
            </Typography>
            <Typography variant="h5" color="success.main">{statistics.activeDrivers}</Typography>
          </Paper>
        </Box>
      )}

      {/* Search - Only show when company is selected */}
      {selectedCompany && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search drivers by name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
            size="small" // Smaller input on mobile
          />
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {selectedCompany && loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : selectedCompany ? (
        /* Drivers Table - Only show when company is selected */
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 650, sm: 750 } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Driver ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Company</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Duty</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Current Bus</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? 'No drivers found matching your search' : 'No drivers found for this company'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                drivers.map((driver) => (
                  <TableRow key={driver.id} hover>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {driver.driverId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {driver.fullName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography 
                        variant="body2" 
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {driver.companyName || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={driver.status}
                        color={getStatusColor(driver.status)}
                        size="small"
                        sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Chip
                        label={driver.onDuty ? 'On Duty' : 'Off Duty'}
                        color={driver.onDuty ? 'warning' : 'default'}
                        size="small"
                        sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {driver.currentlyAssignedBusNumber ? (
                        <Chip
                          label={driver.currentlyAssignedBusNumber}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDetailsDialog(driver)}
                          title="View Details"
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(driver)}
                          title="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteDriver(driver.id)}
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      {/* Dialog for adding/editing driver */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDriver ? 'Edit Driver' : 'Add New Driver'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {!editingDriver && (
            <TextField
              select
              fullWidth
              label="Registration Type"
              value={registrationType}
              onChange={(e) => setRegistrationType(e.target.value as 'admin' | 'self')}
              margin="normal"
            >
              <MenuItem value="admin">Admin Registration (Default Password)</MenuItem>
              <MenuItem value="self">Self Registration (Custom Password)</MenuItem>
            </TextField>
          )}

          <TextField
            fullWidth
            label="Driver ID"
            name="driverId"
            value={formData.driverId}
            onChange={handleFormChange}
            margin="normal"
            disabled={!!editingDriver}
          />

          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleFormChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleFormChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="License Number"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleFormChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="License Expiry Date"
            name="licenseExpiryDate"
            type="date"
            value={formData.licenseExpiryDate}
            onChange={handleFormChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          {!editingDriver && registrationType === 'self' && (
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password || ''}
              onChange={handleFormChange}
              margin="normal"
              helperText="Minimum 8 characters"
            />
          )}

          {!editingDriver && registrationType === 'admin' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Default password will be set to: <strong>Driver@123</strong>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveDriver} variant="contained" color="primary">
            {editingDriver ? 'Update' : 'Add'} Driver
          </Button>
        </DialogActions>
      </Dialog>

      {/* Driver Details Dialog */}
      <DriverDetailsDialog
        open={openDetailsDialog}
        driver={selectedDriver}
        onClose={handleCloseDetailsDialog}
      />
    </Box>
  );
};

export default DriversPage;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  GpsFixed as GpsIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
} from '@mui/icons-material';
import trackerService from '../../services/trackerService';
import { Tracker, CreateTrackerRequest, TrackerStatistics } from '../../types';

const TrackersPage: React.FC = () => {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [statistics, setStatistics] = useState<TrackerStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTracker, setEditingTracker] = useState<Tracker | null>(null);
  const [formData, setFormData] = useState<CreateTrackerRequest>({
    imei: '',
    brand: '',
    model: '',
    status: 'AVAILABLE',
    purchaseDate: '',
    companyId: undefined,
    notes: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadTrackers();
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTrackers = async () => {
    try {
      setLoading(true);
      const data = await trackerService.getAllTrackers();
      setTrackers(data);
    } catch (error) {
      showSnackbar('Failed to load trackers', 'error');
      console.error('Error loading trackers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await trackerService.getTrackerStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadTrackers();
      return;
    }

    try {
      setLoading(true);
      const results = await trackerService.searchTrackers(searchQuery);
      setTrackers(results);
    } catch (error) {
      showSnackbar('Search failed', 'error');
      console.error('Error searching trackers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tracker?: Tracker) => {
    if (tracker) {
      setEditingTracker(tracker);
      setFormData({
        imei: tracker.imei,
        brand: tracker.brand,
        model: tracker.model,
        status: tracker.status,
        purchaseDate: tracker.purchaseDate || '',
        companyId: tracker.companyId,
        notes: tracker.notes || '',
      });
    } else {
      setEditingTracker(null);
      setFormData({
        imei: '',
        brand: '',
        model: '',
        status: 'AVAILABLE',
        purchaseDate: '',
        companyId: undefined,
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTracker(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingTracker) {
        await trackerService.updateTracker(editingTracker.id, formData);
        showSnackbar('Tracker updated successfully', 'success');
      } else {
        await trackerService.createTracker(formData);
        showSnackbar('Tracker created successfully', 'success');
      }
      handleCloseDialog();
      loadTrackers();
      loadStatistics();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || 'Failed to save tracker',
        'error'
      );
      console.error('Error saving tracker:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tracker?')) {
      return;
    }

    try {
      await trackerService.deleteTracker(id);
      showSnackbar('Tracker deleted successfully', 'success');
      loadTrackers();
      loadStatistics();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || 'Failed to delete tracker',
        'error'
      );
      console.error('Error deleting tracker:', error);
    }
  };

  const handleUnassign = async (trackerId: number) => {
    try {
      await trackerService.unassignTrackerFromBus(trackerId);
      showSnackbar('Tracker unassigned successfully', 'success');
      loadTrackers();
      loadStatistics();
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || 'Failed to unassign tracker',
        'error'
      );
      console.error('Error unassigning tracker:', error);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' | 'info' => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'IN_USE':
        return 'info';
      case 'MAINTENANCE':
        return 'warning';
      case 'DAMAGED':
      case 'RETIRED':
        return 'error';
      default:
        return 'default';
    }
  };

  const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography color="text.secondary" gutterBottom variant="body2">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Tracker Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage GPS trackers for bus fleet monitoring
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              loadTrackers();
              loadStatistics();
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Tracker
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard title="Total Trackers" value={statistics.total} color="#1976d2" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard title="Available" value={statistics.available} color="#2e7d32" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard title="In Use" value={statistics.inUse} color="#0288d1" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard title="Maintenance" value={statistics.maintenance} color="#ed6c02" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard title="Damaged" value={statistics.damaged} color="#d32f2f" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <StatCard title="Retired" value={statistics.retired} color="#757575" />
          </Grid>
        </Grid>
      )}

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by IMEI, brand, or model..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => { setSearchQuery(''); loadTrackers(); }}>
                  ×
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Trackers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>IMEI</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Assigned Bus</TableCell>
              <TableCell>Purchase Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : trackers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No trackers found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              trackers.map((tracker) => (
                <TableRow key={tracker.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GpsIcon fontSize="small" color="action" />
                      {tracker.imei}
                    </Box>
                  </TableCell>
                  <TableCell>{tracker.brand}</TableCell>
                  <TableCell>{tracker.model}</TableCell>
                  <TableCell>
                    <Chip
                      label={tracker.status}
                      color={getStatusColor(tracker.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{tracker.companyName || '-'}</TableCell>
                  <TableCell>
                    {tracker.assignedBusNumber ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LinkIcon fontSize="small" color="primary" />
                        {tracker.assignedBusNumber}
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {tracker.purchaseDate
                      ? new Date(tracker.purchaseDate).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(tracker)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {tracker.assignedBusId && (
                      <Tooltip title="Unassign from bus">
                        <IconButton
                          size="small"
                          onClick={() => handleUnassign(tracker.id)}
                          color="warning"
                        >
                          <LinkOffIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(tracker.id)}
                        color="error"
                        disabled={!!tracker.assignedBusId}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTracker ? 'Edit Tracker' : 'Add New Tracker'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="IMEI"
              value={formData.imei}
              onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
              required
              fullWidth
              helperText="10-20 characters"
            />
            <TextField
              label="Brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
              fullWidth
            />
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as any,
                })
              }
              required
              fullWidth
            >
              <MenuItem value="AVAILABLE">Available</MenuItem>
              <MenuItem value="IN_USE">In Use</MenuItem>
              <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
              <MenuItem value="DAMAGED">Damaged</MenuItem>
              <MenuItem value="RETIRED">Retired</MenuItem>
            </TextField>
            <TextField
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.imei || !formData.brand || !formData.model}
          >
            {editingTracker ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TrackersPage;

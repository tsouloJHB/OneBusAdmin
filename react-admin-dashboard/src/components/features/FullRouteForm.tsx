import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { FullRoute, CreateFullRouteRequest, UpdateFullRouteRequest, Coordinate } from '../../types';
import { BusNumber } from '../../types/busCompany';
import busCompanyService from '../../services/busCompanyService';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface FullRouteFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateFullRouteRequest | UpdateFullRouteRequest) => Promise<void>;
  route?: FullRoute;
  companyId: number;
  routeId: number;
}

const FullRouteForm: React.FC<FullRouteFormProps> = ({
  open,
  onClose,
  onSave,
  route,
  companyId,
  routeId,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    direction: '',
    description: '',
    busNumberId: '',
  });

  const [busNumbers, setBusNumbers] = useState<BusNumber[]>([]);
  const [loadingBusNumbers, setLoadingBusNumbers] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [newCoordinate, setNewCoordinate] = useState({ lat: '', lon: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (route) {
      setFormData({
        name: route.name,
        direction: route.direction || '',
        description: route.description || '',
        busNumberId: '',
      });
      
      // Parse coordinates from JSON if needed
      const coords = route.coordinates || 
        (route.coordinatesJson ? JSON.parse(route.coordinatesJson) : []);
      setCoordinates(coords);
    } else {
      setFormData({ name: '', direction: '', description: '', busNumberId: '' });
      setCoordinates([]);
    }
  }, [route]);

  useEffect(() => {
    const loadBusNumbers = async () => {
      if (companyId) {
        try {
          setLoadingBusNumbers(true);
          const data = await busCompanyService.getBusNumbersByCompany(companyId.toString());
          setBusNumbers(data);
        } catch (error) {
          console.error('Failed to load bus numbers:', error);
        } finally {
          setLoadingBusNumbers(false);
        }
      }
    };
    loadBusNumbers();
  }, [companyId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleCoordinateChange = (field: 'lat' | 'lon', value: string) => {
    setNewCoordinate((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCoordinate = () => {
    const lat = parseFloat(newCoordinate.lat);
    const lon = parseFloat(newCoordinate.lon);

    if (isNaN(lat) || isNaN(lon)) {
      setErrors((prev) => ({ ...prev, coordinates: 'Invalid coordinate values' }));
      return;
    }

    setCoordinates((prev) => [...prev, { lat, lon }]);
    setNewCoordinate({ lat: '', lon: '' });
    setErrors((prev) => ({ ...prev, coordinates: '' }));
  };

  const handleRemoveCoordinate = (index: number) => {
    setCoordinates((prev) => prev.filter((_: Coordinate, i: number) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Route name is required';
    }

    // Coordinates are now optional - can be added later via map

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const data: CreateFullRouteRequest | UpdateFullRouteRequest = {
        ...(route ? { id: route.id } : {}),
        companyId,
        routeId,
        name: formData.name,
        direction: formData.direction || undefined,
        description: formData.description || undefined,
        busNumberId: formData.busNumberId || undefined,
        ...(coordinates.length > 0 ? { coordinates } : {}),
      };

      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Failed to save full route:', error);
      setErrors((prev) => ({ ...prev, submit: 'Failed to save route' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {route ? 'Edit Full Route' : 'Create Full Route'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Basic Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Bus Number</InputLabel>
                <Select
                  value={formData.busNumberId}
                  label="Bus Number"
                  onChange={(e) => handleInputChange('busNumberId', e.target.value)}
                  disabled={loadingBusNumbers}
                >
                  <MenuItem value="">
                    <em>Select a bus number (optional)</em>
                  </MenuItem>
                  {busNumbers.map((busNum) => (
                    <MenuItem key={busNum.id} value={busNum.id}>
                      {busNum.busNumber} - {busNum.routeName}
                    </MenuItem>
                  ))}
                </Select>
                {loadingBusNumbers && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption">Loading bus numbers...</Typography>
                  </Box>
                )}
              </FormControl>

              <TextField
                fullWidth
                label="Route Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />

              <TextField
                fullWidth
                label="Direction"
                value={formData.direction}
                onChange={(e) => handleInputChange('direction', e.target.value)}
                placeholder="e.g., Northbound, Southbound"
              />

              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          {/* Coordinates Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2">
                Route Coordinates (Optional)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                You can add coordinates later via the map
              </Typography>
            </Box>
            
            {/* Add Coordinate Form */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  label="Latitude"
                  value={newCoordinate.lat}
                  onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                  type="number"
                  inputProps={{ step: 'any' }}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Longitude"
                  value={newCoordinate.lon}
                  onChange={(e) => handleCoordinateChange('lon', e.target.value)}
                  type="number"
                  inputProps={{ step: 'any' }}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddCoordinate}
                  disabled={!newCoordinate.lat || !newCoordinate.lon}
                >
                  Add
                </Button>
              </Box>
              {errors.coordinates && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.coordinates}
                </Typography>
              )}
            </Paper>

            {/* Coordinates List */}
            <List
              sx={{
                maxHeight: 300,
                overflow: 'auto',
                border: 1,
                borderColor: 'grey.300',
                borderRadius: 1,
              }}
            >
              {coordinates.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="No coordinates added"
                    secondary="Add at least one coordinate to create the route"
                  />
                </ListItem>
              ) : (
                coordinates.map((coord: Coordinate, index: number) => (
                  <ListItem
                    key={index}
                    sx={{
                      borderBottom: index < coordinates.length - 1 ? 1 : 0,
                      borderColor: 'grey.200',
                    }}
                  >
                    <ListItemText
                      primary={`Point ${index + 1}`}
                      secondary={`Lat: ${coord.lat.toFixed(6)}, Lon: ${coord.lon.toFixed(6)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveCoordinate(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
            </List>
          </Box>

          {errors.submit && (
            <Typography color="error" variant="body2">
              {errors.submit}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FullRouteForm;

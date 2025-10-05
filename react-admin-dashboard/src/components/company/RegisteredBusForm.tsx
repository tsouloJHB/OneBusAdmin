import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert
} from '@mui/material';
import { RegisteredBusFormData, RegisteredBus } from '../../types/busCompany';
import { busCompanyService } from '../../services/busCompanyService';
import { registeredBusToFormData } from '../../utils/busCompanyUtils';

interface RegisteredBusFormProps {
  open: boolean;
  companyId: string;
  companyName: string; // Add company name for route fetching
  companyBusNumbers?: string[]; // optional list of bus numbers for the company
  availableRoutes?: string[]; // optional list of available routes (deprecated, will be dynamic)
  initialData?: Partial<RegisteredBusFormData> | RegisteredBus;
  onSubmit: (data: RegisteredBusFormData) => Promise<void>;
  onCancel: () => void;
  title?: string;
}

const RegisteredBusForm: React.FC<RegisteredBusFormProps> = ({
  open,
  companyId,
  companyName,
  companyBusNumbers = [],
  availableRoutes = [],
  initialData,
  onSubmit,
  onCancel,
  title = 'Register Bus'
}) => {
  const [formData, setFormData] = useState<RegisteredBusFormData>({
    registrationNumber: '',
    busId: undefined,
    trackerImei: '',
    busNumber: undefined,
    driverId: undefined,
    driverName: undefined,
    model: '',
    year: new Date().getFullYear(),
    capacity: 0,
    status: 'active',
    route: undefined,
    routeId: undefined,
    routeAssignment: undefined,
    lastInspection: undefined,
    nextInspection: undefined
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dynamicRoutes, setDynamicRoutes] = useState<any[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Transform initial data to match form format
      let transformedData: Partial<RegisteredBusFormData>;

      // Check if initialData is a RegisteredBus (has routeName property)
      if ('routeName' in initialData) {
        // It's a RegisteredBus, use the utility function
        transformedData = registeredBusToFormData(initialData as RegisteredBus);
      } else {
        // It's already Partial<RegisteredBusFormData>
        transformedData = initialData;
      }

      setFormData(prev => ({ ...prev, ...transformedData } as RegisteredBusFormData));

      // Load routes for the selected bus number if it exists
      const busNumber = transformedData.busNumber;
      if (busNumber) {
        loadRoutesForBusNumber(busNumber);
      }
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value } as RegisteredBusFormData));
    
    // If bus number changed, load routes for that bus number
    if (field === 'busNumber' && value) {
      loadRoutesForBusNumber(value);
    } else if (field === 'busNumber' && !value) {
      // Clear routes if bus number is cleared
      setDynamicRoutes([]);
      // Also clear selected route
      setFormData(prev => ({ ...prev, route: undefined, routeId: undefined }));
    }
  };

  const handleRouteChange = (routeId: number | undefined, routeName: string | undefined) => {
    setFormData(prev => ({ 
      ...prev, 
      route: routeName,
      routeId: routeId
    } as RegisteredBusFormData));
  };

  const loadRoutesForBusNumber = async (busNumber: string) => {
    if (!busNumber || !companyName) return;
    
    setLoadingRoutes(true);
    try {
      const routes = await busCompanyService.getRoutesByBusNumberAndCompany(busNumber, companyName);
      setDynamicRoutes(routes);
      // Clear selected route if it's not in the new routes
      if (formData.route && !routes.some((r: any) => r.routeName === formData.route)) {
        setFormData(prev => ({ ...prev, route: undefined, routeId: undefined }));
      }
    } catch (error) {
      console.error('Failed to load routes for bus number:', error);
      setDynamicRoutes([]);
      setFormData(prev => ({ ...prev, route: undefined, routeId: undefined }));
    } finally {
      setLoadingRoutes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to register bus');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSubmitError(null);
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Registration Number"
              value={formData.registrationNumber}
              onChange={(e) => handleChange('registrationNumber', e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Bus ID (optional)"
              value={formData.busId || ''}
              onChange={(e) => handleChange('busId', e.target.value)}
              fullWidth
            />

            <TextField
              label="Tracker IMEI"
              value={formData.trackerImei || ''}
              onChange={(e) => handleChange('trackerImei', e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Driver ID (optional)"
              value={(formData as any).driverId || ''}
              onChange={(e) => handleChange('driverId', e.target.value)}
              fullWidth
            />

            <TextField
              label="Driver Name (optional)"
              value={(formData as any).driverName || ''}
              onChange={(e) => handleChange('driverName', e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Bus Number (optional)</InputLabel>
              <Select
                label="Bus Number (optional)"
                value={formData.busNumber || ''}
                onChange={(e) => handleChange('busNumber', e.target.value || undefined)}
              >
                <MenuItem value="">None</MenuItem>
                {companyBusNumbers.map(n => (
                  <MenuItem key={n} value={n}>{n}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Route (optional)</InputLabel>
              <Select
                label="Route (optional)"
                value={formData.route || ''}
                onChange={(e) => {
                  const selectedRoute = dynamicRoutes.find(r => r.routeName === e.target.value);
                  if (selectedRoute) {
                    handleRouteChange(selectedRoute.id, selectedRoute.routeName);
                  } else {
                    handleRouteChange(undefined, undefined);
                  }
                }}
                disabled={loadingRoutes}
              >
                <MenuItem value="">
                  {loadingRoutes ? 'Loading routes...' : 'None'}
                </MenuItem>
                {dynamicRoutes.map(route => (
                  <MenuItem key={route.id} value={route.routeName}>
                    {route.routeName} ({route.direction})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Model"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              required
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Year"
                type="number"
                value={formData.year}
                onChange={(e) => handleChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
                required
                sx={{ flex: 1 }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as any)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} /> : null}>
            {isSubmitting ? 'Saving...' : 'Save Registered Bus'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RegisteredBusForm;

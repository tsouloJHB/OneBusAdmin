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
  Alert,
  Typography
} from '@mui/material';
import { RegisteredBusFormData, RegisteredBus } from '../../types/busCompany';
import { Tracker } from '../../types';
import { Driver } from '../../types/driver';
import { busCompanyService } from '../../services/busCompanyService';
import { driverService } from '../../services/driverService';
import { registeredBusToFormData } from '../../utils/busCompanyUtils';
import { ImeiSelector } from '../ui';

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
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [autoSetInactive, setAutoSetInactive] = useState(false);
  const [companyDrivers, setCompanyDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

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

      // Check if status should be auto-managed based on IMEI
      const hasImei = transformedData.trackerImei && transformedData.trackerImei.trim() !== '';
      const isInactive = transformedData.status === 'inactive';
      setAutoSetInactive(!hasImei && isInactive);

      // Load routes for the selected bus number if it exists
      const busNumber = transformedData.busNumber;
      if (busNumber) {
        loadRoutesForBusNumber(busNumber);
      }
    } else {
      // Reset form for new registration
      setAutoSetInactive(false);
    }
  }, [initialData]);

  // Fetch drivers for the company
  useEffect(() => {
    const fetchDrivers = async () => {
      if (!companyId) return;
      
      setLoadingDrivers(true);
      try {
        const drivers = await driverService.getDriversByCompany(Number(companyId));
        setCompanyDrivers(drivers);
      } catch (error) {
        console.error('Failed to fetch drivers for company:', error);
        setCompanyDrivers([]);
      } finally {
        setLoadingDrivers(false);
      }
    };

    if (open) {
      fetchDrivers();
    }
  }, [companyId, open]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value } as RegisteredBusFormData;
      
      // Auto-set status based on IMEI presence
      if (field === 'trackerImei') {
        if (!value || value.trim() === '') {
          // No IMEI provided, set status to inactive
          newData.status = 'inactive';
          setAutoSetInactive(true);
        } else {
          // IMEI provided, allow user to set status (but don't auto-change if they manually set it)
          if (autoSetInactive && prev.status === 'inactive') {
            newData.status = 'active';
          }
          setAutoSetInactive(false);
        }
      }
      
      return newData;
    });
    
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

            <ImeiSelector
              value={formData.trackerImei || ''}
              onChange={(imei, tracker) => {
                handleChange('trackerImei', imei);
                setSelectedTracker(tracker || null);
              }}
              label="Tracker IMEI (Optional)"
              placeholder="Search trackers or enter IMEI... (Leave empty to register without tracker)"
              required={false} // Make IMEI optional
              fullWidth
            />

            {/* Info message about IMEI and status */}
            {(!formData.trackerImei || formData.trackerImei.trim() === '') && (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>No tracker assigned:</strong> Bus will be registered with "inactive" status. 
                  Add a tracker IMEI later to activate the bus for tracking.
                </Typography>
              </Alert>
            )}

            {selectedTracker && (
              <Box sx={{ p: 1.5, bgcolor: 'success.50', borderRadius: 1, border: 1, borderColor: 'success.200' }}>
                <Typography variant="body2" color="success.main" fontWeight="medium">
                  ✓ Tracker Selected: {selectedTracker.brand} {selectedTracker.model}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Status: {selectedTracker.status} • Purchase Date: {selectedTracker.purchaseDate || 'N/A'}
                </Typography>
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>Driver (optional)</InputLabel>
              <Select
                label="Driver (optional)"
                value={formData.driverId || ''}
                onChange={(e) => {
                  const selectedDriver = companyDrivers.find(d => d.driverId === e.target.value);
                  if (selectedDriver) {
                    handleChange('driverId', selectedDriver.driverId);
                    handleChange('driverName', selectedDriver.fullName);
                  } else {
                    handleChange('driverId', undefined);
                    handleChange('driverName', undefined);
                  }
                }}
                disabled={loadingDrivers}
              >
                <MenuItem value="">
                  {loadingDrivers ? 'Loading drivers...' : 'None'}
                </MenuItem>
                {companyDrivers.map(driver => (
                  <MenuItem key={driver.id} value={driver.driverId}>
                    {driver.fullName} ({driver.driverId}) - {driver.status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
                onChange={(e) => {
                  handleChange('status', e.target.value as any);
                  // If user manually changes status, disable auto-setting
                  if (e.target.value !== 'inactive' || (formData.trackerImei && formData.trackerImei.trim() !== '')) {
                    setAutoSetInactive(false);
                  }
                }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
              </Select>
              {autoSetInactive && formData.status === 'inactive' && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Status automatically set to "inactive" because no tracker IMEI is provided.
                </Typography>
              )}
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

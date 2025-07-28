import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Bus, CreateBusRequest, UpdateBusRequest, ApiError } from '../../types';
import { RetryComponent } from '../ui';

interface BusFormProps {
  bus?: Bus;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBusRequest | UpdateBusRequest) => Promise<void>;
  loading?: boolean;
}

// Validation schema
const busSchema = yup.object({
  busId: yup
    .string()
    .required('Bus ID is required')
    .min(3, 'Bus ID must be at least 3 characters')
    .max(50, 'Bus ID must not exceed 50 characters'),
  trackerImei: yup
    .string()
    .required('Tracker IMEI is required')
    .min(15, 'IMEI must be at least 15 characters')
    .max(17, 'IMEI must not exceed 17 characters')
    .matches(/^[0-9]+$/, 'IMEI must contain only numbers'),
  busNumber: yup
    .string()
    .required('Bus number is required')
    .min(1, 'Bus number must be at least 1 character')
    .max(20, 'Bus number must not exceed 20 characters'),
  route: yup
    .string()
    .required('Route is required')
    .min(2, 'Route must be at least 2 characters')
    .max(100, 'Route must not exceed 100 characters'),
  busCompany: yup
    .string()
    .required('Bus company is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters'),
  driverId: yup
    .string()
    .required('Driver ID is required')
    .min(2, 'Driver ID must be at least 2 characters')
    .max(50, 'Driver ID must not exceed 50 characters'),
  driverName: yup
    .string()
    .required('Driver name is required')
    .min(2, 'Driver name must be at least 2 characters')
    .max(100, 'Driver name must not exceed 100 characters'),
});

interface BusFormData {
  busId: string;
  trackerImei: string;
  busNumber: string;
  route: string;
  busCompany: string;
  driverId: string;
  driverName: string;
}

const BusForm: React.FC<BusFormProps> = ({
  bus,
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [submitError, setSubmitError] = useState<ApiError | null>(null);
  // Removed route loading logic since backend doesn't need it

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<BusFormData>({
    resolver: yupResolver(busSchema) as any,
    defaultValues: {
      busId: '',
      trackerImei: '',
      busNumber: '',
      route: '',
      busCompany: '',
      driverId: '',
      driverName: '',
    },
    mode: 'onChange',
  });



  // Route loading removed since backend doesn't need it

  // Reset form when bus changes or dialog opens
  useEffect(() => {
    if (open) {
      if (bus) {
        reset({
          busId: bus.id,
          trackerImei: bus.trackerImei || '',
          busNumber: bus.busNumber,
          route: bus.assignedRouteId || '',
          busCompany: bus.busCompany || '',
          driverId: bus.driverId || '',
          driverName: bus.driverName || '',
        });
      } else {
        reset({
          busId: '',
          trackerImei: '',
          busNumber: '',
          route: '',
          busCompany: '',
          driverId: '',
          driverName: '',
        });
      }
      setSubmitError(null);
    }
  }, [bus, open, reset]);

  const handleFormSubmit = async (data: BusFormData) => {
    try {
      setSubmitError(null);
      
      const formattedData = {
        ...data,
      };

      if (bus) {
        await onSubmit({ ...formattedData, busId: bus.id } as UpdateBusRequest);
      } else {
        await onSubmit(formattedData as CreateBusRequest);
      }
      
      onClose();
    } catch (error) {
      setSubmitError(error as ApiError);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const getStatusColor = (status: Bus['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'retired':
        return 'error';
      default:
        return 'default';
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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      aria-labelledby="bus-form-title"
      aria-describedby="bus-form-description"
      PaperProps={{
        sx: { 
          minHeight: { xs: '90vh', sm: '70vh' },
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: 'calc(100vh - 16px)', sm: 'calc(100vh - 64px)' },
        },
      }}
    >
      {/* Loading backdrop for form submission */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography variant="body2">
            {bus ? 'Updating bus...' : 'Creating bus...'}
          </Typography>
        </Box>
      </Backdrop>

      <DialogTitle 
        id="bus-form-title"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <BusIcon color="primary" aria-hidden="true" />
        {bus ? 'Edit Bus' : 'Add New Bus'}
      </DialogTitle>
      
      <DialogContent dividers>
        <Box 
          component="form" 
          sx={{ mt: 1 }}
          role="form"
          aria-labelledby="bus-form-title"
        >
          {submitError && (
            <RetryComponent
              error={submitError}
              onRetry={() => setSubmitError(null)}
              variant="banner"
            />
          )}

          {/* Basic Information */}
          <Card sx={{ mb: 3 }} role="group" aria-labelledby="basic-info-title">
            <CardHeader 
              title="Basic Information" 
              titleTypographyProps={{ id: 'basic-info-title' }}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="busId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Bus ID"
                        fullWidth
                        required
                        error={!!errors.busId}
                        helperText={errors.busId?.message || 'Unique identifier for the bus (e.g., bus1)'}
                        disabled={loading}
                        placeholder="bus1"
                        inputProps={{
                          'aria-label': 'Bus ID',
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="busNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Bus Number"
                        fullWidth
                        required
                        error={!!errors.busNumber}
                        helperText={errors.busNumber?.message || 'Display number for the bus (e.g., B001)'}
                        disabled={loading}
                        placeholder="B001"
                        inputProps={{
                          'aria-label': 'Bus number',
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={12}>
                  <Controller
                    name="trackerImei"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Tracker IMEI"
                        fullWidth
                        required
                        error={!!errors.trackerImei}
                        helperText={errors.trackerImei?.message || '15-17 digit IMEI number'}
                        disabled={loading}
                        placeholder="359339072173798"
                        inputProps={{
                          'aria-label': 'Tracker IMEI',
                          inputMode: 'numeric',
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={12}>
                  <Controller
                    name="route"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Route"
                        fullWidth
                        required
                        error={!!errors.route}
                        helperText={errors.route?.message || 'Route description (e.g., JHB-PTA)'}
                        disabled={loading}
                        placeholder="JHB-PTA"
                        inputProps={{
                          'aria-label': 'Route',
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={12}>
                  <Controller
                    name="busCompany"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Bus Company"
                        fullWidth
                        required
                        error={!!errors.busCompany}
                        helperText={errors.busCompany?.message || 'Company operating the bus'}
                        disabled={loading}
                        placeholder="OneBus Co"
                        inputProps={{
                          'aria-label': 'Bus company',
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="driverId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Driver ID"
                        fullWidth
                        required
                        error={!!errors.driverId}
                        helperText={errors.driverId?.message || 'Unique driver identifier'}
                        disabled={loading}
                        placeholder="D001"
                        inputProps={{
                          'aria-label': 'Driver ID',
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="driverName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Driver Name"
                        fullWidth
                        required
                        error={!!errors.driverName}
                        helperText={errors.driverName?.message || 'Full name of the driver'}
                        disabled={loading}
                        placeholder="John Doe"
                        inputProps={{
                          'aria-label': 'Driver name',
                        }}
                      />
                    )}
                  />
                </Grid>
                

              </Grid>
            </CardContent>
          </Card>


        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={loading || !isValid}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Saving...' : bus ? 'Update Bus' : 'Add Bus'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BusForm;
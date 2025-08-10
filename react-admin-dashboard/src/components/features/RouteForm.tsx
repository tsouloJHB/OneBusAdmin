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
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import {
  Route as RouteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Route, CreateRouteRequest, UpdateRouteRequest, ApiError } from '../../types';
import { RetryComponent } from '../ui';

interface RouteFormProps {
  route?: Route;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRouteRequest | UpdateRouteRequest) => Promise<void>;
  loading?: boolean;
}



// Validation schema
const routeSchema = yup.object({
  company: yup
    .string()
    .required('Company is required')
    .min(2, 'Company must be at least 2 characters')
    .max(100, 'Company must not exceed 100 characters'),
  busNumber: yup
    .string()
    .required('Bus number is required')
    .min(1, 'Bus number must be at least 1 character')
    .max(20, 'Bus number must not exceed 20 characters'),
  routeName: yup
    .string()
    .required('Route name is required')
    .min(2, 'Route name must be at least 2 characters')
    .max(100, 'Route name must not exceed 100 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description must not exceed 500 characters'),
  direction: yup
    .string()
    .required('Direction is required')
    .oneOf(['Northbound', 'Southbound', 'Eastbound', 'Westbound', 'Inbound', 'Outbound'], 'Please select a valid direction'),
  startPoint: yup
    .string()
    .required('Start point is required')
    .min(2, 'Start point must be at least 2 characters')
    .max(100, 'Start point must not exceed 100 characters'),
  endPoint: yup
    .string()
    .required('End point is required')
    .min(2, 'End point must be at least 2 characters')
    .max(100, 'End point must not exceed 100 characters'),
  active: yup.boolean().required(),
});

interface RouteFormData {
  company: string;
  busNumber: string;
  routeName: string;
  description: string;
  direction: string;
  startPoint: string;
  endPoint: string;
  active: boolean;
}

const RouteForm: React.FC<RouteFormProps> = ({
  route,
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [submitError, setSubmitError] = useState<ApiError | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<RouteFormData>({
    resolver: yupResolver(routeSchema),
    defaultValues: {
      company: '',
      busNumber: '',
      routeName: '',
      description: '',
      direction: '',
      startPoint: '',
      endPoint: '',
      active: true,
    },
    mode: 'onChange',
  });

  // Direction options
  const directionOptions = [
    'Northbound',
    'Southbound', 
    'Eastbound',
    'Westbound',
    'Inbound',
    'Outbound'
  ];

  // Reset form when route changes or dialog opens
  useEffect(() => {
    if (open) {
      if (route) {
        // For editing existing routes, map from Route to RouteFormData
        reset({
          company: 'SimulatedCo', // Default company for now
          busNumber: '', // This would need to come from route data
          routeName: route.name,
          description: 'Route description', // Default description for now
          direction: 'Northbound', // Default direction for now
          startPoint: route.startPoint,
          endPoint: route.endPoint,
          active: route.isActive,
        });
      } else {
        reset({
          company: '',
          busNumber: '',
          routeName: '',
          description: '',
          direction: '',
          startPoint: '',
          endPoint: '',
          active: true,
        });
      }
      setSubmitError(null);
    }
  }, [route, open, reset]);

  const handleFormSubmit = async (data: RouteFormData) => {
    try {
      setSubmitError(null);
      
      console.log('RouteForm: Submitting form data:', data);

      if (route) {
        await onSubmit({ ...data, id: route.id } as UpdateRouteRequest);
      } else {
        await onSubmit(data as CreateRouteRequest);
      }
      
      onClose();
    } catch (error) {
      console.error('RouteForm: Form submission error:', error);
      setSubmitError(error as ApiError);
    }
  };

  // Remove unused handlers since we're not managing stops and schedules in this form anymore

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' },
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
            {route ? 'Updating route...' : 'Creating route...'}
          </Typography>
        </Box>
      </Backdrop>

      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <RouteIcon color="primary" />
        {route ? 'Edit Route' : 'Create New Route'}
      </DialogTitle>
        
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 1 }}>
            {submitError && (
              <RetryComponent
                error={submitError}
                onRetry={() => setSubmitError(null)}
                variant="banner"
              />
            )}

            {/* Route Information */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Route Information" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="company"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Company"
                          fullWidth
                          error={!!errors.company}
                          helperText={errors.company?.message}
                          disabled={loading}
                          placeholder="e.g., SimulatedCo"
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
                          error={!!errors.busNumber}
                          helperText={errors.busNumber?.message}
                          disabled={loading}
                          placeholder="e.g., C5"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid size={12}>
                    <Controller
                      name="routeName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Route Name"
                          fullWidth
                          error={!!errors.routeName}
                          helperText={errors.routeName?.message}
                          disabled={loading}
                          placeholder="e.g., C5 Working Test"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid size={12}>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Description"
                          fullWidth
                          multiline
                          rows={3}
                          error={!!errors.description}
                          helperText={errors.description?.message}
                          disabled={loading}
                          placeholder="e.g., Testing after fixing H2 scope issue"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="direction"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.direction}>
                          <InputLabel>Direction</InputLabel>
                          <Select
                            {...field}
                            label="Direction"
                            disabled={loading}
                          >
                            {directionOptions.map((direction) => (
                              <MenuItem key={direction} value={direction}>
                                {direction}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.direction && (
                            <FormHelperText>{errors.direction.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="active"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={field.onChange}
                              disabled={loading}
                            />
                          }
                          label="Active Route"
                          sx={{ mt: 2 }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Location Information" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="startPoint"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Start Point"
                          fullWidth
                          error={!!errors.startPoint}
                          helperText={errors.startPoint?.message}
                          disabled={loading}
                          placeholder="e.g., Johannesburg CBD"
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="endPoint"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="End Point"
                          fullWidth
                          error={!!errors.endPoint}
                          helperText={errors.endPoint?.message}
                          disabled={loading}
                          placeholder="e.g., Sandton City"
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
            {loading ? 'Saving...' : route ? 'Update Route' : 'Create Route'}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default RouteForm;
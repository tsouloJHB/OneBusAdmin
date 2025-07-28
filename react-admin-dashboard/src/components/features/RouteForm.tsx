import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Route as RouteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
// Removed date picker imports to avoid test issues - using regular time inputs instead
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Route, Stop, Schedule, CreateRouteRequest, UpdateRouteRequest, ApiError } from '../../types';
import { RetryComponent } from '../ui';

interface RouteFormProps {
  route?: Route;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRouteRequest | UpdateRouteRequest) => Promise<void>;
  loading?: boolean;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Validation schema
const routeSchema = yup.object({
  name: yup
    .string()
    .required('Route name is required')
    .min(2, 'Route name must be at least 2 characters')
    .max(100, 'Route name must not exceed 100 characters'),
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
  isActive: yup.boolean().required(),
  stops: yup
    .array()
    .of(
      yup.object({
        name: yup
          .string()
          .required('Stop name is required')
          .min(2, 'Stop name must be at least 2 characters')
          .max(100, 'Stop name must not exceed 100 characters'),
        coordinates: yup.object({
          lat: yup
            .number()
            .required('Latitude is required')
            .min(-90, 'Latitude must be between -90 and 90')
            .max(90, 'Latitude must be between -90 and 90'),
          lng: yup
            .number()
            .required('Longitude is required')
            .min(-180, 'Longitude must be between -180 and 180')
            .max(180, 'Longitude must be between -180 and 180'),
        }),
        order: yup.number().required().min(1),
      })
    )
    .optional(),
  schedule: yup
    .array()
    .of(
      yup.object({
        departureTime: yup.string().required('Departure time is required'),
        arrivalTime: yup.string().required('Arrival time is required'),
        daysOfWeek: yup
          .array()
          .of(yup.string().required())
          .min(1, 'At least one day must be selected'),
      })
    )
    .optional(),
});

interface RouteFormData {
  name: string;
  startPoint: string;
  endPoint: string;
  isActive: boolean;
  stops: Array<{
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    order: number;
  }>;
  schedule: Array<{
    departureTime: string;
    arrivalTime: string;
    daysOfWeek: string[];
  }>;
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
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<RouteFormData>({
    defaultValues: {
      name: '',
      startPoint: '',
      endPoint: '',
      isActive: true,
      stops: [],
      schedule: [
        {
          departureTime: '08:00',
          arrivalTime: '09:00',
          daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        },
      ],
    },
    mode: 'onChange',
  });

  const {
    fields: stopFields,
    append: appendStop,
    remove: removeStop,
    move: moveStop,
  } = useFieldArray({
    control,
    name: 'stops',
  });

  const {
    fields: scheduleFields,
    append: appendSchedule,
    remove: removeSchedule,
  } = useFieldArray({
    control,
    name: 'schedule',
  });

  // Reset form when route changes or dialog opens
  useEffect(() => {
    if (open) {
      if (route) {
        reset({
          name: route.name,
          startPoint: route.startPoint,
          endPoint: route.endPoint,
          isActive: route.isActive,
          stops: route.stops.map((stop) => ({
            name: stop.name,
            coordinates: stop.coordinates,
            order: stop.order,
          })),
          schedule: route.schedule.map((sched) => ({
            departureTime: sched.departureTime,
            arrivalTime: sched.arrivalTime,
            daysOfWeek: sched.daysOfWeek,
          })),
        });
      } else {
        reset({
          name: '',
          startPoint: '',
          endPoint: '',
          isActive: true,
          stops: [],
          schedule: [
            {
              departureTime: '08:00',
              arrivalTime: '09:00',
              daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            },
          ],
        });
      }
      setSubmitError(null);
    }
  }, [route, open, reset]);

  const handleFormSubmit = async (data: RouteFormData) => {
    try {
      setSubmitError(null);
      
      const formattedData = {
        ...data,
        stops: data.stops.map((stop, index) => ({
          ...stop,
          order: index + 1,
        })),
      };

      if (route) {
        await onSubmit({ ...formattedData, id: route.id } as UpdateRouteRequest);
      } else {
        await onSubmit(formattedData as CreateRouteRequest);
      }
      
      onClose();
    } catch (error) {
      setSubmitError(error as ApiError);
    }
  };

  const handleAddStop = () => {
    appendStop({
      name: '',
      coordinates: { lat: 0, lng: 0 },
      order: stopFields.length + 1,
    });
  };

  const handleAddSchedule = () => {
    appendSchedule({
      departureTime: '08:00',
      arrivalTime: '09:00',
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    });
  };

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

            {/* Basic Information */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Basic Information" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Route Name"
                          fullWidth
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          disabled={loading}
                        />
                      )}
                    />
                  </Grid>
                  
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
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid size={12}>
                    <Controller
                      name="isActive"
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
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Stops Management */}
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Stops"
                action={
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddStop}
                    disabled={loading}
                    size="small"
                  >
                    Add Stop
                  </Button>
                }
              />
              <CardContent>
                {stopFields.length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                    No stops added yet. Click "Add Stop" to add your first stop.
                  </Typography>
                ) : (
                  stopFields.map((field, index) => (
                    <Box key={field.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                          Stop {index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => removeStop(index)}
                          disabled={loading}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid size={12}>
                          <Controller
                            name={`stops.${index}.name`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Stop Name"
                                fullWidth
                                error={!!errors.stops?.[index]?.name}
                                helperText={errors.stops?.[index]?.name?.message}
                                disabled={loading}
                              />
                            )}
                          />
                        </Grid>
                        
                        <Grid size={6}>
                          <Controller
                            name={`stops.${index}.coordinates.lat`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Latitude"
                                type="number"
                                fullWidth
                                error={!!errors.stops?.[index]?.coordinates?.lat}
                                helperText={errors.stops?.[index]?.coordinates?.lat?.message}
                                disabled={loading}
                                inputProps={{ step: 'any' }}
                              />
                            )}
                          />
                        </Grid>
                        
                        <Grid size={6}>
                          <Controller
                            name={`stops.${index}.coordinates.lng`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Longitude"
                                type="number"
                                fullWidth
                                error={!!errors.stops?.[index]?.coordinates?.lng}
                                helperText={errors.stops?.[index]?.coordinates?.lng?.message}
                                disabled={loading}
                                inputProps={{ step: 'any' }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Schedule Management */}
            <Card>
              <CardHeader
                title="Schedule"
                action={
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddSchedule}
                    disabled={loading}
                    size="small"
                  >
                    Add Schedule
                  </Button>
                }
              />
              <CardContent>
                {scheduleFields.map((field, index) => (
                  <Box key={field.id} sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                        Schedule {index + 1}
                      </Typography>
                      {scheduleFields.length > 1 && (
                        <IconButton
                          onClick={() => removeSchedule(index)}
                          disabled={loading}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <Controller
                          name={`schedule.${index}.departureTime`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Departure Time"
                              type="time"
                              fullWidth
                              error={!!errors.schedule?.[index]?.departureTime}
                              helperText={errors.schedule?.[index]?.departureTime?.message}
                              disabled={loading}
                              InputLabelProps={{ shrink: true }}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid size={6}>
                        <Controller
                          name={`schedule.${index}.arrivalTime`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Arrival Time"
                              type="time"
                              fullWidth
                              error={!!errors.schedule?.[index]?.arrivalTime}
                              helperText={errors.schedule?.[index]?.arrivalTime?.message}
                              disabled={loading}
                              InputLabelProps={{ shrink: true }}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid size={12}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Days of Week
                        </Typography>
                        <Controller
                          name={`schedule.${index}.daysOfWeek`}
                          control={control}
                          render={({ field }) => (
                            <Box>
                              {DAYS_OF_WEEK.map((day) => (
                                <FormControlLabel
                                  key={day}
                                  control={
                                    <Checkbox
                                      checked={field.value.includes(day)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          field.onChange([...field.value, day]);
                                        } else {
                                          field.onChange(field.value.filter((d) => d !== day));
                                        }
                                      }}
                                      disabled={loading}
                                    />
                                  }
                                  label={day}
                                />
                              ))}
                              {errors.schedule?.[index]?.daysOfWeek && (
                                <FormHelperText error>
                                  {errors.schedule[index]?.daysOfWeek?.message}
                                </FormHelperText>
                              )}
                            </Box>
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
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
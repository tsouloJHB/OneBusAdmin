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
import { busCompanyService } from '../../services';
import { BusCompany, BusNumber } from '../../types/busCompany';

interface RouteFormProps {
  route?: Route;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRouteRequest | UpdateRouteRequest) => Promise<void>;
  loading?: boolean;
}



// Validation schema
const routeSchema = yup.object({
  companyId: yup
    .string()
    .required('Company is required'),
  busNumberId: yup
    .string()
    .required('Bus number is required'),
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
  companyId: string;
  busNumberId: string;
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
  const [companies, setCompanies] = useState<BusCompany[]>([]);
  const [busNumbers, setBusNumbers] = useState<BusNumber[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingBusNumbers, setLoadingBusNumbers] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<RouteFormData>({
    resolver: yupResolver(routeSchema),
    defaultValues: {
      companyId: '',
      busNumberId: '',
      routeName: '',
      description: '',
      direction: '',
      startPoint: '',
      endPoint: '',
      active: true,
    },
    mode: 'onBlur',
  });

  // Watch companyId to load bus numbers when it changes
  const selectedCompanyId = watch('companyId');
  const selectedBusNumberId = watch('busNumberId');

  // Debug form state changes
  useEffect(() => {
    console.log('RouteForm: Form state changed - isValid:', isValid, 'errors:', Object.keys(errors));
  }, [isValid, errors]);

  // Direction options
  const directionOptions = [
    'Northbound',
    'Southbound', 
    'Eastbound',
    'Westbound',
    'Inbound',
    'Outbound'
  ];

  // Load companies when dialog opens
  useEffect(() => {
    if (open) {
      loadCompanies();
    }
  }, [open]);

  // Load bus numbers when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      loadBusNumbers(selectedCompanyId);
      // Reset bus number selection when company changes
      setValue('busNumberId', '');
    } else {
      setBusNumbers([]);
    }
  }, [selectedCompanyId, setValue]);

  // Auto-populate start/end points when bus number changes
  useEffect(() => {
    if (selectedBusNumberId && busNumbers.length > 0) {
      const selectedBusNumber = busNumbers.find(b => b.id === selectedBusNumberId);
      if (selectedBusNumber) {
        console.log('RouteForm: Auto-populating from bus number:', selectedBusNumber);
        
        // Auto-populate start and end points
        setValue('startPoint', selectedBusNumber.startDestination);
        setValue('endPoint', selectedBusNumber.endDestination);
        
        // Also auto-populate route name and direction if they're empty
        const currentRouteName = watch('routeName');
        const currentDirection = watch('direction');
        
        if (!currentRouteName) {
          setValue('routeName', selectedBusNumber.routeName);
        }
        
        if (!currentDirection) {
          setValue('direction', selectedBusNumber.direction);
        }
        
        // Auto-populate description if it's empty
        const currentDescription = watch('description');
        if (!currentDescription) {
          setValue('description', selectedBusNumber.description || `Route from ${selectedBusNumber.startDestination} to ${selectedBusNumber.endDestination}`);
        }
        
        // Trigger validation after setting values
        setTimeout(() => {
          trigger(['startPoint', 'endPoint', 'routeName', 'direction', 'description']);
        }, 100);
      }
    }
  }, [selectedBusNumberId, busNumbers, setValue, watch, trigger]);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const companiesData = await busCompanyService.getAllCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading companies:', error);
      setSubmitError(error as ApiError);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadBusNumbers = async (companyId: string) => {
    try {
      setLoadingBusNumbers(true);
      const busNumbersData = await busCompanyService.getBusNumbersByCompany(companyId);
      setBusNumbers(busNumbersData);
    } catch (error) {
      console.error('Error loading bus numbers:', error);
      setSubmitError(error as ApiError);
    } finally {
      setLoadingBusNumbers(false);
    }
  };

  // Reset form when route changes or dialog opens
  useEffect(() => {
    if (open) {
      if (route) {
        // For editing existing routes, we need to find the company and bus number IDs
        // based on the route's company and busNumber strings
        const findCompanyAndBusNumber = async () => {
          try {
            // Load companies first
            await loadCompanies();
            
            // Find the company by name
            const matchingCompany = companies.find(c => c.name === route.company);
            const companyId = matchingCompany?.id || '';
            
            if (companyId) {
              // Load bus numbers for this company
              await loadBusNumbers(companyId);
              
              // Find the bus number by busNumber string
              const matchingBusNumber = busNumbers.find(b => b.busNumber === route.busNumber);
              const busNumberId = matchingBusNumber?.id || '';
              
              // Reset form with proper IDs
              reset({
                companyId: companyId,
                busNumberId: busNumberId,
                routeName: route.name,
                description: route.description || 'Route description',
                direction: route.direction || 'Northbound',
                startPoint: route.startPoint,
                endPoint: route.endPoint,
                active: route.isActive || route.active || true,
              });
            } else {
              // Fallback: reset with empty IDs if company not found
              reset({
                companyId: '',
                busNumberId: '',
                routeName: route.name,
                description: route.description || 'Route description',
                direction: route.direction || 'Northbound',
                startPoint: route.startPoint,
                endPoint: route.endPoint,
                active: route.isActive || route.active || true,
              });
            }
          } catch (error) {
            console.error('Error finding company and bus number for route:', error);
            // Fallback reset
            reset({
              companyId: '',
              busNumberId: '',
              routeName: route.name,
              description: route.description || 'Route description',
              direction: route.direction || 'Northbound',
              startPoint: route.startPoint,
              endPoint: route.endPoint,
              active: route.isActive || route.active || true,
            });
          }
        };
        
        findCompanyAndBusNumber();
      } else {
        reset({
          companyId: '',
          busNumberId: '',
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
  }, [route, open, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFormSubmit = async (data: RouteFormData) => {
    try {
      setSubmitError(null);
      
      console.log('RouteForm: Submitting form data:', data);

      // Find the selected company and bus number names
      const selectedCompany = companies.find(c => c.id === data.companyId);
      const selectedBusNumber = busNumbers.find(b => b.id === data.busNumberId);

      if (!selectedCompany || !selectedBusNumber) {
        throw new Error('Please select both company and bus number');
      }

      // Convert form data to the expected API format
      const apiData = {
        company: selectedCompany.name,
        busNumber: selectedBusNumber.busNumber,
        routeName: data.routeName,
        description: data.description,
        direction: data.direction,
        startPoint: data.startPoint,
        endPoint: data.endPoint,
        active: data.active,
      };

      console.log('RouteForm: Converted API data:', apiData);

      if (route) {
        await onSubmit({ ...apiData, id: route.id } as UpdateRouteRequest);
      } else {
        await onSubmit(apiData as CreateRouteRequest);
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
                      name="companyId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.companyId}>
                          <InputLabel>Company</InputLabel>
                          <Select
                            {...field}
                            label="Company"
                            disabled={loading || loadingCompanies}
                          >
                            {companies.map((company) => (
                              <MenuItem key={company.id} value={company.id}>
                                {company.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.companyId && (
                            <FormHelperText>{errors.companyId.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name="busNumberId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.busNumberId}>
                          <InputLabel>Bus Number</InputLabel>
                          <Select
                            {...field}
                            label="Bus Number"
                            disabled={loading || loadingBusNumbers || !selectedCompanyId}
                          >
                            {busNumbers.map((busNumber) => (
                              <MenuItem key={busNumber.id} value={busNumber.id}>
                                {busNumber.busNumber} - {busNumber.routeName}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.busNumberId && (
                            <FormHelperText>{errors.busNumberId.message}</FormHelperText>
                          )}
                          {!selectedCompanyId && (
                            <FormHelperText>Please select a company first</FormHelperText>
                          )}
                        </FormControl>
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
                          helperText={errors.routeName?.message || (selectedBusNumberId ? "Auto-filled from bus number" : "Enter route name")}
                          disabled={loading}
                          placeholder="e.g., C5 Working Test"
                          InputProps={{
                            ...field,
                            sx: selectedBusNumberId ? { 
                              backgroundColor: 'action.hover',
                              '& .MuiInputBase-input': { 
                                color: 'primary.main',
                                fontWeight: 'medium'
                              }
                            } : {}
                          }}
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
                          helperText={errors.description?.message || (selectedBusNumberId ? "Auto-filled from bus number" : "Enter description")}
                          disabled={loading}
                          placeholder="e.g., Testing after fixing H2 scope issue"
                          InputProps={{
                            ...field,
                            sx: selectedBusNumberId ? { 
                              backgroundColor: 'action.hover',
                              '& .MuiInputBase-input': { 
                                color: 'primary.main',
                                fontWeight: 'medium'
                              }
                            } : {}
                          }}
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
                            sx={selectedBusNumberId ? { 
                              backgroundColor: 'action.hover',
                              '& .MuiSelect-select': { 
                                color: 'primary.main',
                                fontWeight: 'medium'
                              }
                            } : {}}
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
                          {!errors.direction && selectedBusNumberId && (
                            <FormHelperText>Auto-filled from bus number</FormHelperText>
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
              <CardHeader 
                title="Location Information" 
                subheader={selectedBusNumberId ? "Auto-populated from selected bus number" : "Select a bus number to auto-populate"}
              />
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
                          helperText={errors.startPoint?.message || (selectedBusNumberId ? "Auto-filled from bus number" : "Enter start point")}
                          disabled={loading}
                          placeholder="e.g., Johannesburg CBD"
                          InputProps={{
                            ...field,
                            sx: selectedBusNumberId ? { 
                              backgroundColor: 'action.hover',
                              '& .MuiInputBase-input': { 
                                color: 'primary.main',
                                fontWeight: 'medium'
                              }
                            } : {}
                          }}
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
                          helperText={errors.endPoint?.message || (selectedBusNumberId ? "Auto-filled from bus number" : "Enter end point")}
                          disabled={loading}
                          placeholder="e.g., Sandton City"
                          InputProps={{
                            ...field,
                            sx: selectedBusNumberId ? { 
                              backgroundColor: 'action.hover',
                              '& .MuiInputBase-input': { 
                                color: 'primary.main',
                                fontWeight: 'medium'
                              }
                            } : {}
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
            onClick={() => {
              const formValues = watch();
              console.log('=== FORM DEBUG ===');
              console.log('Form values:', formValues);
              console.log('Form errors:', errors);
              console.log('Form isValid:', isValid);
              console.log('Selected company ID:', selectedCompanyId);
              console.log('Selected bus number ID:', selectedBusNumberId);
              console.log('==================');
            }}
            variant="outlined"
            size="small"
          >
            Debug Form
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
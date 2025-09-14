import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  InputAdornment
} from '@mui/material';
import { BusNumberFormData, ValidationResult } from '../../types/busCompany';
import { validateForm, busNumberValidationSchema } from '../../utils/busCompanyUtils';

interface BusNumberFormProps {
  open: boolean;
  onSubmit: (data: BusNumberFormData) => Promise<void>;
  onCancel: () => void;
  title: string;
  initialData?: Partial<BusNumberFormData>;
}

const BusNumberForm: React.FC<BusNumberFormProps> = ({
  open,
  onSubmit,
  onCancel,
  title,
  initialData
}) => {
  const [formData, setFormData] = useState<BusNumberFormData>({
    busNumber: '',
    routeName: '',
    description: '',
    startDestination: '',
    endDestination: '',
    direction: '',
    distanceKm: 0,
    estimatedDurationMinutes: 30,
    frequencyMinutes: 15,
    isActive: true
  });

  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  // Validate form on data change
  useEffect(() => {
    const result = validateForm(formData, busNumberValidationSchema);
    setValidation(result);
  }, [formData]);

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    console.log('=== BUS NUMBER FORM SUBMISSION ===');
    console.log('BusNumberForm: Form submission started');
    console.log('BusNumberForm: Form data:', formData);
    console.log('BusNumberForm: Validation result:', validation);
    console.log('BusNumberForm: Is valid:', validation.isValid);
    console.log('BusNumberForm: Validation errors:', validation.errors);
    
    if (!validation.isValid) {
      console.log('BusNumberForm: Form validation failed, not submitting');
      console.log('BusNumberForm: Specific validation errors:', Object.keys(validation.errors));
      return;
    }

    console.log('BusNumberForm: Validation passed, proceeding with submission');
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('BusNumberForm: Calling onSubmit with data:', formData);
      console.log('BusNumberForm: onSubmit function:', typeof onSubmit);
      await onSubmit(formData);
      console.log('BusNumberForm: onSubmit completed successfully');
      // Form will be closed by parent component
    } catch (error) {
      console.error('BusNumberForm: Submit error:', error);
      console.error('BusNumberForm: Error details:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save bus number');
    } finally {
      setIsSubmitting(false);
      console.log('=== BUS NUMBER FORM SUBMISSION END ===');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      busNumber: '',
      routeName: '',
      description: '',
      startDestination: '',
      endDestination: '',
      direction: '',
      distanceKm: 0,
      estimatedDurationMinutes: 30,
      frequencyMinutes: 15,
      isActive: true
    });
    setValidation({ isValid: true, errors: {} });
    setSubmitError(null);
    onCancel();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Row 1: Bus Number and Route Name */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Bus Number"
                  value={formData.busNumber}
                  onChange={(e) => handleInputChange('busNumber', e.target.value.toUpperCase())}
                  error={!!validation.errors.busNumber}
                  helperText={validation.errors.busNumber || 'Unique identifier for this bus'}
                  required
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Route Name"
                  value={formData.routeName}
                  onChange={(e) => handleInputChange('routeName', e.target.value)}
                  error={!!validation.errors.routeName}
                  helperText={validation.errors.routeName || 'Name of the route'}
                  required
                />
              </Box>
            </Box>

            {/* Row 2: Start and End Destinations */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Start Destination"
                  value={formData.startDestination}
                  onChange={(e) => handleInputChange('startDestination', e.target.value)}
                  error={!!validation.errors.startDestination}
                  helperText={validation.errors.startDestination}
                  required
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="End Destination"
                  value={formData.endDestination}
                  onChange={(e) => handleInputChange('endDestination', e.target.value)}
                  error={!!validation.errors.endDestination}
                  helperText={validation.errors.endDestination}
                  required
                />
              </Box>
            </Box>

            {/* Row 3: Direction and Distance */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Direction</InputLabel>
                  <Select
                    value={formData.direction}
                    onChange={(e) => handleInputChange('direction', e.target.value)}
                    label="Direction"
                    error={!!validation.errors.direction}
                  >
                    <MenuItem value="Northbound">Northbound</MenuItem>
                    <MenuItem value="Southbound">Southbound</MenuItem>
                    <MenuItem value="Eastbound">Eastbound</MenuItem>
                    <MenuItem value="Westbound">Westbound</MenuItem>
                    <MenuItem value="Inbound">Inbound</MenuItem>
                    <MenuItem value="Outbound">Outbound</MenuItem>
                    <MenuItem value="Clockwise">Clockwise</MenuItem>
                    <MenuItem value="Counter-clockwise">Counter-clockwise</MenuItem>
                  </Select>
                  {validation.errors.direction && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {validation.errors.direction}
                    </Typography>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Distance"
                  type="number"
                  value={formData.distanceKm}
                  onChange={(e) => handleInputChange('distanceKm', parseFloat(e.target.value) || 0)}
                  error={!!validation.errors.distanceKm}
                  helperText={validation.errors.distanceKm}
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">km</InputAdornment>,
                  }}
                  inputProps={{
                    min: 0.1,
                    max: 1000,
                    step: 0.1
                  }}
                />
              </Box>
            </Box>

            {/* Row 4: Duration and Frequency */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Estimated Duration"
                  type="number"
                  value={formData.estimatedDurationMinutes}
                  onChange={(e) => handleInputChange('estimatedDurationMinutes', parseInt(e.target.value) || 0)}
                  error={!!validation.errors.estimatedDurationMinutes}
                  helperText={validation.errors.estimatedDurationMinutes}
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                  }}
                  inputProps={{
                    min: 1,
                    max: 1440
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Frequency"
                  type="number"
                  value={formData.frequencyMinutes}
                  onChange={(e) => handleInputChange('frequencyMinutes', parseInt(e.target.value) || 0)}
                  error={!!validation.errors.frequencyMinutes}
                  helperText={validation.errors.frequencyMinutes || 'How often buses run on this route'}
                  required
                  InputProps={{
                    endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                  }}
                  inputProps={{
                    min: 1,
                    max: 1440
                  }}
                />
              </Box>
            </Box>

            {/* Row 5: Description */}
            <Box>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!validation.errors.description}
                helperText={validation.errors.description || 'Optional description of the route'}
                multiline
                rows={3}
              />
            </Box>

            {/* Row 6: Active Status */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                }
                label="Active"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                {formData.isActive ? 'This bus number is active and operational' : 'This bus number is inactive'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log('=== DEBUG BUTTON CLICKED ===');
              console.log('Current form data:', formData);
              console.log('Validation state:', validation);
              console.log('Is submitting:', isSubmitting);
            }}
            variant="outlined"
            size="small"
          >
            Debug Form
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Saving...' : 'Save Bus Number'}
          </Button>
          {!validation.isValid && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="error">
                Please fix validation errors before submitting
              </Typography>
              {Object.keys(validation.errors).length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="error" component="div">
                    Errors: {Object.keys(validation.errors).join(', ')}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BusNumberForm;
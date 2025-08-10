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
  CircularProgress
} from '@mui/material';
import { CompanyFormData, ValidationResult } from '../../types/busCompany';
import { validateForm, companyValidationSchema } from '../../utils/busCompanyUtils';

interface CompanyFormProps {
  open: boolean;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  onCancel: () => void;
  title: string;
  initialData?: Partial<CompanyFormData>;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  open,
  onSubmit,
  onCancel,
  title,
  initialData
}) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    registrationNumber: '',
    companyCode: '',
    city: '',
    address: '',
    contactInfo: {
      phone: '',
      email: ''
    },
    status: 'active'
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
        ...initialData,
        contactInfo: {
          ...prev.contactInfo,
          ...initialData.contactInfo
        }
      }));
    }
  }, [initialData]);

  // Validate form on data change
  useEffect(() => {
    const result = validateForm(formData, companyValidationSchema);
    setValidation(result);
  }, [formData]);

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CompanyFormData] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validation.isValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(formData);
      // Form will be closed by parent component
    } catch (error) {
      console.error('CompanyForm: Submit error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save company');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      name: '',
      registrationNumber: '',
      companyCode: '',
      city: '',
      address: '',
      contactInfo: {
        phone: '',
        email: ''
      },
      status: 'active'
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
            {/* Row 1: Company Name and Code */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!validation.errors.name}
                  helperText={validation.errors.name}
                  required
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Company Code"
                  value={formData.companyCode}
                  onChange={(e) => handleInputChange('companyCode', e.target.value.toUpperCase())}
                  error={!!validation.errors.companyCode}
                  helperText={validation.errors.companyCode || 'Uppercase letters only'}
                  required
                />
              </Box>
            </Box>

            {/* Row 2: Registration Number and Status */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value.toUpperCase())}
                  error={!!validation.errors.registrationNumber}
                  helperText={validation.errors.registrationNumber || 'Uppercase letters and numbers only'}
                  required
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Row 3: City and Address */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  error={!!validation.errors.city}
                  helperText={validation.errors.city}
                  required
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  error={!!validation.errors.address}
                  helperText={validation.errors.address}
                  multiline
                  rows={2}
                />
              </Box>
            </Box>

            {/* Contact Information Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.contactInfo?.phone || ''}
                    onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                    error={!!validation.errors['contactInfo.phone']}
                    helperText={validation.errors['contactInfo.phone']}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.contactInfo?.email || ''}
                    onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                    error={!!validation.errors['contactInfo.email']}
                    helperText={validation.errors['contactInfo.email']}
                  />
                </Box>
              </Box>
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
            type="submit"
            variant="contained"
            disabled={!validation.isValid || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Saving...' : 'Save Company'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CompanyForm;
import React, { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress,
  InputAdornment,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Router as TrackerIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Tracker } from '../../types';
import trackerService from '../../services/trackerService';
import { useDebounce } from '../../hooks/useDebounce';

interface ImeiSelectorProps {
  value?: string;
  onChange: (imei: string, tracker?: Tracker) => void;
  companyId?: number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  excludeBusId?: string; // Exclude current bus when editing
}

interface ValidationState {
  isValid: boolean;
  error: string | null;
  warning: string | null;
  tracker: Tracker | null;
}

export const ImeiSelector: React.FC<ImeiSelectorProps> = ({
  value = '',
  onChange,
  companyId,
  label = 'Tracker IMEI',
  placeholder = 'Search or enter IMEI...',
  required = false,
  disabled = false,
  error = false,
  helperText,
  fullWidth = true,
  excludeBusId,
}) => {
  const theme = useTheme();
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: true,
    error: null,
    warning: null,
    tracker: null,
  });
  const [validatingImei, setValidatingImei] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedValue = useDebounce(value, 500); // Debounce validation

  // Load available trackers on mount
  useEffect(() => {
    loadAvailableTrackers();
  }, [companyId]);

  // Search trackers when search query changes
  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.length >= 3) {
      searchTrackers(debouncedSearchQuery);
    } else if (debouncedSearchQuery === '') {
      loadAvailableTrackers();
    }
  }, [debouncedSearchQuery]);

  // Validate IMEI when value changes
  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 15) {
      validateImei(debouncedValue);
    } else {
      setValidationState({
        isValid: true,
        error: null,
        warning: null,
        tracker: null,
      });
    }
  }, [debouncedValue, excludeBusId]);

  // Find selected tracker when value changes
  useEffect(() => {
    if (value && trackers.length > 0) {
      const tracker = trackers.find(t => t.imei === value);
      setSelectedTracker(tracker || null);
    } else {
      setSelectedTracker(null);
    }
  }, [value, trackers]);

  const validateImei = useCallback(async (imei: string) => {
    if (!imei || imei.length < 15) {
      // If IMEI is empty and not required, that's valid
      if (!required && (!imei || imei.trim() === '')) {
        setValidationState({
          isValid: true,
          error: null,
          warning: null,
          tracker: null,
        });
        return;
      }
      
      setValidationState({
        isValid: true,
        error: null,
        warning: null,
        tracker: null,
      });
      return;
    }

    try {
      setValidatingImei(true);
      const tracker = await trackerService.getTrackerByImei(imei);
      
      // Check if tracker exists
      if (!tracker) {
        setValidationState({
          isValid: false,
          error: 'Tracker with this IMEI does not exist and needs to be registered before adding to a bus.',
          warning: null,
          tracker: null,
        });
        return;
      }

      // Check if tracker is already assigned to another bus
      if (tracker.status === 'IN_USE' && tracker.assignedBusId) {
        // If we're editing and it's assigned to the current bus, that's okay
        if (excludeBusId && tracker.assignedBusId.toString() === excludeBusId) {
          setValidationState({
            isValid: true,
            error: null,
            warning: `This tracker is currently assigned to this bus (${tracker.assignedBusNumber || tracker.assignedBusId}).`,
            tracker,
          });
        } else {
          setValidationState({
            isValid: false,
            error: `This tracker is already assigned to bus ${tracker.assignedBusNumber || tracker.assignedBusId} and cannot be assigned to another bus.`,
            warning: null,
            tracker,
          });
        }
        return;
      }

      // Check if tracker is available for assignment
      if (tracker.status === 'AVAILABLE') {
        setValidationState({
          isValid: true,
          error: null,
          warning: null,
          tracker,
        });
      } else if (tracker.status === 'MAINTENANCE') {
        setValidationState({
          isValid: false,
          error: null,
          warning: 'This tracker is currently under maintenance and may not be suitable for assignment.',
          tracker,
        });
      } else if (tracker.status === 'DAMAGED') {
        setValidationState({
          isValid: false,
          error: 'This tracker is marked as damaged and cannot be assigned to a bus.',
          warning: null,
          tracker,
        });
      } else if (tracker.status === 'RETIRED') {
        setValidationState({
          isValid: false,
          error: 'This tracker has been retired and cannot be assigned to a bus.',
          warning: null,
          tracker,
        });
      } else {
        setValidationState({
          isValid: true,
          error: null,
          warning: `Tracker status: ${tracker.status}`,
          tracker,
        });
      }

    } catch (error) {
      // If tracker not found, it doesn't exist
      setValidationState({
        isValid: false,
        error: 'Tracker with this IMEI does not exist and needs to be registered before adding to a bus.',
        warning: null,
        tracker: null,
      });
    } finally {
      setValidatingImei(false);
    }
  }, [excludeBusId]);

  const loadAvailableTrackers = useCallback(async () => {
    try {
      setLoading(true);
      const availableTrackers = await trackerService.getAvailableTrackers(companyId);
      setTrackers(availableTrackers);
    } catch (error) {
      console.error('Failed to load available trackers:', error);
      setTrackers([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const searchTrackers = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const searchResults = await trackerService.searchTrackers(query);
      // Filter by company if specified
      const filteredResults = companyId 
        ? searchResults.filter(t => t.companyId === companyId || t.status === 'AVAILABLE')
        : searchResults;
      setTrackers(filteredResults);
    } catch (error) {
      console.error('Failed to search trackers:', error);
      setTrackers([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setSearchQuery(newInputValue);
  };

  const handleSelectionChange = (event: React.SyntheticEvent, newValue: Tracker | string | null) => {
    if (typeof newValue === 'string') {
      // User typed a custom IMEI
      onChange(newValue, undefined);
      setSelectedTracker(null);
    } else if (newValue) {
      // User selected a tracker from dropdown
      onChange(newValue.imei, newValue);
      setSelectedTracker(newValue);
      // Set validation state for selected tracker
      setValidationState({
        isValid: newValue.status === 'AVAILABLE' || (newValue.status === 'IN_USE' && newValue.assignedBusId?.toString() === excludeBusId),
        error: null,
        warning: null,
        tracker: newValue,
      });
    } else {
      // Cleared selection
      onChange('', undefined);
      setSelectedTracker(null);
      setValidationState({
        isValid: true,
        error: null,
        warning: null,
        tracker: null,
      });
    }
  };

  const getStatusColor = (status: Tracker['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return theme.palette.success.main;
      case 'IN_USE':
        return theme.palette.warning.main;
      case 'MAINTENANCE':
        return theme.palette.info.main;
      case 'DAMAGED':
        return theme.palette.error.main;
      case 'RETIRED':
        return theme.palette.text.disabled;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getStatusLabel = (status: Tracker['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available';
      case 'IN_USE':
        return 'In Use';
      case 'MAINTENANCE':
        return 'Maintenance';
      case 'DAMAGED':
        return 'Damaged';
      case 'RETIRED':
        return 'Retired';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Autocomplete
        value={selectedTracker}
        onChange={handleSelectionChange}
        onInputChange={handleInputChange}
        inputValue={searchQuery || value}
        options={trackers}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return option.imei;
        }}
        isOptionEqualToValue={(option, value) => {
          if (typeof option === 'string' || typeof value === 'string') {
            return option === value;
          }
          return option.imei === value.imei;
        }}
        filterOptions={(options, { inputValue }) => {
          // If input looks like an IMEI (15+ digits), allow free input
          if (inputValue.length >= 15 && /^\d+$/.test(inputValue)) {
            const existingOption = options.find(option => option.imei === inputValue);
            if (!existingOption) {
              return [...options, inputValue as any];
            }
          }
          return options;
        }}
        freeSolo
        loading={loading}
        disabled={disabled}
        fullWidth={fullWidth}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required={required}
            error={error || !!validationState.error}
            helperText={validationState.error || validationState.warning || helperText}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <TrackerIcon color={error || validationState.error ? 'error' : 'action'} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {(loading || validatingImei) ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 1,
              },
            }}
          />
        )}
        renderOption={(props, option) => {
          if (typeof option === 'string') {
            return (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Use custom IMEI: {option}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Enter manually (will be validated)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          }

          const isAssigned = option.status === 'IN_USE' && option.assignedBusId;
          const isCurrentBus = excludeBusId && option.assignedBusId?.toString() === excludeBusId;

          return (
            <Box component="li" {...props}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <TrackerIcon 
                  sx={{ 
                    color: getStatusColor(option.status),
                    fontSize: 20,
                  }} 
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="medium" noWrap>
                      {option.imei}
                    </Typography>
                    <Chip
                      label={getStatusLabel(option.status)}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getStatusColor(option.status), 0.1),
                        color: getStatusColor(option.status),
                        fontSize: '0.6875rem',
                        height: 20,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {option.brand} {option.model}
                    {option.companyName && ` • ${option.companyName}`}
                    {isAssigned && !isCurrentBus && ` • Assigned to Bus ${option.assignedBusNumber || option.assignedBusId}`}
                  </Typography>
                </Box>
                {option.status === 'AVAILABLE' && (
                  <CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />
                )}
                {isAssigned && !isCurrentBus && (
                  <WarningIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                )}
              </Box>
            </Box>
          );
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={typeof option === 'string' ? option : option.imei}
              label={typeof option === 'string' ? option : option.imei}
              size="small"
            />
          ))
        }
        noOptionsText={
          searchQuery.length < 3 
            ? "Type at least 3 characters to search"
            : loading 
              ? "Searching..."
              : "No trackers found"
        }
        sx={{
          '& .MuiAutocomplete-listbox': {
            maxHeight: 300,
          },
          '& .MuiAutocomplete-option': {
            padding: 1.5,
          },
        }}
      />

      {/* Validation Messages */}
      {validationState.error && (
        <Alert 
          severity="error" 
          sx={{ mt: 1 }}
          icon={<ErrorIcon />}
        >
          {validationState.error}
        </Alert>
      )}

      {validationState.warning && !validationState.error && (
        <Alert 
          severity="warning" 
          sx={{ mt: 1 }}
          icon={<WarningIcon />}
        >
          {validationState.warning}
        </Alert>
      )}

      {/* Selected Tracker Info */}
      {selectedTracker && validationState.isValid && !validationState.error && (
        <Box sx={{ mt: 1, p: 1.5, bgcolor: 'success.50', borderRadius: 1, border: 1, borderColor: 'success.200' }}>
          <Typography variant="body2" color="success.main" fontWeight="medium">
            ✓ Tracker Selected: {selectedTracker.brand} {selectedTracker.model}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Status: {selectedTracker.status} • Purchase Date: {selectedTracker.purchaseDate || 'N/A'}
            {selectedTracker.assignedBusId && excludeBusId && selectedTracker.assignedBusId.toString() === excludeBusId && 
              ' • Currently assigned to this bus'
            }
          </Typography>
        </Box>
      )}

      {/* Validation State Info */}
      {validationState.tracker && !selectedTracker && validationState.isValid && (
        <Box sx={{ mt: 1, p: 1.5, bgcolor: 'success.50', borderRadius: 1, border: 1, borderColor: 'success.200' }}>
          <Typography variant="body2" color="success.main" fontWeight="medium">
            ✓ Valid Tracker: {validationState.tracker.brand} {validationState.tracker.model}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Status: {validationState.tracker.status} • Available for assignment
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ImeiSelector;
import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert, Button, CircularProgress } from '@mui/material';
import { config } from '../../config';

const GoogleMapsTest: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  const testApiKey = async () => {
    setStatus('loading');
    setError('');

    try {
      // Test the API key by making a simple request
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places`
      );
      
      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (config.googleMapsApiKey) {
      testApiKey();
    } else {
      setStatus('error');
      setError('No API key configured');
    }
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Google Maps API Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>API Key:</strong> {config.googleMapsApiKey ? 
            `${config.googleMapsApiKey.substring(0, 10)}...` : 
            'Not configured'
          }
        </Typography>
      </Box>

      {status === 'loading' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Testing API key...</Typography>
        </Box>
      )}

      {status === 'success' && (
        <Alert severity="success">
          Google Maps API key is valid and accessible!
        </Alert>
      )}

      {status === 'error' && (
        <Alert severity="error">
          <Typography variant="body2" gutterBottom>
            API Key Test Failed: {error}
          </Typography>
          <Typography variant="caption">
            Please check:
            <br />• API key is correct
            <br />• Maps JavaScript API is enabled
            <br />• API key has proper restrictions configured
            <br />• Billing is enabled for your Google Cloud project
          </Typography>
        </Alert>
      )}

      <Button 
        variant="outlined" 
        onClick={testApiKey} 
        sx={{ mt: 2 }}
        disabled={status === 'loading'}
      >
        Test Again
      </Button>
    </Box>
  );
};

export default GoogleMapsTest;
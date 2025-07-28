import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNotification } from '../../contexts';

const NotificationTestPage: React.FC = () => {
  const { showNotification } = useNotification();

  const handleShowSuccess = () => {
    showNotification('Operation completed successfully!', 'success');
  };

  const handleShowError = () => {
    showNotification('An error occurred while processing your request.', 'error');
  };

  const handleShowWarning = () => {
    showNotification('Please review your input before proceeding.', 'warning');
  };

  const handleShowInfo = () => {
    showNotification('This is an informational message.', 'info');
  };

  const handleShowPersistent = () => {
    showNotification('This notification will not auto-hide.', 'info', { autoHide: false });
  };

  const handleShowCustomDuration = () => {
    showNotification('This notification will hide after 10 seconds.', 'warning', { 
      autoHide: true, 
      duration: 10000 
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Notification System Test
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Click the buttons below to test different types of notifications:
      </Typography>

      <Stack spacing={2} direction="column" sx={{ maxWidth: 300 }}>
        <Button variant="contained" color="success" onClick={handleShowSuccess}>
          Show Success Notification
        </Button>
        
        <Button variant="contained" color="error" onClick={handleShowError}>
          Show Error Notification
        </Button>
        
        <Button variant="contained" color="warning" onClick={handleShowWarning}>
          Show Warning Notification
        </Button>
        
        <Button variant="contained" color="info" onClick={handleShowInfo}>
          Show Info Notification
        </Button>
        
        <Button variant="outlined" onClick={handleShowPersistent}>
          Show Persistent Notification
        </Button>
        
        <Button variant="outlined" onClick={handleShowCustomDuration}>
          Show Custom Duration (10s)
        </Button>
      </Stack>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Features:
        </Typography>
        <ul>
          <li>Auto-dismiss functionality (4s for success/info/warning, 6s for errors)</li>
          <li>Manual close options with close button</li>
          <li>Multiple notifications support</li>
          <li>Clear all notifications button when multiple are shown</li>
          <li>Different notification types (success, error, warning, info)</li>
          <li>Customizable duration and auto-hide behavior</li>
          <li>Responsive positioning (top-right corner)</li>
        </ul>
      </Box>
    </Box>
  );
};

export default NotificationTestPage;
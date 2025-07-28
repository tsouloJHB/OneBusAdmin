import React from 'react';
import { Snackbar, Alert, AlertTitle, Box, IconButton } from '@mui/material';
import { Close as CloseIcon, Clear as ClearAllIcon } from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationContainer: React.FC = () => {
  const { notifications, hideNotification, clearAllNotifications } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 400,
        width: '100%',
      }}
    >
      {/* Clear all button when multiple notifications */}
      {notifications.length > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton
            size="small"
            onClick={clearAllNotifications}
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
              },
            }}
            aria-label="Clear all notifications"
          >
            <ClearAllIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Individual notifications */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            position: 'relative',
            transform: 'none !important',
            left: 'auto !important',
            right: 'auto !important',
            top: 'auto !important',
            bottom: 'auto !important',
          }}
        >
          <Alert
            severity={notification.type}
            variant="filled"
            onClose={() => hideNotification(notification.id)}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => hideNotification(notification.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
            sx={{
              width: '100%',
              boxShadow: 3,
              '& .MuiAlert-message': {
                width: '100%',
                wordBreak: 'break-word',
              },
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default NotificationContainer;
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Save as SaveIcon,
  Done as DoneIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

export interface BatchModeHeaderProps {
  isActive: boolean;
  stopCount: number;
  isSaving?: boolean;
  onSaveAll?: () => void;
  onDone?: () => void;
  onClearAll?: () => void;
}

const BatchModeHeader: React.FC<BatchModeHeaderProps> = ({
  isActive,
  stopCount,
  isSaving = false,
  onSaveAll,
  onDone,
  onClearAll
}) => {
  if (!isActive) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: '#fff3e0',
        borderLeft: '4px solid #ff9800'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" color="primary">
            Batch Mode Active
          </Typography>
          <Chip
            label={`${stopCount} stop${stopCount !== 1 ? 's' : ''} in batch`}
            color="warning"
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {stopCount > 0 && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={onSaveAll}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save All Stops'}
              </Button>
              
              <Button
                variant="outlined"
                color="success"
                startIcon={<DoneIcon />}
                onClick={onDone}
                disabled={isSaving}
              >
                Done Adding
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<ClearIcon />}
                onClick={onClearAll}
                disabled={isSaving}
              >
                Clear All
              </Button>
            </>
          )}
          
          {stopCount === 0 && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<DoneIcon />}
              onClick={onDone}
            >
              Exit Batch Mode
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default BatchModeHeader;
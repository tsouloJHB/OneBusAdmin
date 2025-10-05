import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Alert,
  IconButton,
  Paper
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Business as CompanyIcon
} from '@mui/icons-material';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageChange,
  error,
  disabled = false
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Validate image file
  const validateImage = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, GIF, and WebP images are allowed';
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'Image size must be less than 10MB';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateImage(file);
    if (validationError) {
      onImageChange(null);
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageChange(file);
  }, [onImageChange]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle remove image
  const handleRemove = () => {
    setPreviewUrl(null);
    onImageChange(null);
  };

  // Get display image URL
  const getDisplayImageUrl = () => {
    if (previewUrl) return previewUrl;
    if (currentImageUrl) return currentImageUrl;
    return null;
  };

  const displayImageUrl = getDisplayImageUrl();

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Company Logo
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
        {/* Image Preview */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            src={displayImageUrl || undefined}
            sx={{ 
              width: 120, 
              height: 120, 
              mb: 1,
              bgcolor: 'grey.200'
            }}
          >
            {!displayImageUrl && <CompanyIcon sx={{ fontSize: 48, color: 'grey.400' }} />}
          </Avatar>

          {displayImageUrl && (
            <IconButton
              size="small"
              onClick={handleRemove}
              disabled={disabled}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        {/* Upload Area */}
        <Box sx={{ flex: 1 }}>
          <Paper
            sx={{
              border: dragOver ? '2px dashed #1976d2' : '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: disabled ? 'default' : 'pointer',
              backgroundColor: dragOver ? 'action.hover' : 'background.paper',
              transition: 'all 0.2s ease',
              '&:hover': disabled ? {} : {
                borderColor: '#1976d2',
                backgroundColor: 'action.hover'
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (!disabled) {
                const input = document.getElementById('image-upload-input') as HTMLInputElement;
                input?.click();
              }
            }}
          >
            <input
              id="image-upload-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
              onChange={handleInputChange}
              disabled={disabled}
            />

            <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            
            <Typography variant="h6" sx={{ mb: 1 }}>
              {dragOver ? 'Drop image here' : 'Upload Company Logo'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Drag and drop an image here, or click to select
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Supported formats: JPEG, PNG, GIF, WebP • Max size: 10MB
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                disabled={disabled}
                onClick={(e) => e.stopPropagation()}
              >
                Choose File
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ImageUpload;
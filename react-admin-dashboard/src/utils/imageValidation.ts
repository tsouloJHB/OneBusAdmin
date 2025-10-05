/**
 * Image validation utilities for bus company management
 */

export interface ImageValidationOptions {
  maxSizeInMB?: number;
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  details?: {
    size?: number;
    width?: number;
    height?: number;
    type?: string;
  };
}

// Default validation options
const DEFAULT_OPTIONS: ImageValidationOptions = {
  maxSizeInMB: 10,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  maxWidth: 2000,
  maxHeight: 2000,
  minWidth: 100,
  minHeight: 100,
};

/**
 * Validate an image file
 */
export const validateImageFile = async (
  file: File,
  options: ImageValidationOptions = {}
): Promise<ImageValidationResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Check file type
  if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${opts.allowedTypes.join(', ')}`,
      details: { type: file.type },
    };
  }

  // Check file size
  const sizeInMB = file.size / (1024 * 1024);
  if (opts.maxSizeInMB && sizeInMB > opts.maxSizeInMB) {
    return {
      isValid: false,
      error: `File size (${sizeInMB.toFixed(2)}MB) exceeds maximum allowed size of ${opts.maxSizeInMB}MB`,
      details: { size: file.size },
    };
  }

  // Check image dimensions (if specified)
  if (opts.maxWidth || opts.maxHeight || opts.minWidth || opts.minHeight) {
    try {
      const dimensions = await getImageDimensions(file);
      const { width, height } = dimensions;

      if (opts.maxWidth && width > opts.maxWidth) {
        return {
          isValid: false,
          error: `Image width (${width}px) exceeds maximum allowed width of ${opts.maxWidth}px`,
          details: { width, height },
        };
      }

      if (opts.maxHeight && height > opts.maxHeight) {
        return {
          isValid: false,
          error: `Image height (${height}px) exceeds maximum allowed height of ${opts.maxHeight}px`,
          details: { width, height },
        };
      }

      if (opts.minWidth && width < opts.minWidth) {
        return {
          isValid: false,
          error: `Image width (${width}px) is below minimum required width of ${opts.minWidth}px`,
          details: { width, height },
        };
      }

      if (opts.minHeight && height < opts.minHeight) {
        return {
          isValid: false,
          error: `Image height (${height}px) is below minimum required height of ${opts.minHeight}px`,
          details: { width, height },
        };
      }

      return {
        isValid: true,
        details: { size: file.size, width, height, type: file.type },
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to read image dimensions',
      };
    }
  }

  return {
    isValid: true,
    details: { size: file.size, type: file.type },
  };
};

/**
 * Get image dimensions from a file
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if a file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

/**
 * Generate a preview URL for an image file
 */
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Cleanup preview URL
 */
export const revokeImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Compress an image file
 */
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Image compression failed'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
};
# Bus Company Image Display Implementation

## Overview

This document outlines the implementation of image display functionality for bus companies in the React admin dashboard. The feature allows companies to upload and display their logos in the company management interface.

## Changes Made

### 1. Type Definitions Updated (`src/types/busCompany.ts`)

**Added image fields to `BusCompanyResponse` interface:**
```typescript
export interface BusCompanyResponse {
  // ... existing fields
  imagePath?: string;
  imageUrl?: string;
  // ... rest of fields
}
```

### 2. Data Transformation Updated (`src/utils/busCompanyUtils.ts`)

**Enhanced `transformBusCompanyResponse` function:**
- Added `imagePath` and `imageUrl` field mapping
- Added debug logging for image data transformation
- Ensures proper type safety with explicit `BusCompany` type annotation

```typescript
export const transformBusCompanyResponse = (response: BusCompanyResponse): BusCompany => {
  const transformed: BusCompany = {
    // ... other fields
    imagePath: response.imagePath,
    imageUrl: response.imageUrl,
    // ... rest of transformation
  };
  
  // Debug logging for image transformation
  if (response.imageUrl || response.imagePath) {
    console.log(`Transforming company ${response.name}:`, {
      imagePath: response.imagePath,
      imageUrl: response.imageUrl
    });
  }
  
  return transformed;
};
```

### 3. Company Card Component Enhanced (`src/components/company/CompanyCard.tsx`)

**Improved image display with:**
- Better error handling for broken images
- Visual indicator (green dot) when company has an image
- Enhanced styling with border for company images
- Debug logging for image URLs
- Proper fallback to company initials when no image is available

**Key Features:**
- **Avatar Display**: Uses `company.imageUrl` as the image source
- **Error Handling**: Gracefully handles broken images by falling back to initials
- **Visual Feedback**: Green dot indicator shows when a company has an image
- **Responsive Design**: Maintains consistent card layout with or without images

### 4. Image Upload Component (`src/components/common/ImageUpload.tsx`)

**Already fully functional with:**
- Drag and drop image upload
- Image preview with proper fallback
- File type and size validation (JPEG, PNG, GIF, WebP, max 10MB)
- Support for displaying existing company images via `currentImageUrl` prop

### 5. Company Form (`src/components/company/CompanyForm.tsx`)

**Already includes:**
- Integration with `ImageUpload` component
- Proper image handling in form data
- Image change handling via `handleImageChange` function

## Backend Integration

The React application now properly integrates with the Java backend's image handling:

### Backend Image Serving
- Backend serves images via constructed URLs using `FileStorageService.getImageUrl()`
- Images are served with proper MIME types and caching headers
- The `BusCompanyResponseDTO` includes both `imagePath` and `imageUrl` fields

### API Endpoints
- **GET** `/api/bus-companies` - Returns companies with image URLs
- **POST** `/api/bus-companies` - Create company with multipart form data for images
- **PUT** `/api/bus-companies/{id}` - Update company with optional new image

## How It Works

1. **Company Creation with Image:**
   - User uploads image in the company form
   - Image is sent as multipart form data to backend
   - Backend stores image file and returns `imagePath` and `imageUrl`
   - Frontend displays image in company cards

2. **Company Display:**
   - Company cards receive company data with `imageUrl`
   - Avatar component uses `imageUrl` as source
   - If image fails to load, falls back to company initials
   - Green dot indicator shows when image is available

3. **Company Editing:**
   - Form pre-populates with existing image via `currentImageUrl`
   - User can replace image or keep existing one
   - Updated image is sent to backend and new URL is returned

## Visual Features

### Company Card with Image
```
┌─────────────────────────────────┐
│ ┌─────┐                    ⋮    │
│ │ IMG │ Company Name • ←── Green dot (has image)
│ │     │ [Active]               │
│ └─────┘                        │
│ Code: ABC123                   │
│ Reg: REG456789                 │
│ City: Johannesburg             │
│ 📞 +27123456789               │
└─────────────────────────────────┘
```

### Company Card without Image
```
┌─────────────────────────────────┐
│ ┌─────┐                    ⋮    │
│ │ AB  │ Company Name        │
│ │     │ [Active]               │
│ └─────┘                        │
│ Code: ABC123                   │
│ Reg: REG456789                 │
│ City: Johannesburg             │
│ 📞 +27123456789               │
└─────────────────────────────────┘
```

## Testing

To verify the image functionality:

1. **Create a company with an image:**
   - Navigate to Bus Companies page
   - Click "Add Company"
   - Fill in company details
   - Upload a company logo
   - Save the company

2. **Verify image display:**
   - Check company appears in the list with the uploaded image
   - Verify green dot indicator is present
   - Check browser console for debug logs

3. **Test error handling:**
   - Create company with invalid image URL
   - Verify fallback to initials works properly

## Browser Console Debugging

The implementation includes debug logging to help troubleshoot:

```javascript
// Transformation debug logs
"Transforming company CompanyName: {imagePath: 'uploads/123.jpg', imageUrl: '/uploads/123.jpg'}"

// Component debug logs
"CompanyCard: CompanyName has imageUrl: http://localhost:8081/uploads/123.jpg"
"CompanyCard: CompanyName has imagePath: uploads/123.jpg"
```

## Future Enhancements

Potential improvements for the image functionality:

1. **Image Optimization:**
   - Thumbnail generation for better performance
   - WebP conversion for modern browsers
   - Lazy loading for large company lists

2. **Advanced Upload Features:**
   - Image cropping/editing interface
   - Multiple image support (logo, banner, etc.)
   - Batch image upload for multiple companies

3. **Performance Optimizations:**
   - Image caching strategies
   - Progressive image loading
   - CDN integration for image delivery

## Troubleshooting

### Common Issues

1. **Images not displaying:**
   - Check backend is serving images correctly
   - Verify CORS settings allow image requests
   - Check browser console for 404 errors

2. **Upload failing:**
   - Verify file size is under 10MB limit
   - Check file type is supported (JPEG, PNG, GIF, WebP)
   - Ensure backend endpoint is accessible

3. **Broken image icons:**
   - Check image URLs in API responses
   - Verify backend file storage service is working
   - Test direct access to image URLs
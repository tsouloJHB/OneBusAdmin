# Google Maps Integration Setup

## Overview
This document explains how to set up and use Google Maps in the React Admin Dashboard for route visualization and management.

## Prerequisites

### 1. Get Google Maps API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (optional, for place search)
   - Geocoding API (optional, for address conversion)
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure Environment Variables
Add your Google Maps API key to the `.env` file:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important**: Replace `your_actual_api_key_here` with your real Google Maps API key.

## Components

### GoogleMap Component
- **Location**: `src/components/ui/GoogleMap.tsx`
- **Purpose**: Base Google Maps wrapper component
- **Features**:
  - Map rendering with customizable center and zoom
  - Marker support
  - Click event handling
  - Loading and error states

### RouteMap Component
- **Location**: `src/components/features/RouteMap.tsx`
- **Purpose**: Specialized component for displaying bus routes
- **Features**:
  - Route visualization with stops
  - Fullscreen mode
  - User location detection
  - Route information display

## Usage Examples

### Basic Map
```tsx
import GoogleMap, { Marker } from '../ui/GoogleMap';

const MyComponent = () => {
  const center = { lat: -26.2041, lng: 28.0473 }; // Johannesburg
  
  return (
    <GoogleMap center={center} zoom={12} height={400}>
      <Marker 
        position={center} 
        title="Johannesburg CBD" 
      />
    </GoogleMap>
  );
};
```

### Route Map
```tsx
import { RouteMap } from '../features';

const RouteView = ({ route }) => {
  return (
    <RouteMap 
      route={route}
      height={500}
      showFullscreenButton={true}
      showLocationButton={true}
    />
  );
};
```

## Integration with Routes

### Current Implementation
- Routes page displays route data in table format
- Each route can have stops with coordinates
- RouteMap component visualizes routes on Google Maps

### Planned Features
- Click on route in table to view on map
- Interactive route editing
- Real-time bus tracking on routes
- Route optimization suggestions

## API Key Security

### Development
- Store API key in `.env` file (not committed to git)
- Use domain restrictions in Google Cloud Console

### Production
- Use environment variables in your deployment platform
- Implement proper API key restrictions
- Consider using backend proxy for sensitive operations

## Troubleshooting

### Common Issues

1. **"Failed to load Google Maps"**
   - Check if API key is correctly set in `.env`
   - Verify API key has proper permissions
   - Check browser console for specific error messages

2. **Map not displaying**
   - Ensure container has proper height/width
   - Check if Google Maps JavaScript API is enabled
   - Verify network connectivity

3. **Markers not showing**
   - Check coordinate format (lat/lng numbers)
   - Verify marker position is within map bounds
   - Check console for JavaScript errors

### Debug Mode
Add this to your component to debug map issues:

```tsx
const handleMapClick = (e: google.maps.MapMouseEvent) => {
  console.log('Map clicked at:', e.latLng?.toJSON());
};

<GoogleMap onClick={handleMapClick} ... />
```

## Next Steps

1. **Get your Google Maps API key** from Google Cloud Console
2. **Add it to your `.env` file**
3. **Test the integration** by viewing routes with map data
4. **Customize the map** styling and features as needed

## Cost Considerations

- Google Maps API has usage-based pricing
- Monitor usage in Google Cloud Console
- Consider implementing caching for static map data
- Use appropriate zoom levels to minimize API calls

## Support

For Google Maps API issues:
- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)

For implementation issues:
- Check browser console for errors
- Review component props and configuration
- Test with minimal example first
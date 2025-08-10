# Google Maps API Setup

The current Google Maps API key in the `.env` file appears to be a placeholder. To get the map functionality working, you need to:

## 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (if using places functionality)
4. Go to "Credentials" and create a new API key
5. Restrict the API key to your domain for security

## 2. Update the Environment File

Replace the placeholder API key in `.env`:

```env
# Replace this placeholder with your real API key
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

## 3. API Key Restrictions (Recommended)

For security, restrict your API key:
- **Application restrictions**: HTTP referrers (web sites)
- **Website restrictions**: Add your domain (e.g., `localhost:3000/*` for development)
- **API restrictions**: Limit to Maps JavaScript API and Places API

## 4. Billing

Google Maps requires a billing account to be set up, but they provide $200 of free usage per month, which is typically sufficient for development and small applications.

## 5. Testing

After updating the API key:
1. Restart your development server: `npm start`
2. Navigate to a route map page
3. The map should load without the "google is not defined" error

## Current Error Handling

The application now includes proper error handling for Google Maps loading:
- Shows a loading spinner while Google Maps API loads
- Displays an error message if loading fails after 10 seconds
- Prevents marker creation until Google Maps is fully loaded
- Graceful fallback when Google Maps is not available

## Troubleshooting

If you still see "google is not defined" errors:
1. Check browser console for API key errors
2. Verify the API key has the correct permissions
3. Ensure billing is enabled on your Google Cloud project
4. Check that the Maps JavaScript API is enabled
5. Try hard refreshing the page (Ctrl+F5 or Cmd+Shift+R)
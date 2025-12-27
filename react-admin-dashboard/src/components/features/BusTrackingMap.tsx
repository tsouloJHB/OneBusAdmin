import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// @ts-ignore
import { Client } from '@stomp/stompjs';
// @ts-ignore
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Paper, Typography, Chip, CircularProgress } from '@mui/material';
import { ActiveBus } from '../../types';

// Fix Leaflet default marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom bus marker icon
const createBusIcon = (status: ActiveBus['status']) => {
  const color = status === 'on_route' ? '#4caf50' : status === 'at_stop' ? '#2196f3' : '#ff9800';
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    ">🚌</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

interface BusLocation {
  busNumber: string;
  busCompany: string;
  direction: string;
  lat: number;
  lon: number;
  speedKmh: number;
  timestamp: string;
  status?: ActiveBus['status'];
  busId?: string;
  trackerImei?: string;
  driverId?: string;
  driverName?: string;
}

interface BusTrackingMapProps {
  buses: ActiveBus[];
  companyId?: string;
  autoCenter?: boolean;
}

// Component to handle map centering
const MapController: React.FC<{ buses: ActiveBus[]; autoCenter: boolean }> = ({ buses, autoCenter }) => {
  const map = useMap();

  useEffect(() => {
    if (autoCenter && buses.length > 0) {
      const bounds = L.latLngBounds(
        buses.map(bus => [bus.currentLocation.lat, bus.currentLocation.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [buses, autoCenter, map]);

  return null;
};

const BusTrackingMap: React.FC<BusTrackingMapProps> = ({ 
  buses, 
  companyId,
  autoCenter = true 
}) => {
  const [busLocations, setBusLocations] = useState<Map<string, BusLocation>>(new Map());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, any>>(new Map());
  const subscribedBusesRef = useRef<Set<string>>(new Set());

  // Default center (Johannesburg)
  const defaultCenter: [number, number] = [-26.2041, 28.0473];
  const defaultZoom = 12;

  // Initialize bus locations from props
  useEffect(() => {
    // Do not wipe existing markers when the upstream list is temporarily empty (e.g., API hiccup)
    if (!buses.length) return;

    setBusLocations((prev) => {
      const merged = new Map(prev);
      buses.forEach(bus => {
        const key = `${bus.bus.busNumber}_${bus.route.direction}`;
        merged.set(key, {
          busNumber: bus.bus.busNumber,
          busCompany: bus.bus.busCompany || companyId || '',
          direction: bus.route.direction || 'Unknown',
          lat: bus.currentLocation.lat,
          lon: bus.currentLocation.lng,
          speedKmh: 0,
          timestamp: new Date().toISOString(),
          status: bus.status,
          busId: bus.bus.id,
          trackerImei: bus.bus.trackerImei,
          driverId: bus.bus.driverId,
          driverName: bus.bus.driverName,
        });
      });
      return merged;
    });
  }, [buses, companyId]);

  // Setup WebSocket connection (once, independent of buses)
  useEffect(() => {
    const wsUrl = 'ws://localhost:8080/ws/bus-updates/websocket';
    
    console.log('[WebSocket] Initializing connection to:', wsUrl);
    setConnectionStatus('connecting');

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: (frame: any) => {
        console.log('[WebSocket] Connected successfully');
        setConnectionStatus('connected');
      },

      onStompError: (frame: any) => {
        console.error('[WebSocket] STOMP error:', frame);
        setConnectionStatus('disconnected');
      },

      onWebSocketError: (event: any) => {
        console.error('[WebSocket] WebSocket error:', event);
        setConnectionStatus('disconnected');
      },

      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        setConnectionStatus('disconnected');
        subscribedBusesRef.current.clear();
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      console.log('[WebSocket] Cleanup - disconnecting');
      const subs = subscriptionsRef.current;
      subs.forEach((sub) => sub.unsubscribe());
      subs.clear();
      subscribedBusesRef.current.clear();
      client.deactivate();
      stompClientRef.current = null;
    };
  }, []); // Only run once on mount

  // Handle bus subscriptions separately
  useEffect(() => {
    const client = stompClientRef.current;
    if (!client || !client.connected) {
      console.log('[WebSocket] Client not ready for subscriptions');
      return;
    }

    // If list is temporarily empty, keep existing subscriptions/markers until next non-empty update
    if (!buses.length) {
      return;
    }

    const currentBusKeys = new Set(
      buses.map(bus => `${bus.bus.busNumber}_${bus.route.direction}`)
    );

    // Unsubscribe from buses that are no longer in the list
    subscribedBusesRef.current.forEach(busKey => {
      if (!currentBusKeys.has(busKey)) {
        const topic = `/topic/bus/${busKey}`;
        const subscription = subscriptionsRef.current.get(topic);
        if (subscription) {
          console.log('[WebSocket] Unsubscribing from:', topic);
          subscription.unsubscribe();
          subscriptionsRef.current.delete(topic);
        }
        subscribedBusesRef.current.delete(busKey);
      }
    });

    // Subscribe to new buses
    buses.forEach(bus => {
      const busKey = `${bus.bus.busNumber}_${bus.route.direction}`;
      if (!subscribedBusesRef.current.has(busKey)) {
        const topic = `/topic/bus/${busKey}`;
        console.log('[WebSocket] Subscribing to:', topic);

        const subscription = client.subscribe(topic, (message: any) => {
          try {
            const data = JSON.parse(message.body);
            console.log('[WebSocket] Received update for', busKey, ':', data);

            const key = `${data.busNumber}_${data.tripDirection}`;
            setBusLocations(prev => {
              const newLocations = new Map(prev);
              const existing = prev.get(key);
              newLocations.set(key, {
                busNumber: data.busNumber,
                busCompany: data.busCompany || companyId || '',
                direction: data.tripDirection,
                lat: data.lat,
                lon: data.lon,
                speedKmh: data.speedKmh || 0,
                timestamp: data.timestamp,
                status: data.speedKmh < 1 ? 'at_stop' : 'on_route',
                busId: data.busId || existing?.busId,
                trackerImei: data.trackerImei || existing?.trackerImei,
                driverId: data.busDriverId || existing?.driverId,
                driverName: data.busDriver || existing?.driverName,
              });
              return newLocations;
            });
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        });

        subscriptionsRef.current.set(topic, subscription);
        subscribedBusesRef.current.add(busKey);

        // Send subscription message to backend
        client.publish({
          destination: '/app/subscribe',
          body: JSON.stringify({
            busNumber: bus.bus.busNumber,
            direction: bus.route.direction,
          }),
        });
      }
    });
  }, [buses, companyId]);

  const getStatusColor = (status?: ActiveBus['status']) => {
    switch (status) {
      case 'on_route': return 'success';
      case 'at_stop': return 'info';
      case 'delayed': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '600px', width: '100%' }}>
      {/* Connection Status */}
      <Paper
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {connectionStatus === 'connecting' && <CircularProgress size={16} />}
        <Chip
          label={connectionStatus === 'connected' ? 'Live' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
          color={connectionStatus === 'connected' ? 'success' : connectionStatus === 'connecting' ? 'warning' : 'error'}
          size="small"
        />
        <Typography variant="caption">
          {busLocations.size} bus{busLocations.size !== 1 ? 'es' : ''}
        </Typography>
      </Paper>

      {/* Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController buses={buses} autoCenter={autoCenter} />

        {/* Bus Markers */}
        {Array.from(busLocations.values()).map((location) => (
          <Marker
            key={`${location.busNumber}_${location.direction}`}
            position={[location.lat, location.lon]}
            icon={createBusIcon(location.status || 'on_route')}
          >
            <Popup>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  Bus {location.busNumber}
                </Typography>
                {location.busId && (
                  <Typography variant="caption" display="block">
                    ID: {location.busId}
                  </Typography>
                )}
                {location.trackerImei && (
                  <Typography variant="caption" display="block">
                    IMEI: {location.trackerImei}
                  </Typography>
                )}
                {location.driverName ? (
                  <Typography variant="caption" display="block">
                    Driver: {location.driverName}
                  </Typography>
                ) : location.driverId ? (
                  <Typography variant="caption" display="block">
                    Driver ID: {location.driverId}
                  </Typography>
                ) : null}
                <Typography variant="caption" display="block">
                  {location.busCompany}
                </Typography>
                <Typography variant="caption" display="block">
                  Direction: {location.direction}
                </Typography>
                <Typography variant="caption" display="block">
                  Speed: {location.speedKmh.toFixed(1)} km/h
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                </Typography>
                <Chip
                  label={location.status?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
                  color={getStatusColor(location.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default BusTrackingMap;

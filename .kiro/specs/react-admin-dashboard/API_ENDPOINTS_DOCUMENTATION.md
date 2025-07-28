# OneBus Backend API Endpoints Documentation

## Base URL

```
http://localhost:8080
```

## HTTP REST API Endpoints

### 1. Bus Tracking Operations

#### 1.1 Receive Bus Tracker Payload

**POST** `/api/tracker/payload`

**Description**: Receive real-time location data from bus trackers

**Request Body**:

```json
{
  "busId": "BUS-C5-001",
  "trackerImei": "123456789012345",
  "timestamp": "2025-07-25T10:30:00Z",
  "location": "POINT(28.0473 -26.2041)",
  "lat": -26.2041,
  "lon": 28.0473,
  "speedKmh": 45.5,
  "headingDegrees": 90.0,
  "headingCardinal": "EAST",
  "tripDirection": "INBOUND",
  "busNumber": "C5"
}
```

**Response**: `200 OK` (Empty body)

#### 1.2 Get Nearest Bus

**GET** `/api/buses/nearest`

**Query Parameters**:

- `lat` (required): Latitude coordinate (e.g., `-26.2041`)
- `lon` (required): Longitude coordinate (e.g., `28.0473`)
- `tripDirection` (required): Trip direction (e.g., `"INBOUND"`)

**Example Request**:

```
GET /api/buses/nearest?lat=-26.2041&lon=28.0473&tripDirection=INBOUND
```

**Response**: `200 OK`

```json
{
  "id": 1,
  "busId": "BUS-C5-001",
  "trackerImei": "123456789012345",
  "timestamp": "2025-07-25T10:30:00Z",
  "location": "POINT(28.0473 -26.2041)",
  "lat": -26.2041,
  "lon": 28.0473,
  "speedKmh": 45.5,
  "headingDegrees": 90.0,
  "headingCardinal": "EAST",
  "tripDirection": "INBOUND",
  "busNumber": "C5"
}
```

#### 1.3 Update Bus Details

**PUT** `/api/buses/{busId}`

**Path Parameters**:

- `busId` (required): Bus ID (e.g., `"BUS-C5-001"`)

**Request Body**:

```json
{
  "busId": "BUS-C5-001",
  "trackerImei": "123456789012345",
  "busNumber": "C5",
  "route": "C5 Route",
  "busCompany": "Rea Vaya",
  "driverId": "DRV001",
  "driverName": "John Doe"
}
```

**Response**: `200 OK` (Empty body)

#### 1.4 Get Bus Location

**GET** `/api/buses/{busNumber}/location`

**Path Parameters**:

- `busNumber` (required): Bus number (e.g., `"C5"`)

**Query Parameters**:

- `direction` (required): Direction of travel (e.g., `"INBOUND"`)

**Example Request**:

```
GET /api/buses/C5/location?direction=INBOUND
```

**Response**: `200 OK` (Same structure as BusLocation above)

#### 1.5 Get Active Buses

**GET** `/api/buses/active`

**Response**: `200 OK`

```json
["BUS-C5-001", "BUS-C5-002", "BUS-A1-003"]
```

#### 1.6 Clear Tracking Data

**POST** `/api/clear`

**Response**: `200 OK` (Empty body)

### 2. Bus Management

#### 2.1 Create Bus

**POST** `/api/buses`

**Request Body**:

```json
{
  "busId": "BUS-C5-001",
  "trackerImei": "123456789012345",
  "busNumber": "C5",
  "route": "C5 Route",
  "busCompany": "Rea Vaya",
  "driverId": "DRV001",
  "driverName": "John Doe"
}
```

**Response**: `200 OK`

```json
{
  "busId": "BUS-C5-001",
  "trackerImei": "123456789012345",
  "busNumber": "C5",
  "route": "C5 Route",
  "busCompany": "Rea Vaya",
  "driverId": "DRV001",
  "driverName": "John Doe"
}
```

### 3. Route Management

#### 3.1 Create Route

**POST** `/api/routes`

**Request Body**:

```json
{
  "company": "Rea Vaya",
  "busNumber": "C5",
  "routeName": "Johannesburg CBD to Soweto",
  "description": "Main route connecting CBD to Soweto townships",
  "active": true
}
```

**Response**: `200 OK`

```json
{
  "id": 1,
  "company": "Rea Vaya",
  "busNumber": "C5",
  "routeName": "Johannesburg CBD to Soweto",
  "description": "Main route connecting CBD to Soweto townships",
  "active": true,
  "stops": []
}
```

#### 3.2 Get All Routes

**GET** `/api/routes`

**Response**: `200 OK`

```json
[
  {
    "id": 1,
    "company": "Rea Vaya",
    "busNumber": "C5",
    "routeName": "Johannesburg CBD to Soweto",
    "description": "Main route connecting CBD to Soweto townships",
    "active": true,
    "stops": [...]
  }
]
```

#### 3.3 Get Single Route

**GET** `/api/routes/{routeId}`

**Path Parameters**:

- `routeId` (required): Route ID (e.g., `1`)

**Response**: `200 OK` (Same structure as route object above)

#### 3.4 Add Route Stop

**POST** `/api/routes/{routeId}/stops`

**Path Parameters**:

- `routeId` (required): Route ID (e.g., `1`)

**Request Body**:

```json
{
  "latitude": -26.2041,
  "longitude": 28.0473,
  "address": "Park Station, Johannesburg",
  "busStopIndex": 1,
  "direction": "Northbound",
  "type": "Bus station",
  "northboundIndex": 1,
  "southboundIndex": null
}
```

**Response**: `200 OK`

```json
{
  "id": 1,
  "latitude": -26.2041,
  "longitude": 28.0473,
  "address": "Park Station, Johannesburg",
  "busStopIndex": 1,
  "direction": "Northbound",
  "type": "Bus station",
  "northboundIndex": 1,
  "southboundIndex": null
}
```

#### 3.5 Import Routes from JSON

**POST** `/api/routes/import-json`

**Request Body**:

```json
[
  {
    "company": "Rea Vaya",
    "busNumber": "C5",
    "routeName": "Johannesburg CBD to Soweto",
    "description": "Main route connecting CBD to Soweto townships",
    "stops": [
      {
        "coordinates": {
          "latitude": -26.2041,
          "longitude": 28.0473
        },
        "address": "Park Station, Johannesburg",
        "bus_stop_index": 1,
        "direction": "bidirectional",
        "type": "Bus station",
        "bus_stop_indices": {
          "northbound": 1,
          "southbound": 10
        }
      }
    ]
  }
]
```

**Response**: `200 OK`

```json
{
  "message": "Routes imported successfully"
}
```

### 4. Bus Selection & Analytics

#### 4.1 Get Available Buses for Route

**GET** `/api/routes/{busNumber}/{direction}/buses`

**Path Parameters**:

- `busNumber` (required): Bus number (e.g., `"C5"`)
- `direction` (required): Direction (e.g., `"Northbound"`)

**Example Request**:

```
GET /api/routes/C5/Northbound/buses
```

**Response**: `200 OK`

```json
{
  "busNumber": "C5",
  "direction": "Northbound",
  "availableBuses": [
    {
      "busId": "BUS-C5-001",
      "lat": -26.2041,
      "lon": 28.0473,
      "speedKmh": 45.5,
      "timestamp": "2025-07-25T10:30:00Z"
    }
  ],
  "count": 1
}
```

### 5. Debug Endpoints

#### 5.1 Get Debug Subscriptions

**GET** `/api/debug/subscriptions`

**Response**: `200 OK`

```json
{
  "message": "Debug endpoint - check server logs for subscription details",
  "timestamp": "2025-07-25T10:30:00.000+00:00",
  "note": "Look for 'Client X subscribed to bus Y direction Z' in server logs",
  "activeBuses": [...],
  "serverStatus": "running"
}
```

#### 5.2 Test WebSocket Connection

**GET** `/api/debug/websocket-test`

**Response**: `200 OK`

```json
{
  "message": "WebSocket test endpoint",
  "timestamp": "2025-07-25T10:30:00.000+00:00",
  "note": "Use the test button in the client to verify WebSocket connection",
  "websocketEndpoint": "/ws",
  "stompEndpoint": "/ws/websocket"
}
```

## WebSocket API Endpoints

### Connection

**WebSocket URL**: `ws://localhost:8080/ws`

### 1. Subscribe to Bus Updates

**Send to**: `/app/subscribe`

**Message Body**:

```json
{
  "busNumber": "C5",
  "direction": "Northbound",
  "latitude": -26.2041,
  "longitude": 28.0473,
  "busStopIndex": 1
}
```

**Receive from**: `/user/topic/subscription/status`

**Response**:

```json
{
  "status": "success",
  "message": "Subscribed to best bus BUS-C5-001 for route C5 Northbound",
  "busNumber": "C5",
  "direction": "Northbound",
  "selectedBusId": "BUS-C5-001",
  "selectionType": "smart"
}
```

**Real-time updates received at**: `/user/topic/bus/{busId}`

### 2. Unsubscribe from Bus Updates

**Send to**: `/app/unsubscribe`

**Message Body** (Option 1 - Specific bus):

```json
{
  "busId": "BUS-C5-001"
}
```

**Message Body** (Option 2 - Bus number and direction):

```json
{
  "busNumber": "C5",
  "direction": "Northbound"
}
```

**Receive from**: `/user/topic/subscription/status`

**Response**:

```json
{
  "status": "success",
  "message": "Unsubscribed from specific bus BUS-C5-001",
  "busId": "BUS-C5-001"
}
```

### 3. Test WebSocket Connection

**Send to**: `/app/test`

**Message Body**:

```json
{
  "message": "Hello from client!"
}
```

**Receive from**: `/user/topic/test`

**Response**:

```json
{
  "status": "success",
  "message": "Hello from client!",
  "sessionId": "abc123",
  "timestamp": "Fri Jul 25 10:30:00 SAST 2025"
}
```

## Common Response Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Notes for Frontend Development

1. **WebSocket Connection**: Connect to `/ws` endpoint for real-time updates
2. **STOMP Protocol**: Use STOMP client library for WebSocket communication
3. **Authentication**: Currently no authentication required
4. **CORS**: May need to configure CORS for cross-origin requests
5. **Error Handling**: Always check response status codes and handle errors appropriately
6. **Real-time Updates**: Subscribe to WebSocket topics for live bus location updates

## Sample Frontend Integration

### JavaScript WebSocket Connection Example:

```javascript
const socket = new SockJS("http://localhost:8080/ws");
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
  console.log("Connected: " + frame);

  // Subscribe to bus updates
  stompClient.send(
    "/app/subscribe",
    {},
    JSON.stringify({
      busNumber: "C5",
      direction: "Northbound",
      latitude: -26.2041,
      longitude: 28.0473,
      busStopIndex: 1,
    })
  );

  // Listen for subscription status
  stompClient.subscribe("/user/topic/subscription/status", function (message) {
    console.log("Subscription status:", JSON.parse(message.body));
  });

  // Listen for bus updates
  stompClient.subscribe("/user/topic/bus/BUS-C5-001", function (message) {
    console.log("Bus update:", JSON.parse(message.body));
  });
});
```

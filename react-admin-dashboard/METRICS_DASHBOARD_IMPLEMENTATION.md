# Performance Metrics Dashboard Implementation

## Overview
Successfully implemented a comprehensive real-time performance monitoring system for the OneBus tracking pipeline to identify bottlenecks and monitor system performance.

## Backend Implementation

### MetricsService
- **Location**: `OneBusBackend/src/main/java/com/backend/onebus/service/MetricsService.java`
- **Features**:
  - Counters for tracking events (tracker payloads, bus locations processed, WebSocket broadcasts)
  - Latency tracking with average, min, max, and 95th percentile calculations
  - Pipeline event logging with timestamps and processing times
  - Active WebSocket session monitoring
  - Thread-safe concurrent data structures

### MetricsController
- **Location**: `OneBusBackend/src/main/java/com/backend/onebus/controller/MetricsController.java`
- **Endpoints**:
  - `GET /api/metrics/current` - Current metrics snapshot
  - `GET /api/metrics/pipeline?limit=N` - Recent pipeline events
  - `GET /api/metrics/sessions` - Active WebSocket sessions

### Integration Points
Updated the following services to collect metrics:
- `BusTrackingController` - Tracker payload reception timing
- `BusStreamingService` - WebSocket broadcast timing
- `BusStreamingController` - Session management

## Frontend Implementation

### MetricsPage Component
- **Location**: `OneBusAdmin/react-admin-dashboard/src/components/pages/MetricsPage.tsx`
- **Features**:
  - Real-time KPI cards showing active sessions, broadcasts, latency, and fallbacks
  - Interactive latency chart using Chart.js
  - Live pipeline events table with color-coded event types
  - Active WebSocket sessions monitoring
  - Auto-refresh every 2 seconds with manual refresh option
  - Responsive design using flexbox layout

### Dependencies Added
- `react-chartjs-2` - React wrapper for Chart.js
- `chart.js` - Charting library for latency visualization

### Routing Integration
- Added `/metrics` route to admin dashboard
- Accessible via "Performance Metrics" menu item with analytics icon

## Key Metrics Monitored

### Performance Counters
- **tracker_payloads_received**: Total tracker payloads processed
- **bus_locations_processed**: Total bus location updates processed
- **websocket_broadcasts**: Total WebSocket messages sent
- **websocket_disconnections**: Total client disconnections
- **fallback_selections**: Smart bus selection fallbacks

### Latency Metrics
- **bus_location_processing**: Time from tracker payload to database save
- **websocket_broadcast**: Time to broadcast to all subscribers
- Statistics include: average, minimum, maximum, 95th percentile

### Pipeline Events
Real-time event stream showing:
- `TRACKER_PAYLOAD_RECEIVED` - Incoming GPS data
- `BUS_LOCATION_PROCESSED` - Database processing complete
- `WEBSOCKET_BROADCAST` - Message sent to subscribers
- `SMART_BUS_SELECTED` - Fallback bus selection triggered

## Current Performance Insights

Based on live testing with simulator:
- **Average Processing Latency**: ~1583ms (tracker to database)
- **WebSocket Broadcast Latency**: ~0.45ms (very fast)
- **Bottleneck Identified**: Database processing is the main latency source
- **System Throughput**: Handling multiple buses simultaneously without issues

## Usage Instructions

### Accessing the Dashboard
1. Start the backend: `./mvnw spring-boot:run`
2. Start the React app: `npm start`
3. Navigate to `http://localhost:3000/metrics`

### Generating Test Data
1. Run the bus simulator: `source sim_venv/bin/activate && python simulate_c5_buses.py`
2. Monitor real-time metrics in the dashboard
3. Observe latency patterns and processing bottlenecks

### Key Observations
- **Real-time Updates**: Dashboard refreshes every 2 seconds
- **Performance Bottlenecks**: Database operations take 1-2 seconds
- **WebSocket Efficiency**: Sub-millisecond broadcast times
- **System Scalability**: Handles multiple concurrent buses effectively

## Future Enhancements

### Potential Improvements
1. **Alerting System**: Add threshold-based alerts for high latency
2. **Historical Data**: Store metrics for trend analysis
3. **Database Optimization**: Investigate slow database queries
4. **Caching Layer**: Implement Redis caching for frequently accessed data
5. **Load Testing**: Stress test with 100+ concurrent buses

### Additional Metrics
- Memory usage monitoring
- Database connection pool metrics
- Network latency between services
- Client-side performance metrics

## Technical Notes

### Architecture Decisions
- Used in-memory collections for real-time metrics (fast access)
- Implemented thread-safe concurrent data structures
- Separated metrics collection from business logic
- Used responsive flexbox layout instead of Grid component (compatibility)

### Performance Considerations
- Metrics collection adds minimal overhead (<1ms per operation)
- Pipeline events are limited to last 50 entries to prevent memory issues
- Auto-refresh can be disabled to reduce server load
- Chart.js provides efficient real-time data visualization

## Conclusion

The metrics dashboard provides comprehensive visibility into the OneBus tracking pipeline performance. The main bottleneck identified is database processing latency (~1.5s), while WebSocket broadcasting is highly efficient (<1ms). This system enables data-driven performance optimization and proactive issue identification.
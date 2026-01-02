import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  Router as RouterIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface MetricsData {
  counters: Record<string, number>;
  latency: Record<string, {
    avg: number;
    min: number;
    max: number;
    p95: number;
  }>;
  active_websocket_sessions: number;
  recent_pipeline_events: PipelineEvent[];
}

interface PipelineEvent {
  busId: string;
  event: string;
  timestamp: number;
  processingTime: number;
  subscriberCount: number;
  metadata?: Record<string, any>;
}

interface SessionMetric {
  sessionId: string;
  busNumber: string;
  direction: string;
  connectedAt: string;
  disconnectedAt?: string;
  duration?: string;
}

const MetricsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [pipelineEvents, setPipelineEvents] = useState<PipelineEvent[]>([]);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);

  const fetchMetrics = async () => {
    try {
      const [metricsRes, pipelineRes, sessionsRes] = await Promise.all([
        fetch('/api/metrics/current'),
        fetch('/api/metrics/pipeline?limit=50'),
        fetch('/api/metrics/sessions'),
      ]);

      if (!metricsRes.ok || !pipelineRes.ok || !sessionsRes.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const metricsData = await metricsRes.json();
      const pipelineData = await pipelineRes.json();
      const sessionsData = await sessionsRes.json();

      setMetrics(metricsData);
      setPipelineEvents(pipelineData);
      setSessionMetrics(sessionsData);

      // Update latency history for chart
      if (metricsData.latency?.websocket_broadcast?.avg) {
        setLatencyHistory(prev => {
          const newHistory = [...prev, metricsData.latency.websocket_broadcast.avg];
          return newHistory.slice(-20); // Keep last 20 data points
        });
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 2000); // Refresh every 2 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'TRACKER_PAYLOAD_RECEIVED': return 'primary';
      case 'BUS_LOCATION_PROCESSED': return 'success';
      case 'WEBSOCKET_BROADCAST': return 'info';
      case 'SMART_BUS_SELECTED': return 'warning';
      default: return 'default';
    }
  };

  const latencyChartData = {
    labels: Array.from({ length: latencyHistory.length }, (_, i) => i + 1),
    datasets: [
      {
        label: 'WebSocket Broadcast Latency (ms)',
        data: latencyHistory,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Real-time Latency Monitoring',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Latency (ms)',
        },
      },
    },
  };

  if (loading && !metrics) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Performance Metrics
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Real-time Performance Metrics
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto Refresh"
          />
          <Tooltip title="Refresh Now">
            <IconButton onClick={fetchMetrics} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {metrics && (
        <>
          {/* Key Performance Indicators */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Active Sessions
                      </Typography>
                      <Typography variant="h4">
                        {metrics.active_websocket_sessions}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RouterIcon color="success" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Broadcasts
                      </Typography>
                      <Typography variant="h4">
                        {metrics.counters.websocket_broadcasts || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SpeedIcon color="info" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Avg Broadcast Latency
                      </Typography>
                      <Typography variant="h4">
                        {metrics.latency?.websocket_broadcast?.avg?.toFixed(1) || 0}ms
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimelineIcon color="warning" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Fallback Selections
                      </Typography>
                      <Typography variant="h4">
                        {metrics.counters.fallback_selections || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Latency Chart */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Box sx={{ flex: '2 1 600px', minWidth: '400px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Real-time Latency Monitoring
                  </Typography>
                  <Line data={latencyChartData} options={chartOptions} />
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Latency Statistics
                  </Typography>
                  {metrics.latency?.websocket_broadcast && (
                    <Box>
                      <Typography variant="body2">
                        Average: {metrics.latency.websocket_broadcast.avg.toFixed(1)}ms
                      </Typography>
                      <Typography variant="body2">
                        Min: {metrics.latency.websocket_broadcast.min}ms
                      </Typography>
                      <Typography variant="body2">
                        Max: {metrics.latency.websocket_broadcast.max}ms
                      </Typography>
                      <Typography variant="body2">
                        95th Percentile: {metrics.latency.websocket_broadcast.p95.toFixed(1)}ms
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Pipeline Events */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '2 1 600px', minWidth: '400px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Real-time Pipeline Events
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>Bus ID</TableCell>
                          <TableCell>Event</TableCell>
                          <TableCell>Processing Time</TableCell>
                          <TableCell>Subscribers</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pipelineEvents.slice(-20).reverse().map((event, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatTimestamp(event.timestamp)}</TableCell>
                            <TableCell>{event.busId || 'N/A'}</TableCell>
                            <TableCell>
                              <Chip
                                label={event.event}
                                color={getEventColor(event.event)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {event.processingTime > 0 ? formatDuration(event.processingTime) : '-'}
                            </TableCell>
                            <TableCell>{event.subscriberCount || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Active WebSocket Sessions
                  </Typography>
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Bus</TableCell>
                          <TableCell>Direction</TableCell>
                          <TableCell>Duration</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sessionMetrics
                          .filter(session => !session.disconnectedAt)
                          .slice(-10)
                          .map((session, index) => (
                            <TableRow key={index}>
                              <TableCell>{session.busNumber}</TableCell>
                              <TableCell>{session.direction}</TableCell>
                              <TableCell>
                                {formatDuration(
                                  Date.now() - new Date(session.connectedAt).getTime()
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default MetricsPage;
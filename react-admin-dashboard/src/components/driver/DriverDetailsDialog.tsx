import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  DirectionsBus as BusIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { Driver } from '../../types/driver';

interface DriverDetailsDialogProps {
  open: boolean;
  driver: Driver | null;
  onClose: () => void;
}

const DriverDetailsDialog: React.FC<DriverDetailsDialogProps> = ({ open, driver, onClose }) => {
  if (!driver) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString();
  };

  const calculateShiftDuration = () => {
    if (!driver.shiftStartTime || !driver.shiftEndTime) return '-';
    const start = new Date(driver.shiftStartTime).getTime();
    const end = new Date(driver.shiftEndTime).getTime();
    const durationMs = end - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          {driver.fullName} - Driver Details
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Personal Information */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon fontSize="small" />
            Personal Information
          </Typography>
          <Divider sx={{ my: 1 }} />
          
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Driver ID</TableCell>
                <TableCell>{driver.driverId}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                <TableCell>{driver.fullName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EmailIcon fontSize="small" />
                    Email
                  </Box>
                </TableCell>
                <TableCell>{driver.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PhoneIcon fontSize="small" />
                    Phone
                  </Box>
                </TableCell>
                <TableCell>{driver.phoneNumber || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BadgeIcon fontSize="small" />
                    License
                  </Box>
                </TableCell>
                <TableCell>{driver.licenseNumber || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <DateRangeIcon fontSize="small" />
                    License Expiry
                  </Box>
                </TableCell>
                <TableCell>{formatDate(driver.licenseExpiryDate)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>

        {/* Company & Status */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon fontSize="small" />
            Company & Status
          </Typography>
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Company</Typography>
              <Typography variant="body1">{driver.companyName || '-'}</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={driver.status}
                color={driver.status === 'ACTIVE' ? 'success' : 'default'}
                size="small"
              />
              <Chip
                label={driver.onDuty ? 'On Duty' : 'Off Duty'}
                color={driver.onDuty ? 'warning' : 'default'}
                icon={driver.onDuty ? <TimerIcon /> : undefined}
                size="small"
              />
              <Chip
                label={driver.isRegisteredByAdmin ? 'Admin Registered' : 'Self Registered'}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
        </Paper>

        {/* Duty Information */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon fontSize="small" />
            Shift Information
          </Typography>
          <Divider sx={{ my: 1 }} />
          
          {driver.onDuty ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Shift Start Time</Typography>
                <Typography variant="body1">{driver.shiftStartTime ? formatTime(driver.shiftStartTime) : '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Current Shift Duration</Typography>
                <Typography variant="body1" color="warning.main">
                  {driver.shiftStartTime ? calculateShiftDuration() : '-'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Alert severity="info">
              Driver is currently off duty. No active shift.
              {driver.shiftEndTime && (
                <>
                  <br />
                  Last shift ended: {formatTime(driver.shiftEndTime)}
                </>
              )}
            </Alert>
          )}
        </Paper>

        {/* Bus Assignment */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusIcon fontSize="small" />
            Bus Assignment
          </Typography>
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Currently Assigned Bus</Typography>
              <Typography variant="body1">
                {driver.currentlyAssignedBusNumber ? (
                  <Chip
                    label={driver.currentlyAssignedBusNumber}
                    icon={<BusIcon />}
                    color="primary"
                    size="small"
                  />
                ) : (
                  '-'
                )}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">Last Assigned Bus</Typography>
              <Typography variant="body1">
                {driver.lastAssignedBusNumber ? (
                  <Chip
                    label={driver.lastAssignedBusNumber}
                    icon={<BusIcon />}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  '-'
                )}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">Assigned Route</Typography>
              <Typography variant="body1">
                {driver.assignedRouteName ? (
                  <Chip
                    label={driver.assignedRouteName}
                    icon={<AssignmentIcon />}
                    variant="outlined"
                    color="default"
                    size="small"
                  />
                ) : (
                  '-'
                )}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Work Statistics */}
        {driver.totalHoursWorked !== undefined && (
          <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon fontSize="small" />
              Work Statistics
            </Typography>
            <Divider sx={{ my: 1 }} />
            
            <Box>
              <Typography variant="body2" color="text.secondary">Total Hours Worked</Typography>
              <Typography variant="h5" color="primary.main">{driver.totalHoursWorked.toFixed(1)} hours</Typography>
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriverDetailsDialog;

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showActions?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 6,
  showActions = true,
}) => {
  const actualColumns = showActions ? columns + 1 : columns;

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from({ length: actualColumns }).map((_, index) => (
              <TableCell key={index}>
                <Skeleton variant="text" width="80%" height={24} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: actualColumns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  {colIndex === actualColumns - 1 && showActions ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  ) : (
                    <Skeleton variant="text" width="90%" height={20} />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface CardSkeletonProps {
  count?: number;
  showImage?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  count = 3,
  showImage = false,
}) => {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card>
            <CardContent>
              {showImage && (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={140}
                  sx={{ mb: 2 }}
                />
              )}
              <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Skeleton variant="rectangular" width={60} height={24} />
                <Skeleton variant="rectangular" width={80} height={24} />
              </Box>
              <Skeleton variant="text" width="100%" height={16} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

interface FormSkeletonProps {
  fields?: number;
  showButtons?: boolean;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 4,
  showButtons = true,
}) => {
  return (
    <Box sx={{ p: 2 }}>
      {Array.from({ length: fields }).map((_, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={56} />
        </Box>
      ))}
      {showButtons && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Skeleton variant="rectangular" width={80} height={36} />
          <Skeleton variant="rectangular" width={100} height={36} />
        </Box>
      )}
    </Box>
  );
};

interface DashboardSkeletonProps {
  cards?: number;
  showChart?: boolean;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  cards = 4,
  showChart = true,
}) => {
  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: cards }).map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={16} />
                  </Box>
                </Box>
                <Skeleton variant="text" width="80%" height={32} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Chart/Table Area */}
      {showChart && (
        <Card>
          <CardContent>
            <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={300} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 5,
  showAvatar = true,
  showActions = true,
}) => {
  return (
    <Box>
      {Array.from({ length: items }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {showAvatar && (
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="70%" height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="50%" height={16} />
          </Box>
          {showActions && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

// Generic skeleton for custom layouts
interface GenericSkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | false;
}

export const GenericSkeleton: React.FC<GenericSkeletonProps> = ({
  width = '100%',
  height = 20,
  variant = 'text',
  animation = 'pulse',
}) => {
  return (
    <Skeleton
      variant={variant}
      width={width}
      height={height}
      animation={animation}
    />
  );
};
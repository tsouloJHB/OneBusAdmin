import React, { useState, useCallback } from 'react';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
  GridSortModel,
  GridPaginationModel,
} from '@mui/x-data-grid';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Route as RouteIcon,
  Map as MapIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { Route, RouteFilters, ApiError } from '../../types';
import { TableSkeleton, RetryComponent } from '../ui';

interface RouteTableProps {
  routes: Route[];
  loading: boolean;
  error: ApiError | null;
  totalCount: number;
  page: number;
  pageSize: number;
  filters: RouteFilters;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onEdit: (route: Route) => void;
  onDelete: (routeId: number) => void;
  onView?: (route: Route) => void;
  onMapView?: (route: Route) => void;
  onDrawFullRoute?: (route: Route) => void;
  onRetry?: () => void;
}

const RouteTable: React.FC<RouteTableProps> = ({
  routes,
  loading,
  error,
  totalCount,
  page,
  pageSize,
  filters,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onEdit,
  onDelete,
  onView,
  onMapView,
  onDrawFullRoute,
  onRetry,
}) => {
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: filters.sortBy || 'name',
      sort: (filters.sortOrder || 'asc') as 'asc' | 'desc',
    },
  ]);

  const handleSortModelChange = useCallback(
    (newSortModel: GridSortModel) => {
      setSortModel(newSortModel);
      if (newSortModel.length > 0) {
        const { field, sort } = newSortModel[0];
        onSortChange(field, sort as 'asc' | 'desc');
      }
    },
    [onSortChange]
  );

  const handlePaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      if (model.page !== page) {
        onPageChange(model.page);
      }
      if (model.pageSize !== pageSize) {
        onPageSizeChange(model.pageSize);
      }
    },
    [page, pageSize, onPageChange, onPageSizeChange]
  );

  const handleEdit = useCallback(
    (route: Route) => () => {
      onEdit(route);
    },
    [onEdit]
  );

  const handleDelete = useCallback(
    (routeId: number) => () => {
      onDelete(routeId);
    },
    [onDelete]
  );

  const handleView = useCallback(
    (route: Route) => () => {
      if (onView) {
        onView(route);
      }
    },
    [onView]
  );

  const handleMapView = useCallback(
    (route: Route) => () => {
      if (onMapView) {
        onMapView(route);
      }
    },
    [onMapView]
  );

  const handleDrawFullRoute = useCallback(
    (route: Route) => () => {
      if (onDrawFullRoute) {
        onDrawFullRoute(route);
      }
    },
    [onDrawFullRoute]
  );



  const formatStops = (stops: Route['stops']) => {
    if (!stops || stops.length === 0) return 'No stops';
    return `${stops.length} stop${stops.length === 1 ? '' : 's'}`;
  };

  const formatSchedule = (schedule: Route['schedule']) => {
    if (!schedule || schedule.length === 0) return 'No schedule';
    return `${schedule.length} time${schedule.length === 1 ? '' : 's'}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Route Name',
      flex: 1,
      minWidth: 150, // Reduced for mobile
      sortable: true,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          fontWeight="medium"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Responsive font size
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'startPoint',
      headerName: 'Start',
      flex: 1,
      minWidth: 120, // Reduced for mobile
      sortable: false,
      renderCell: (params) => (
        <Typography 
          variant="body2"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'endPoint',
      headerName: 'End',
      flex: 1,
      minWidth: 120, // Reduced for mobile
      sortable: false,
      renderCell: (params) => (
        <Typography 
          variant="body2"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'stops',
      headerName: 'Stops',
      width: 80, // Reduced for mobile
      sortable: false,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {formatStops(params.value)}
        </Typography>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 90, // Reduced for mobile
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
          sx={{
            fontSize: { xs: '0.6875rem', sm: '0.75rem' },
            height: { xs: 20, sm: 24 },
          }}
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150, // Increased for more actions
      getActions: (params: GridRowParams<Route>) => {
        const actions = [];

        if (onDrawFullRoute) {
          actions.push(
            <GridActionsCellItem
              key="draw"
              icon={
                <Tooltip title="Draw Full Route">
                  <TimelineIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </Tooltip>
              }
              label="Draw"
              onClick={handleDrawFullRoute(params.row)}
              aria-label={`Draw full route for ${params.row.name}`}
            />
          );
        }

        if (onMapView) {
          actions.push(
            <GridActionsCellItem
              key="map"
              icon={
                <Tooltip title="View on Map">
                  <MapIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </Tooltip>
              }
              label="Map"
              onClick={handleMapView(params.row)}
              aria-label={`View route ${params.row.name} on map`}
            />
          );
        }

        actions.push(
          <GridActionsCellItem
            key="edit"
            icon={
              <Tooltip title="Edit Route">
                <EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </Tooltip>
            }
            label="Edit"
            onClick={handleEdit(params.row)}
            aria-label={`Edit route ${params.row.name}`}
          />,
          <GridActionsCellItem
            key="delete"
            icon={
              <Tooltip title="Delete Route">
                <DeleteIcon 
                  color="error" 
                  sx={{ fontSize: { xs: 18, sm: 20 } }}
                />
              </Tooltip>
            }
            label="Delete"
            onClick={handleDelete(params.row.id)}
            aria-label={`Delete route ${params.row.name}`}
          />
        );

        return actions;
      },
    },
  ];

  // Show skeleton loader when loading initially
  if (loading && routes.length === 0) {
    return <TableSkeleton rows={pageSize} columns={7} showActions={true} />;
  }

  // Show error with retry option
  if (error && routes.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <RetryComponent
          error={error}
          onRetry={onRetry || (() => {})}
          variant="card"
          size="large"
        />
      </Box>
    );
  }

  // Show error banner if there's an error but we have cached data
  if (error && routes.length > 0) {
    return (
      <Box>
        <RetryComponent
          error={error}
          onRetry={onRetry || (() => {})}
          variant="banner"
        />
        {/* Render table with existing data */}
        <Box sx={{ 
          height: { xs: 400, sm: 500, md: 600 }, // Responsive height
          width: '100%',
          overflow: 'hidden', // Prevent container overflow
        }}>
          <DataGrid
            rows={routes}
            columns={columns}
            loading={loading}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            paginationMode="server"
            rowCount={totalCount}
            paginationModel={{
              page,
              pageSize,
            }}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            disableColumnMenu
            sx={{
              '& .MuiDataGrid-root': {
                border: 'none',
              },
              '& .MuiDataGrid-main': {
                overflow: 'auto', // Enable horizontal scrolling
              },
              '& .MuiDataGrid-virtualScroller': {
                overflow: 'auto', // Enable scrolling in virtual scroller
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderBottomColor: 'divider',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Responsive font size
                padding: { xs: '4px 8px', sm: '8px 16px' }, // Responsive padding
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'grey.50',
                borderBottom: '2px solid',
                borderBottomColor: 'divider',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Responsive header font
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
              '& .MuiDataGrid-row': {
                minHeight: { xs: '40px', sm: '52px' }, // Responsive row height
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '2px solid',
                borderTopColor: 'divider',
                minHeight: { xs: '40px', sm: '52px' }, // Responsive footer height
              },
              // Mobile-specific styles
              '@media (max-width: 600px)': {
                '& .MuiDataGrid-columnHeaders': {
                  fontSize: '0.6875rem',
                },
                '& .MuiDataGrid-cell': {
                  fontSize: '0.6875rem',
                  padding: '4px 6px',
                },
              },
            }}
            slots={{
              noRowsOverlay: () => (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 2,
                    p: { xs: 2, sm: 3 }, // Responsive padding
                  }}
                >
                  <RouteIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: 'text.secondary' }} />
                  <Typography 
                    variant="h6" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    No routes found
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      textAlign: 'center',
                    }}
                  >
                    {filters.search
                      ? 'Try adjusting your search criteria'
                      : 'Create your first route to get started'}
                  </Typography>
                </Box>
              ),
              loadingOverlay: () => (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 2,
                  }}
                >
                  <CircularProgress size={20} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Loading routes...
                  </Typography>
                </Box>
              ),
            }}
            aria-label="Routes table"
            getRowId={(row) => row.id}
            initialState={{
              pagination: {
                paginationModel: {
                  page,
                  pageSize,
                },
              },
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: { xs: 400, sm: 500, md: 600 }, // Responsive height
      width: '100%',
      overflow: 'hidden', // Prevent container overflow
    }}>
      <DataGrid
        rows={routes}
        columns={columns}
        loading={loading}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        paginationMode="server"
        rowCount={totalCount}
        paginationModel={{
          page,
          pageSize,
        }}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[10, 25, 50, 100]}
        disableRowSelectionOnClick
        disableColumnMenu
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-main': {
            overflow: 'auto', // Enable horizontal scrolling
          },
          '& .MuiDataGrid-virtualScroller': {
            overflow: 'auto', // Enable scrolling in virtual scroller
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Responsive font size
            padding: { xs: '4px 8px', sm: '8px 16px' }, // Responsive padding
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'grey.50',
            borderBottom: '2px solid',
            borderBottomColor: 'divider',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Responsive header font
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
          '& .MuiDataGrid-row': {
            minHeight: { xs: '40px', sm: '52px' }, // Responsive row height
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid',
            borderTopColor: 'divider',
            minHeight: { xs: '40px', sm: '52px' }, // Responsive footer height
          },
          '& .MuiDataGrid-toolbar': {
            padding: { xs: '8px', sm: '16px' }, // Responsive toolbar padding
          },
          // Mobile-specific styles
          '@media (max-width: 600px)': {
            '& .MuiDataGrid-columnHeaders': {
              fontSize: '0.6875rem',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.6875rem',
              padding: '4px 6px',
            },
          },
        }}
        slots={{
          noRowsOverlay: () => (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
                p: { xs: 2, sm: 3 }, // Responsive padding
              }}
            >
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                No routes found
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  textAlign: 'center',
                }}
              >
                {filters.search
                  ? 'Try adjusting your search criteria'
                  : 'Create your first route to get started'}
              </Typography>
            </Box>
          ),
          loadingOverlay: () => (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
              }}
            >
              <CircularProgress size={20} />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Loading routes...
              </Typography>
            </Box>
          ),
        }}
        aria-label="Routes table"
        getRowId={(row) => row.id}
        initialState={{
          pagination: {
            paginationModel: {
              page,
              pageSize,
            },
          },
        }}
      />
    </Box>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(RouteTable, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  // Only re-render if these props change
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.page === nextProps.page &&
    prevProps.pageSize === nextProps.pageSize &&
    prevProps.totalCount === nextProps.totalCount &&
    JSON.stringify(prevProps.filters) === JSON.stringify(nextProps.filters) &&
    JSON.stringify(prevProps.routes) === JSON.stringify(nextProps.routes)
  );
});
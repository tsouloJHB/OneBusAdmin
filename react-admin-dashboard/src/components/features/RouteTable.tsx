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
  onDelete: (routeId: string) => void;
  onView?: (route: Route) => void;
  onViewMap?: (route: Route) => void;
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
  onViewMap,
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
    (routeId: string) => () => {
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

  const handleViewMap = useCallback(
    (route: Route) => () => {
      if (onViewMap) {
        onViewMap(route);
      }
    },
    [onViewMap]
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
      minWidth: 200,
      sortable: true,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'startPoint',
      headerName: 'Start Point',
      flex: 1,
      minWidth: 150,
      sortable: false,
    },
    {
      field: 'endPoint',
      headerName: 'End Point',
      flex: 1,
      minWidth: 150,
      sortable: false,
    },
    {
      field: 'stops',
      headerName: 'Stops',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatStops(params.value)}
        </Typography>
      ),
    },
    {
      field: 'schedule',
      headerName: 'Schedule',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatSchedule(params.value)}
        </Typography>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      sortable: true,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 160,
      getActions: (params: GridRowParams<Route>) => {
        const actions = [];

        // Add View in Map action
        if (onViewMap) {
          actions.push(
            <GridActionsCellItem
              key="viewMap"
              icon={
                <Tooltip title="View in Map">
                  <MapIcon color="primary" />
                </Tooltip>
              }
              label="View Map"
              onClick={handleViewMap(params.row)}
              aria-label={`View route ${params.row.name} in map`}
            />
          );
        }

        if (onView) {
          actions.push(
            <GridActionsCellItem
              key="view"
              icon={
                <Tooltip title="View Details">
                  <ViewIcon />
                </Tooltip>
              }
              label="View"
              onClick={handleView(params.row)}
              aria-label={`View route ${params.row.name}`}
            />
          );
        }

        actions.push(
          <GridActionsCellItem
            key="edit"
            icon={
              <Tooltip title="Edit Route">
                <EditIcon />
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
                <DeleteIcon color="error" />
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
        <Box sx={{ height: 600, width: '100%' }}>
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
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderBottomColor: 'divider',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'grey.50',
                borderBottom: '2px solid',
                borderBottomColor: 'divider',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '2px solid',
                borderTopColor: 'divider',
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
                  }}
                >
                  <RouteIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography variant="h6" color="text.secondary">
                    No routes found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary">
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
    <Box sx={{ height: 600, width: '100%' }}>
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
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'grey.50',
            borderBottom: '2px solid',
            borderBottomColor: 'divider',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid',
            borderTopColor: 'divider',
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
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No routes found
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
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
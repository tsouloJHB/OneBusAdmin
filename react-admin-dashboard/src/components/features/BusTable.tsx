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
  DirectionsBus as BusIcon,
} from '@mui/icons-material';
import { Bus, BusFilters, ApiError } from '../../types';
import { TableSkeleton, RetryComponent } from '../ui';

interface BusTableProps {
  buses: Bus[];
  loading: boolean;
  error: ApiError | null;
  totalCount: number;
  page: number;
  pageSize: number;
  filters: BusFilters;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onEdit: (bus: Bus) => void;
  onDelete: (busId: string) => void;
  onView?: (bus: Bus) => void;
  onRetry?: () => void;
}

const BusTable: React.FC<BusTableProps> = ({
  buses,
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
  onRetry,
}) => {
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: filters.sortBy || 'busNumber',
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
    (bus: Bus) => () => {
      onEdit(bus);
    },
    [onEdit]
  );

  const handleDelete = useCallback(
    (busId: string) => () => {
      onDelete(busId);
    },
    [onDelete]
  );

  const handleView = useCallback(
    (bus: Bus) => () => {
      if (onView) {
        onView(bus);
      }
    },
    [onView]
  );

  const getStatusColor = (status: Bus['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'retired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Bus['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'maintenance':
        return 'Maintenance';
      case 'retired':
        return 'Retired';
      default:
        return 'Unknown';
    }
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
      field: 'busNumber',
      headerName: 'Bus Number',
      width: 130,
      minWidth: 120,
      flex: 0,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusIcon color="primary" fontSize="small" aria-hidden="true" />
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'busCompany',
      headerName: 'Company',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'Unknown Company'}
        </Typography>
      ),
    },
    {
      field: 'driverName',
      headerName: 'Driver',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || 'No Driver'}
        </Typography>
      ),
    },
    {
      field: 'trackerImei',
      headerName: 'Tracker IMEI',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          {params.value || 'No Tracker'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'assignedRouteId',
      headerName: 'Assigned Route',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => {
        const routeId = params.value;
        if (!routeId) {
          return (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              Not assigned
            </Typography>
          );
        }
        return (
          <Typography variant="body2" noWrap>
            {routeId}
          </Typography>
        );
      },
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
      width: 120,
      getActions: (params: GridRowParams<Bus>) => {
        const actions = [];

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
              aria-label={`View bus ${params.row.busNumber}`}
            />
          );
        }

        actions.push(
          <GridActionsCellItem
            key="edit"
            icon={
              <Tooltip title="Edit Bus">
                <EditIcon />
              </Tooltip>
            }
            label="Edit"
            onClick={handleEdit(params.row)}
            aria-label={`Edit bus ${params.row.busNumber}`}
          />,
          <GridActionsCellItem
            key="delete"
            icon={
              <Tooltip title="Delete Bus">
                <DeleteIcon color="error" />
              </Tooltip>
            }
            label="Delete"
            onClick={handleDelete(params.row.id)}
            aria-label={`Delete bus ${params.row.busNumber}`}
            disabled={params.row.status === 'active'}
          />
        );

        return actions;
      },
    },
  ];

  // Show skeleton loader when loading initially
  if (loading && buses.length === 0) {
    return <TableSkeleton rows={pageSize} columns={7} showActions={true} />;
  }

  // Show error with retry option
  if (error && buses.length === 0) {
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
  if (error && buses.length > 0) {
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
            rows={buses}
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
                  <BusIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography variant="h6" color="text.secondary">
                    No buses found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {filters.search
                      ? 'Try adjusting your search criteria'
                      : 'Add your first bus to get started'}
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
                    Loading buses...
                  </Typography>
                </Box>
              ),
            }}
            aria-label="Buses table"
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
    <Box 
      sx={{ 
        height: { xs: 400, sm: 500, md: 600 }, 
        width: '100%',
        '& .MuiDataGrid-root': {
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
        },
      }}
    >
      <DataGrid
        rows={buses}
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
            minHeight: { xs: 40, sm: 52 },
            '&:focus': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '-2px',
            },
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'grey.50',
            borderBottom: '2px solid',
            borderBottomColor: 'divider',
            minHeight: { xs: 44, sm: 56 },
          },
          '& .MuiDataGrid-columnHeader': {
            '&:focus': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '-2px',
            },
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid',
            borderTopColor: 'divider',
            minHeight: { xs: 44, sm: 52 },
          },
          // Responsive column hiding
          '& .MuiDataGrid-cell[data-field="year"]': {
            display: { xs: 'none', sm: 'flex' },
          },
          '& .MuiDataGrid-columnHeader[data-field="year"]': {
            display: { xs: 'none', sm: 'flex' },
          },
          '& .MuiDataGrid-cell[data-field="createdAt"]': {
            display: { xs: 'none', md: 'flex' },
          },
          '& .MuiDataGrid-columnHeader[data-field="createdAt"]': {
            display: { xs: 'none', md: 'flex' },
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
                p: 2,
              }}
              role="status"
              aria-live="polite"
            >
              <BusIcon sx={{ fontSize: { xs: 32, sm: 48 }, color: 'text.secondary' }} aria-hidden="true" />
              <Typography variant="h6" color="text.secondary" textAlign="center">
                No buses found
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {filters.search
                  ? 'Try adjusting your search criteria'
                  : 'Add your first bus to get started'}
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
              role="status"
              aria-live="polite"
              aria-label="Loading buses"
            >
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Loading buses...
              </Typography>
            </Box>
          ),
        }}
        aria-label="Buses data table"
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
export default React.memo(BusTable, (prevProps, nextProps) => {
  // Custom comparison function for memoization
  // Only re-render if these props change
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.page === nextProps.page &&
    prevProps.pageSize === nextProps.pageSize &&
    prevProps.totalCount === nextProps.totalCount &&
    JSON.stringify(prevProps.filters) === JSON.stringify(nextProps.filters) &&
    JSON.stringify(prevProps.buses) === JSON.stringify(nextProps.buses)
  );
});
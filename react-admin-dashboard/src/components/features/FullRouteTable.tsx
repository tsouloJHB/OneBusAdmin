import React from 'react';
import {
  DataGrid,
  GridColDef,
} from '@mui/x-data-grid';
import { Box, Typography, Chip, Tooltip, IconButton, CircularProgress, Alert } from '@mui/material';
import { Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon, Map as MapIcon, FlipToBack as DuplicateIcon } from '@mui/icons-material';
import { FullRoute, ApiError } from '../../types';

interface FullRouteTableProps {
  fullRoutes: FullRoute[];
  loading: boolean;
  error: ApiError | null;
  onView: (route: FullRoute) => void;
  onEdit?: (route: FullRoute) => void;
  onDelete?: (routeId: number) => void;
  onMapView?: (route: FullRoute) => void;
  onDuplicate?: (route: FullRoute) => void;
  onRetry?: () => void;
}

const FullRouteTable: React.FC<FullRouteTableProps> = ({ fullRoutes, loading, error, onView, onEdit, onDelete, onMapView, onDuplicate, onRetry }) => {
  const columns: GridColDef<FullRoute>[] = [
    { field: 'name', headerName: 'Route Name', flex: 1, minWidth: 160 },
    { field: 'direction', headerName: 'Direction', flex: 0.6, minWidth: 110, renderCell: (params) => (
      params.value ? <Chip size="small" label={params.value} color="primary" /> : <Typography variant="body2">-</Typography>
    )},
    { field: 'description', headerName: 'Description', flex: 1.2, minWidth: 200, renderCell: (params) => (
      <Tooltip title={params.value || ''}>
        <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {params.value || '-'}
        </Typography>
      </Tooltip>
    )},
    { field: 'routeId', headerName: 'Route ID', width: 110 },
    { field: 'companyId', headerName: 'Company ID', width: 120 },
    { field: 'points', headerName: 'Points', width: 90, valueGetter: (value, row) => row.coordinates?.length || 0 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => onView(params.row)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {onMapView && (
            <Tooltip title="Edit Coordinates on Map">
              <IconButton size="small" onClick={() => onMapView(params.row)} color="info">
                <MapIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDuplicate && (
            <Tooltip title="Duplicate to Opposite Direction">
              <IconButton size="small" onClick={() => onDuplicate(params.row)} color="secondary">
                <DuplicateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(params.row)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(params.row.id)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <Alert severity="error" action={onRetry && <IconButton onClick={onRetry}><RefreshIcon /></IconButton>} sx={{ mb: 2 }}>
        {error.message || 'Failed to load full routes'}
      </Alert>
    );
  }

  return (
    <Box sx={{ height: 520, width: '100%' }}>
      <DataGrid
        rows={fullRoutes}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
        slots={{
          loadingOverlay: () => (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ),
          noRowsOverlay: () => (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No full routes found.</Typography>
            </Box>
          ),
        }}
      />
    </Box>
  );
};

export default FullRouteTable;

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Fade,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useCompanyManagement } from '../../contexts/CompanyManagementContext';
import { useCompanyNavigation } from '../../hooks/useCompanyNavigation';
import { BusCompany } from '../../types/busCompany';
import CompanyCard from './CompanyCard';
import CompanySearch from './CompanySearch';
import CompanyFilters from './CompanyFilters';
import CompanyForm from './CompanyForm';

interface CompanyListViewProps {
  onCompanySelect?: (company: BusCompany) => void;
}

const CompanyListView: React.FC<CompanyListViewProps> = ({ onCompanySelect }) => {
  const { state, actions } = useCompanyManagement();
  const { goToCompanyManagement } = useCompanyNavigation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<BusCompany | null>(null);
  const [filteredCompanies, setFilteredCompanies] = useState<BusCompany[]>([]);

  // Load companies on component mount
  useEffect(() => {
    console.log('CompanyListView: Loading companies on mount');
    actions.loadCompanies();
  }, []); // Empty dependency array - only run on mount

  // Update filtered companies when companies or search changes
  useEffect(() => {
    let filtered = [...state.companies];

    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(query) ||
        company.registrationNumber.toLowerCase().includes(query) ||
        company.companyCode.toLowerCase().includes(query) ||
        company.city.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (state.filters.status) {
      filtered = filtered.filter(company => company.status === state.filters.status);
    }

    // Apply city filter
    if (state.filters.city) {
      filtered = filtered.filter(company =>
        company.city.toLowerCase().includes(state.filters.city!.toLowerCase())
      );
    }

    setFilteredCompanies(filtered);
  }, [state.companies, state.searchQuery, state.filters]);

  // Handle company selection
  const handleCompanySelect = (company: BusCompany) => {
    console.log('CompanyListView: Company selected:', company.name);

    if (onCompanySelect) {
      onCompanySelect(company);
    } else {
      // Default behavior: navigate to company management
      actions.selectCompany(company);
      goToCompanyManagement(company);
    }
  };

  // Handle add company
  const handleAddCompany = () => {
    console.log('CompanyListView: Opening add company form');
    setShowAddForm(true);
  };

  // Handle company form submit
  const handleCompanyFormSubmit = async (companyData: any) => {
    console.log('CompanyListView: Form submitted with data:', companyData);
    try {
      await actions.createCompany(companyData);
      setShowAddForm(false);
      console.log('CompanyListView: Company created successfully');
    } catch (error) {
      console.error('CompanyListView: Error creating company:', error);
      // Error is handled by the context - but let's also log it here
      console.error('CompanyListView: Full error details:', error);
    }
  };

  // Handle company form cancel
  const handleCompanyFormCancel = () => {
    setShowAddForm(false);
  };

  // Handle edit company
  const handleEditCompany = (company: BusCompany) => {
    console.log('CompanyListView: Opening edit form for company:', company.name);
    setEditingCompany(company);
    setShowEditForm(true);
  };

  // Handle edit form submit
  const handleEditFormSubmit = async (companyData: any) => {
    if (!editingCompany) return;

    console.log('=== COMPANY EDIT SUBMISSION ===');
    console.log('CompanyListView: Editing company:', editingCompany);
    console.log('CompanyListView: Form data received:', companyData);

    try {
      console.log('CompanyListView: Calling updateCompany...');
      await actions.updateCompany(editingCompany.id, companyData);
      setShowEditForm(false);
      setEditingCompany(null);
      console.log('CompanyListView: Company updated successfully');
    } catch (error) {
      console.error('CompanyListView: Error updating company:', error);
      console.error('CompanyListView: Error details:', error);
      // Error is handled by the context
    }
  };

  // Handle edit form cancel
  const handleEditFormCancel = () => {
    setShowEditForm(false);
    setEditingCompany(null);
  };

  // Handle delete company
  const handleDeleteCompany = async (company: BusCompany) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${company.name}"?\n\n` +
      `This will permanently remove:\n` +
      `• Company information\n` +
      `• All associated bus numbers\n` +
      `• All registered buses\n\n` +
      `This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await actions.deleteCompany(company.id);
        console.log('CompanyListView: Company deleted successfully');
      } catch (error) {
        console.error('CompanyListView: Error deleting company:', error);
        // Error is handled by the context
      }
    }
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Box key={index} sx={{ flex: '1 1 300px', maxWidth: 400 }}>
          <Paper sx={{ p: 2 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="50%" height={24} />
            <Skeleton variant="text" width="45%" height={24} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Skeleton variant="rectangular" width={60} height={24} />
              <Skeleton variant="rectangular" width={80} height={32} />
            </Box>
          </Paper>
        </Box>
      ))}
    </Box>
  );

  // Render empty state
  const renderEmptyState = () => (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        backgroundColor: 'grey.50',
        border: '2px dashed',
        borderColor: 'grey.300'
      }}
    >
      <BusinessIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
      <Typography variant="h5" color="text.secondary" gutterBottom>
        {state.searchQuery || Object.keys(state.filters).length > 0
          ? 'No companies found'
          : 'No companies yet'
        }
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {state.searchQuery || Object.keys(state.filters).length > 0
          ? 'Try adjusting your search criteria or filters'
          : 'Get started by adding your first bus company'
        }
      </Typography>
      {!state.searchQuery && Object.keys(state.filters).length === 0 && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCompany}
          size="large"
        >
          Add First Company
        </Button>
      )}
    </Paper>
  );

  // Render company grid
  const renderCompanyGrid = () => (
    <Fade in={!state.loading}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {filteredCompanies.map((company) => (
          <Box key={company.id} sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <CompanyCard
              company={company}
              onSelect={handleCompanySelect}
              onEdit={handleEditCompany}
              onDelete={handleDeleteCompany}
            />
          </Box>
        ))}
      </Box>
    </Fade>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Bus Companies
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage bus companies and their fleet operations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCompany}
          size="large"
          disabled={state.loading}
        >
          Add Company
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <CompanySearch />
        <Box sx={{ mt: 2 }}>
          <CompanyFilters />
        </Box>
      </Paper>

      {/* Error Alert */}
      {state.error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={actions.loadCompanies}>
              Retry
            </Button>
          }
        >
          {state.error}
        </Alert>
      )}

      {/* Results Summary */}
      {!state.loading && !state.error && state.companies.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredCompanies.length === 0
              ? 'No companies found'
              : `${filteredCompanies.length} ${filteredCompanies.length === 1 ? 'company' : 'companies'} found`
            }
            {state.companies.length !== filteredCompanies.length && (
              <span> (filtered from {state.companies.length} total)</span>
            )}
          </Typography>
        </Box>
      )}

      {/* Content */}
      <Box sx={{ minHeight: 400 }}>
        {state.loading && state.companies.length === 0 ? (
          renderLoadingSkeleton()
        ) : !state.loading && filteredCompanies.length === 0 ? (
          renderEmptyState()
        ) : (
          renderCompanyGrid()
        )}
      </Box>

      {/* Add Company Form Dialog */}
      {showAddForm && (
        <CompanyForm
          open={showAddForm}
          onSubmit={handleCompanyFormSubmit}
          onCancel={handleCompanyFormCancel}
          title="Add New Company"
        />
      )}

      {/* Edit Company Form Dialog */}
      {showEditForm && editingCompany && (
        <CompanyForm
          open={showEditForm}
          onSubmit={handleEditFormSubmit}
          onCancel={handleEditFormCancel}
          title={`Edit ${editingCompany.name}`}
          initialData={{
            name: editingCompany.name,
            registrationNumber: editingCompany.registrationNumber,
            companyCode: editingCompany.companyCode,
            city: editingCompany.city,
            address: editingCompany.address,
            contactInfo: editingCompany.contactInfo,
            imageUrl: editingCompany.imageUrl,
            status: editingCompany.status
          }}
        />
      )}

      {/* Loading Overlay for Actions */}
      {state.loading && state.companies.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300
          }}
        >
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>Loading...</Typography>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default CompanyListView;
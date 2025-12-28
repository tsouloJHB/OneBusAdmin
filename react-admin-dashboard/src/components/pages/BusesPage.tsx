import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { CompanyManagementProvider } from '../../contexts/CompanyManagementContext';
import CompanyListView from '../company/CompanyListView';
import CompanyManagementView from '../company/CompanyManagementView';
import { BusCompany } from '../../types/busCompany';
import { busCompanyService } from '../../services/busCompanyService';

// Internal component that displays buses
const BusesPageContent: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<BusCompany | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'management'>('list');
  const { companyId } = useParams<{ companyId: string }>();

  // Fetch company data on page load if companyId is in URL
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (companyId && !selectedCompany) {
        setLoading(true);
        try {
          const company = await busCompanyService.getCompanyById(companyId);
          setSelectedCompany(company);
          setView('management');
          console.log('BusesPage: Loaded company from URL:', company.name);
        } catch (error) {
          console.error('Failed to load company:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCompanyData();
  }, [companyId]);

  // Handle company selection
  const handleCompanySelect = (company: BusCompany) => {
    console.log('BusesPage: Company selected:', company.name);
    setSelectedCompany(company);
    setView('management');
  };

  // Handle back to company list
  const handleBackToCompanyList = () => {
    console.log('BusesPage: Going back to company list');
    setSelectedCompany(null);
    setView('list');
  };

  // Render breadcrumbs
  const renderBreadcrumbs = () => (
    <Breadcrumbs sx={{ mb: 2 }}>
      <Link
        component="button"
        variant="body1"
        onClick={handleBackToCompanyList}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          textDecoration: 'none',
          color: view === 'list' ? 'text.primary' : 'primary.main',
          cursor: view === 'list' ? 'default' : 'pointer',
          '&:hover': {
            textDecoration: view === 'list' ? 'none' : 'underline'
          }
        }}
      >
        <BusinessIcon fontSize="small" />
        Companies
      </Link>
      
      {selectedCompany && (
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <BusIcon fontSize="small" />
          {selectedCompany.name}
        </Typography>
      )}
    </Breadcrumbs>
  );

  // Render page header
  const renderPageHeader = () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 3 
    }}>
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {view === 'list' 
            ? 'Buses' 
            : `${selectedCompany?.name} - Fleet Management`
          }
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {view === 'list'
            ? 'Select a company to manage their buses'
            : 'Manage bus numbers and registered buses for this company'
          }
        </Typography>
      </Box>
      
      {view === 'management' && selectedCompany && (
        <Chip
          icon={<BusIcon />}
          label={selectedCompany?.status || 'Unknown'}
          color={selectedCompany?.status === 'active' ? 'success' : 'default'}
          variant="outlined"
        />
      )}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }} role="main" aria-labelledby="buses-page-title">
      {/* Breadcrumbs */}
      {renderBreadcrumbs()}
      
      {/* Page Header */}
      {renderPageHeader()}
      
      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Content based on current view */
        view === 'list' ? (
          <CompanyListView onCompanySelect={handleCompanySelect} />
        ) : (
          selectedCompany && (
            <CompanyManagementView company={selectedCompany} />
          )
        )
      )}
    </Box>
  );
};

// Main component with context provider
const BusesPage: React.FC = () => {
  return (
    <CompanyManagementProvider>
      <BusesPageContent />
    </CompanyManagementProvider>
  );
};

export default BusesPage;
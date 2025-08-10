import React, { useState } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Business as BusinessIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { CompanyManagementProvider } from '../../contexts/CompanyManagementContext';
import { useCompanyNavigation } from '../../hooks/useCompanyNavigation';
import CompanyListView from '../company/CompanyListView';
import CompanyManagementView from '../company/CompanyManagementView';
import { BusCompany } from '../../types/busCompany';

// Internal component that uses the navigation hook
const BusesPageContent: React.FC = () => {
  const { navigationState, goToCompanyList, goToCompanyManagement } = useCompanyNavigation();
  const [selectedCompany, setSelectedCompany] = useState<BusCompany | null>(null);

  // Handle company selection
  const handleCompanySelect = (company: BusCompany) => {
    console.log('BusesPage: Company selected:', company.name);
    setSelectedCompany(company);
    goToCompanyManagement(company);
  };

  // Handle back to company list
  const handleBackToCompanyList = () => {
    console.log('BusesPage: Going back to company list');
    setSelectedCompany(null);
    goToCompanyList();
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
          color: navigationState.currentView === 'company-list' ? 'text.primary' : 'primary.main',
          cursor: navigationState.currentView === 'company-list' ? 'default' : 'pointer',
          '&:hover': {
            textDecoration: navigationState.currentView === 'company-list' ? 'none' : 'underline'
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
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {navigationState.currentView === 'company-list' 
            ? 'Bus Fleet Management' 
            : `${selectedCompany?.name} - Fleet Management`
          }
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {navigationState.currentView === 'company-list'
            ? 'Select a company to manage their bus fleet and operations'
            : 'Manage bus numbers and registered buses for this company'
          }
        </Typography>
      </Box>
      
      {navigationState.currentView === 'company-management' && (
        <Chip
          icon={<BusinessIcon />}
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
      
      {/* Content based on current view */}
      {navigationState.currentView === 'company-list' ? (
        <CompanyListView onCompanySelect={handleCompanySelect} />
      ) : (
        selectedCompany && (
          <CompanyManagementView company={selectedCompany} />
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
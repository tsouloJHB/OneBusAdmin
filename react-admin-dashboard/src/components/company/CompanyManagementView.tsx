import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  LocalShipping as TruckIcon
} from '@mui/icons-material';
import { useCompanyManagement } from '../../contexts/CompanyManagementContext';
import { useCompanyNavigation } from '../../hooks/useCompanyNavigation';
import { BusCompany } from '../../types/busCompany';
import BusNumberManagement from './BusNumberManagement';
import RegisteredBuses from './RegisteredBuses';

interface CompanyManagementViewProps {
  company: BusCompany;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const CompanyManagementView: React.FC<CompanyManagementViewProps> = ({ company }) => {
  const { state, actions } = useCompanyManagement();
  const { navigationState, switchTab } = useCompanyNavigation();
  const [tabValue, setTabValue] = useState(0);

  // Load company data when component mounts
  useEffect(() => {
    console.log('CompanyManagementView: Loading data for company:', company.id);
    actions.loadCompanyData(company.id);
  }, [company.id]); // Remove actions from dependency array to prevent infinite loop

  // Sync tab value with navigation state
  useEffect(() => {
    const newTabValue = navigationState.activeTab === 'registered-buses' ? 1 : 0;
    setTabValue(newTabValue);
  }, [navigationState.activeTab]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const tab = newValue === 1 ? 'registered-buses' : 'bus-numbers';
    switchTab(tab);
  };

  // Tab accessibility props
  const a11yProps = (index: number) => ({
    id: `company-tab-${index}`,
    'aria-controls': `company-tabpanel-${index}`,
  });

  return (
    <Box>
      {/* Company Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {company.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Code:</strong> {company.companyCode}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Registration:</strong> {company.registrationNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>City:</strong> {company.city}
              </Typography>
            </Box>
            {company.contactInfo?.phone && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Phone:</strong> {company.contactInfo.phone}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Error Display */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {state.error}
        </Alert>
      )}

      {/* Management Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Company management tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<BusIcon />}
            label="Bus Number Management"
            {...a11yProps(0)}
            sx={{ minHeight: 64 }}
          />
          <Tab
            icon={<TruckIcon />}
            label="Registered Buses"
            {...a11yProps(1)}
            sx={{ minHeight: 64 }}
          />
        </Tabs>

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <BusNumberManagement
            companyId={company.id}
            busNumbers={state.busNumbers}
            loading={state.loading}
            onAdd={actions.createBusNumber}
            onEdit={actions.updateBusNumber}
            onDelete={actions.deleteBusNumber}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <RegisteredBuses
            companyId={company.id}
            companyName={company.name}
            registeredBuses={state.registeredBuses}
            loading={state.loading}
            onAdd={actions.createRegisteredBus}
            onEdit={actions.updateRegisteredBus}
            onDelete={actions.deleteRegisteredBus}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default CompanyManagementView;
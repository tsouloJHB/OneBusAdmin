import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import {
  Business as BusinessIcon,
  DirectionsBus as BusIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { busCompanyService } from '../../services/busCompanyService';
import { BusCompany } from '../../types/busCompany';

const CompanyManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<BusCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await busCompanyService.getAllCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageCompany = (companyId: string) => {
    navigate(`/buses/company/${companyId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon fontSize="large" />
            Company Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage bus companies, their buses, and operations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
        >
          Add New Company
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {companies.map((company) => (
          <Box
            key={company.id}
            sx={{
              width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
            }}
          >
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              {/* Company Image */}
              {(company.imageUrl || company.imagePath) && (
                <Box
                  sx={{
                    height: 160,
                    width: '100%',
                    overflow: 'hidden',
                    backgroundColor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={company.imageUrl || company.imagePath}
                    alt={`${company.name} logo`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #999;"><svg width="48" height="48" fill="currentColor"><use href="#business-icon"/></svg></div>';
                      }
                    }}
                  />
                </Box>
              )}
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="primary" />
                    <Typography variant="h6" component="div">
                      {company.name}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    <Chip 
                      icon={<BusIcon />}
                      label="Company"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip 
                      label={company.status === 'active' ? 'Active' : company.status === 'inactive' ? 'Inactive' : 'Suspended'}
                      size="small"
                      color={company.status === 'active' ? 'success' : company.status === 'inactive' ? 'default' : 'warning'}
                    />
                  </Stack>

                  {company.city && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      📍 {company.city}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => handleManageCompany(company.id)}
                  fullWidth
                  variant="outlined"
                >
                  Manage Company
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}

        {companies.length === 0 && (
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Companies Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Get started by adding your first bus company
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                color="primary"
              >
                Add First Company
              </Button>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CompanyManagementPage;

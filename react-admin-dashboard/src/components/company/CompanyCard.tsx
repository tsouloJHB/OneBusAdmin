import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
  Fade,
  useTheme
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Code as CodeIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { BusCompany, CompanyCardProps } from '../../types/busCompany';
import { getStatusColor, getStatusLabel } from '../../utils/busCompanyUtils';

const CompanyCard: React.FC<CompanyCardProps> = ({ 
  company, 
  onSelect, 
  onEdit, 
  onDelete 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    console.log('CompanyCard: Card clicked for company:', company.name);
    onSelect(company);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    console.log('CompanyCard: Edit clicked for company:', company.id);
    if (onEdit) {
      onEdit(company);
    }
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    console.log('CompanyCard: Delete clicked for company:', company.id);
    if (onDelete) {
      onDelete(company);
    }
  };

  const handleView = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onSelect(company);
  };

  // Generate company initials for avatar
  const getCompanyInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate avatar color based on company name
  const getAvatarColor = (name: string): string => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main
    ];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Debug logging for image URLs
  React.useEffect(() => {
    if (company.imageUrl) {
      console.log(`CompanyCard: ${company.name} has imageUrl:`, company.imageUrl);
    }
    if (company.imagePath) {
      console.log(`CompanyCard: ${company.name} has imagePath:`, company.imagePath);
    }
  }, [company.imageUrl, company.imagePath, company.name]);

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: isHovered ? 4 : 1,
          '&:hover': {
            boxShadow: 4,
          },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Status indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: getStatusColor(company.status) === 'success' 
              ? theme.palette.success.main
              : getStatusColor(company.status) === 'warning'
              ? theme.palette.warning.main
              : getStatusColor(company.status) === 'error'
              ? theme.palette.error.main
              : theme.palette.grey[300]
          }}
        />

        <CardContent sx={{ flexGrow: 1, pt: 3 }}>
          {/* Header with avatar and menu */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar
              src={company.imageUrl || undefined}
              sx={{
                bgcolor: company.imageUrl ? 'transparent' : getAvatarColor(company.name),
                width: 48,
                height: 48,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                border: company.imageUrl ? `2px solid ${theme.palette.grey[200]}` : 'none',
              }}
              imgProps={{
                onError: (e) => {
                  // Handle broken image by hiding src to show initials fallback
                  (e.target as HTMLImageElement).style.display = 'none';
                },
                style: { objectFit: 'cover' }
              }}
            >
              {!company.imageUrl && getCompanyInitials(company.name)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1, ml: 2, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="h6" 
                  component="h3"
                  sx={{ 
                    fontWeight: 600,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {company.name}
                </Typography>
                {company.imageUrl && (
                  <Tooltip title="Company logo available">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.success.main,
                        flexShrink: 0
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip
                  label={getStatusLabel(company.status)}
                  color={getStatusColor(company.status)}
                  size="small"
                />
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ 
                opacity: isHovered ? 1 : 0.7,
                transition: 'opacity 0.2s'
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Company details */}
          <Box sx={{ space: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CodeIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Code: <strong>{company.companyCode}</strong>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssignmentIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                Reg: {company.registrationNumber}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {company.city}
              </Typography>
            </Box>

            {company.contactInfo?.phone && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mt: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                📞 {company.contactInfo.phone}
              </Typography>
            )}
          </Box>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Updated {new Date(company.updatedAt).toLocaleDateString()}
            </Typography>
            
            <Tooltip title="View Details">
              <IconButton 
                size="small" 
                color="primary"
                onClick={handleView}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActions>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleView}>
            <ViewIcon sx={{ mr: 1, fontSize: 20 }} />
            View Details
          </MenuItem>
          
          {onEdit && (
            <MenuItem onClick={handleEdit}>
              <EditIcon sx={{ mr: 1, fontSize: 20 }} />
              Edit Company
            </MenuItem>
          )}
          
          {onDelete && (
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
              Delete Company
            </MenuItem>
          )}
        </Menu>
      </Card>
    </Fade>
  );
};

export default CompanyCard;
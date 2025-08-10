import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Autocomplete,
  Chip,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Code as CodeIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useCompanyManagement } from '../../contexts/CompanyManagementContext';
import { useUrlParams } from '../../hooks/useCompanyNavigation';
import { BusCompany } from '../../types/busCompany';

// Search suggestion types
interface SearchSuggestion {
  type: 'company' | 'city' | 'code' | 'registration' | 'history';
  label: string;
  value: string;
  company?: BusCompany;
  icon: React.ReactNode;
}

const CompanySearch: React.FC = () => {
  const { state, actions } = useCompanyManagement();
  const { searchParams, updateSearchParams } = useUrlParams();
  const [searchValue, setSearchValue] = useState(searchParams.query || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('companySearchHistory');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Save search to history
  const saveToHistory = useCallback((query: string) => {
    if (!query.trim() || query.length < 2) return;

    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('companySearchHistory', JSON.stringify(newHistory));
  }, [searchHistory]);

  // Generate search suggestions
  const generateSuggestions = useCallback((query: string): SearchSuggestion[] => {
    if (!query.trim() || query.length < 2) {
      // Show search history when no query
      return searchHistory.map(historyItem => ({
        type: 'history',
        label: historyItem,
        value: historyItem,
        icon: <HistoryIcon />
      }));
    }

    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // Add matching companies
    const matchingCompanies = state.companies
      .filter(company => 
        company.name.toLowerCase().includes(lowerQuery) ||
        company.registrationNumber.toLowerCase().includes(lowerQuery) ||
        company.companyCode.toLowerCase().includes(lowerQuery) ||
        company.city.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5);

    matchingCompanies.forEach(company => {
      suggestions.push({
        type: 'company',
        label: company.name,
        value: company.name,
        company,
        icon: <BusinessIcon />
      });
    });

    // Add unique cities
    const cities = Array.from(new Set(state.companies.map(c => c.city)))
      .filter(city => city.toLowerCase().includes(lowerQuery))
      .slice(0, 3);

    cities.forEach(city => {
      suggestions.push({
        type: 'city',
        label: `Companies in ${city}`,
        value: city,
        icon: <LocationIcon />
      });
    });

    // Add matching company codes
    const codes = Array.from(new Set(state.companies.map(c => c.companyCode)))
      .filter(code => code.toLowerCase().includes(lowerQuery))
      .slice(0, 3);

    codes.forEach(code => {
      suggestions.push({
        type: 'code',
        label: `Company code: ${code}`,
        value: code,
        icon: <CodeIcon />
      });
    });

    return suggestions;
  }, [state.companies, searchHistory]);

  // Update suggestions when search value or companies change
  useEffect(() => {
    const newSuggestions = generateSuggestions(searchValue);
    setSuggestions(newSuggestions);
  }, [searchValue, generateSuggestions]);

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue !== searchParams.query) {
        updateSearchParams({ query: searchValue });
        actions.searchCompanies(searchValue);
        
        if (searchValue.trim()) {
          saveToHistory(searchValue.trim());
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, searchParams.query, updateSearchParams, actions, saveToHistory]);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    setShowSuggestions(true);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchValue('');
    setShowSuggestions(false);
    updateSearchParams({ query: '' });
    actions.searchCompanies('');
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    console.log('CompanySearch: Suggestion selected:', suggestion);
    
    setSearchValue(suggestion.value);
    setShowSuggestions(false);
    
    // Update search params based on suggestion type
    switch (suggestion.type) {
      case 'city':
        updateSearchParams({ query: '', city: suggestion.value });
        actions.searchCompanies('');
        break;
      case 'code':
      case 'registration':
      case 'company':
      case 'history':
        updateSearchParams({ query: suggestion.value });
        actions.searchCompanies(suggestion.value);
        saveToHistory(suggestion.value);
        break;
    }
  };

  // Handle search submit
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowSuggestions(false);
    
    if (searchValue.trim()) {
      updateSearchParams({ query: searchValue.trim() });
      actions.searchCompanies(searchValue.trim());
      saveToHistory(searchValue.trim());
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  // Handle input blur (with delay to allow suggestion clicks)
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <form onSubmit={handleSearchSubmit}>
        <TextField
          fullWidth
          placeholder="Search companies by name, code, registration, or city..."
          value={searchValue}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleSearchClear}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
            }
          }}
        />
      </form>

      {/* Active search filters */}
      {(searchParams.query || searchParams.city || searchParams.status) && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {searchParams.query && (
            <Chip
              label={`Search: "${searchParams.query}"`}
              onDelete={() => updateSearchParams({ query: '' })}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {searchParams.city && (
            <Chip
              label={`City: ${searchParams.city}`}
              onDelete={() => updateSearchParams({ city: '' })}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
          {searchParams.status && (
            <Chip
              label={`Status: ${searchParams.status}`}
              onDelete={() => updateSearchParams({ status: '' })}
              size="small"
              color="info"
              variant="outlined"
            />
          )}
        </Box>
      )}

      {/* Search suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 300,
            overflow: 'auto',
            mt: 1,
            boxShadow: 3
          }}
        >
          <List dense>
            {!searchValue.trim() && searchHistory.length > 0 && (
              <>
                <ListItem>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Recent Searches
                  </Typography>
                </ListItem>
                <Divider />
              </>
            )}
            
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={`${suggestion.type}-${index}`}
                component="div"
                onClick={() => handleSuggestionSelect(suggestion)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {suggestion.icon}
                </ListItemIcon>
                <ListItemText
                  primary={suggestion.label}
                  secondary={
                    suggestion.company && (
                      <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip label={suggestion.company.companyCode} size="small" />
                        <Chip label={suggestion.company.city} size="small" />
                      </Box>
                    )
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default CompanySearch;
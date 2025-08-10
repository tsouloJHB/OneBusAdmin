import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  NavigationState,
  BreadcrumbItem,
  BusCompany
} from '../types/busCompany';

/**
 * Custom hook for managing company navigation state and URL synchronization
 */
export const useCompanyNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Initialize navigation state based on current URL
  const initializeNavigationState = useCallback((): NavigationState => {
    const path = location.pathname;
    
    if (path.includes('/buses/company/')) {
      // We're in company management view
      return {
        currentView: 'company-management',
        selectedCompany: undefined, // Will be loaded from params
        activeTab: (location.hash === '#registered-buses' ? 'registered-buses' : 'bus-numbers'),
        breadcrumbs: [
          { label: 'Companies', path: '/buses', active: false },
          { label: 'Loading...', path: path, active: true }
        ]
      };
    } else {
      // We're in company list view
      return {
        currentView: 'company-list',
        selectedCompany: undefined,
        activeTab: 'bus-numbers',
        breadcrumbs: [
          { label: 'Companies', path: '/buses', active: true }
        ]
      };
    }
  }, [location.pathname, location.hash]);

  const [navigationState, setNavigationState] = useState<NavigationState>(initializeNavigationState);

  // Update navigation state when URL changes
  useEffect(() => {
    const newState = initializeNavigationState();
    setNavigationState(prev => ({
      ...newState,
      selectedCompany: prev.selectedCompany // Preserve selected company
    }));
  }, [location.pathname, location.hash, initializeNavigationState]);

  /**
   * Navigate to company list view
   */
  const goToCompanyList = useCallback(() => {
    console.log('useCompanyNavigation: Navigating to company list');
    navigate('/buses');
    setNavigationState({
      currentView: 'company-list',
      selectedCompany: undefined,
      activeTab: 'bus-numbers',
      breadcrumbs: [
        { label: 'Companies', path: '/buses', active: true }
      ]
    });
  }, [navigate]);

  /**
   * Navigate to company management view
   */
  const goToCompanyManagement = useCallback((company: BusCompany, tab?: 'bus-numbers' | 'registered-buses') => {
    console.log('useCompanyNavigation: Navigating to company management for:', company.name);
    const activeTab = tab || 'bus-numbers';
    const path = `/buses/company/${company.id}`;
    const hash = activeTab === 'registered-buses' ? '#registered-buses' : '';
    
    navigate(path + hash);
    setNavigationState({
      currentView: 'company-management',
      selectedCompany: company,
      activeTab,
      breadcrumbs: [
        { label: 'Companies', path: '/buses', active: false },
        { label: company.name, path: path, active: true }
      ]
    });
  }, [navigate]);

  /**
   * Switch tabs within company management view
   */
  const switchTab = useCallback((tab: 'bus-numbers' | 'registered-buses') => {
    if (navigationState.currentView !== 'company-management' || !navigationState.selectedCompany) {
      console.warn('useCompanyNavigation: Cannot switch tab - not in company management view');
      return;
    }

    console.log('useCompanyNavigation: Switching to tab:', tab);
    const path = `/buses/company/${navigationState.selectedCompany.id}`;
    const hash = tab === 'registered-buses' ? '#registered-buses' : '';
    
    navigate(path + hash, { replace: true });
    setNavigationState(prev => ({
      ...prev,
      activeTab: tab
    }));
  }, [navigate, navigationState.currentView, navigationState.selectedCompany]);

  /**
   * Update selected company (when loaded from API)
   */
  const updateSelectedCompany = useCallback((company: BusCompany) => {
    console.log('useCompanyNavigation: Updating selected company:', company.name);
    setNavigationState(prev => ({
      ...prev,
      selectedCompany: company,
      breadcrumbs: prev.breadcrumbs.map((crumb, index) => 
        index === prev.breadcrumbs.length - 1 
          ? { ...crumb, label: company.name }
          : crumb
      )
    }));
  }, []);

  /**
   * Get current company ID from URL params
   */
  const getCurrentCompanyId = useCallback((): string | undefined => {
    return params.companyId;
  }, [params.companyId]);

  /**
   * Check if we're currently in a specific view
   */
  const isInView = useCallback((view: 'company-list' | 'company-management'): boolean => {
    return navigationState.currentView === view;
  }, [navigationState.currentView]);

  /**
   * Check if a specific tab is active
   */
  const isTabActive = useCallback((tab: 'bus-numbers' | 'registered-buses'): boolean => {
    return navigationState.activeTab === tab;
  }, [navigationState.activeTab]);

  /**
   * Generate breadcrumb items for current navigation state
   */
  const getBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    return navigationState.breadcrumbs;
  }, [navigationState.breadcrumbs]);

  /**
   * Handle browser back/forward navigation
   */
  const handleBrowserNavigation = useCallback(() => {
    // This is handled by the useEffect that watches location changes
    console.log('useCompanyNavigation: Browser navigation detected');
  }, []);

  return {
    // State
    navigationState,
    
    // Navigation actions
    goToCompanyList,
    goToCompanyManagement,
    switchTab,
    updateSelectedCompany,
    
    // Utility functions
    getCurrentCompanyId,
    isInView,
    isTabActive,
    getBreadcrumbs,
    handleBrowserNavigation
  };
};

/**
 * Hook for generating and managing breadcrumb navigation
 */
export const useBreadcrumbs = (navigationState: NavigationState) => {
  const navigate = useNavigate();

  const handleBreadcrumbClick = useCallback((breadcrumb: BreadcrumbItem) => {
    if (!breadcrumb.active) {
      console.log('useBreadcrumbs: Navigating to:', breadcrumb.path);
      navigate(breadcrumb.path);
    }
  }, [navigate]);

  const generateBreadcrumbs = useCallback((
    currentView: 'company-list' | 'company-management',
    selectedCompany?: BusCompany,
    activeTab?: 'bus-numbers' | 'registered-buses'
  ): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Companies
    breadcrumbs.push({
      label: 'Companies',
      path: '/buses',
      active: currentView === 'company-list'
    });

    // Add company level if in management view
    if (currentView === 'company-management' && selectedCompany) {
      breadcrumbs.push({
        label: selectedCompany.name,
        path: `/buses/company/${selectedCompany.id}`,
        active: true
      });
    }

    return breadcrumbs;
  }, []);

  return {
    breadcrumbs: navigationState.breadcrumbs,
    handleBreadcrumbClick,
    generateBreadcrumbs
  };
};

/**
 * Hook for URL parameter management
 */
export const useUrlParams = () => {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Get search parameters from URL
   */
  const getSearchParams = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      query: searchParams.get('q') || '',
      city: searchParams.get('city') || '',
      status: searchParams.get('status') || ''
    };
  }, [location.search]);

  /**
   * Update search parameters in URL
   */
  const updateSearchParams = useCallback((params: {
    query?: string;
    city?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams(location.search);
    
    // Update or remove parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim()) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });

    const newSearch = searchParams.toString();
    const newUrl = location.pathname + (newSearch ? `?${newSearch}` : '');
    
    navigate(newUrl, { replace: true });
  }, [location.pathname, location.search, navigate]);

  /**
   * Clear all search parameters
   */
  const clearSearchParams = useCallback(() => {
    navigate(location.pathname, { replace: true });
  }, [location.pathname, navigate]);

  return {
    searchParams: getSearchParams(),
    updateSearchParams,
    clearSearchParams
  };
};

/**
 * Hook for managing navigation history and state persistence
 */
export const useNavigationHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  const addToHistory = useCallback((path: string) => {
    setHistory(prev => {
      const newHistory = [...prev, path];
      // Keep only last 10 entries
      return newHistory.slice(-10);
    });
  }, []);

  const canGoBack = useCallback((): boolean => {
    return history.length > 1;
  }, [history.length]);

  const getPreviousPath = useCallback((): string | undefined => {
    return history.length > 1 ? history[history.length - 2] : undefined;
  }, [history]);

  return {
    history,
    addToHistory,
    canGoBack,
    getPreviousPath
  };
};
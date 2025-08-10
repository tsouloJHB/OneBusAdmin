import { BreadcrumbItem, BusCompany } from '../types/busCompany';

/**
 * Utility functions for navigation and URL management
 */

// Route constants
export const ROUTES = {
  BUSES: '/buses',
  COMPANY_MANAGEMENT: '/buses/company/:companyId',
  COMPANY_DETAIL: (companyId: string) => `/buses/company/${companyId}`,
  COMPANY_BUS_NUMBERS: (companyId: string) => `/buses/company/${companyId}#bus-numbers`,
  COMPANY_REGISTERED_BUSES: (companyId: string) => `/buses/company/${companyId}#registered-buses`
};

/**
 * Generate breadcrumb items for navigation
 */
export const generateBreadcrumbs = (
  currentView: 'company-list' | 'company-management',
  selectedCompany?: BusCompany
): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always include the root Companies breadcrumb
  breadcrumbs.push({
    label: 'Companies',
    path: ROUTES.BUSES,
    active: currentView === 'company-list'
  });

  // Add company-specific breadcrumb if in management view
  if (currentView === 'company-management' && selectedCompany) {
    breadcrumbs.push({
      label: selectedCompany.name,
      path: ROUTES.COMPANY_DETAIL(selectedCompany.id),
      active: true
    });
  }

  return breadcrumbs;
};

/**
 * Parse URL to determine current navigation state
 */
export const parseUrlForNavigation = (pathname: string, hash: string) => {
  // Check if we're in company management view
  const companyMatch = pathname.match(/^\/buses\/company\/([^\/]+)$/);
  
  if (companyMatch) {
    const companyId = companyMatch[1];
    const activeTab = hash === '#registered-buses' ? 'registered-buses' : 'bus-numbers';
    
    return {
      currentView: 'company-management' as const,
      companyId,
      activeTab
    };
  }

  // Default to company list view
  return {
    currentView: 'company-list' as const,
    companyId: undefined,
    activeTab: 'bus-numbers' as const
  };
};

/**
 * Build URL for company management view
 */
export const buildCompanyManagementUrl = (
  companyId: string,
  tab?: 'bus-numbers' | 'registered-buses'
): string => {
  const basePath = ROUTES.COMPANY_DETAIL(companyId);
  const hash = tab === 'registered-buses' ? '#registered-buses' : '';
  return basePath + hash;
};

/**
 * Extract search parameters from URL search string
 */
export const parseSearchParams = (search: string) => {
  const params = new URLSearchParams(search);
  return {
    query: params.get('q') || '',
    city: params.get('city') || '',
    status: params.get('status') || '',
    page: parseInt(params.get('page') || '1', 10),
    limit: parseInt(params.get('limit') || '20', 10)
  };
};

/**
 * Build search parameter string from object
 */
export const buildSearchParams = (params: {
  query?: string;
  city?: string;
  status?: string;
  page?: number;
  limit?: number;
}): string => {
  const searchParams = new URLSearchParams();

  // Add non-empty parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value.toString());
    }
  });

  const result = searchParams.toString();
  return result ? `?${result}` : '';
};

/**
 * Validate company ID format
 */
export const isValidCompanyId = (companyId: string): boolean => {
  // Basic validation - adjust based on your ID format requirements
  return /^[a-zA-Z0-9\-_]{1,50}$/.test(companyId);
};

/**
 * Get page title based on navigation state
 */
export const getPageTitle = (
  currentView: 'company-list' | 'company-management',
  selectedCompany?: BusCompany,
  activeTab?: 'bus-numbers' | 'registered-buses'
): string => {
  switch (currentView) {
    case 'company-list':
      return 'Bus Companies';
    
    case 'company-management':
      if (!selectedCompany) return 'Company Management';
      
      const tabTitle = activeTab === 'registered-buses' ? 'Registered Buses' : 'Bus Numbers';
      return `${selectedCompany.name} - ${tabTitle}`;
    
    default:
      return 'Bus Management';
  }
};

/**
 * Generate meta description for SEO
 */
export const getPageDescription = (
  currentView: 'company-list' | 'company-management',
  selectedCompany?: BusCompany,
  activeTab?: 'bus-numbers' | 'registered-buses'
): string => {
  switch (currentView) {
    case 'company-list':
      return 'Manage bus companies, view company details, and access bus fleet information.';
    
    case 'company-management':
      if (!selectedCompany) return 'Manage company bus operations and fleet.';
      
      if (activeTab === 'registered-buses') {
        return `View and manage registered buses for ${selectedCompany.name}.`;
      } else {
        return `Manage bus numbers and route assignments for ${selectedCompany.name}.`;
      }
    
    default:
      return 'Bus company and fleet management system.';
  }
};

/**
 * Check if navigation is allowed based on user permissions
 */
export const canNavigateToCompany = (
  companyId: string,
  userPermissions?: string[]
): boolean => {
  // Implement permission checking logic here
  // For now, allow all navigation
  return true;
};

/**
 * Get navigation menu items based on current context
 */
export const getNavigationMenuItems = (
  currentView: 'company-list' | 'company-management',
  selectedCompany?: BusCompany
): Array<{ label: string; path: string; active: boolean; icon: string }> => {
  const baseItems = [
    {
      label: 'Companies',
      path: ROUTES.BUSES,
      active: currentView === 'company-list',
      icon: 'business'
    }
  ];

  if (currentView === 'company-management' && selectedCompany) {
    baseItems.push(
      {
        label: 'Bus Numbers',
        path: ROUTES.COMPANY_BUS_NUMBERS(selectedCompany.id),
        active: true,
        icon: 'directions_bus'
      },
      {
        label: 'Registered Buses',
        path: ROUTES.COMPANY_REGISTERED_BUSES(selectedCompany.id),
        active: true,
        icon: 'local_shipping'
      }
    );
  }

  return baseItems;
};

/**
 * Handle deep linking and URL validation
 */
export const validateAndRedirectUrl = (
  pathname: string,
  companyExists: (id: string) => Promise<boolean>
) => {
  const navigation = parseUrlForNavigation(pathname, '');
  
  if (navigation.currentView === 'company-management' && navigation.companyId) {
    // Validate that the company exists
    return companyExists(navigation.companyId).then(exists => {
      if (!exists) {
        // Redirect to company list if company doesn't exist
        return ROUTES.BUSES;
      }
      return pathname; // URL is valid
    });
  }
  
  return Promise.resolve(pathname);
};

/**
 * Generate shareable URL for current state
 */
export const generateShareableUrl = (
  baseUrl: string,
  currentView: 'company-list' | 'company-management',
  selectedCompany?: BusCompany,
  activeTab?: 'bus-numbers' | 'registered-buses',
  searchParams?: { query?: string; city?: string; status?: string }
): string => {
  let path = '';
  
  switch (currentView) {
    case 'company-list':
      path = ROUTES.BUSES;
      if (searchParams) {
        path += buildSearchParams(searchParams);
      }
      break;
    
    case 'company-management':
      if (selectedCompany) {
        path = buildCompanyManagementUrl(selectedCompany.id, activeTab);
      } else {
        path = ROUTES.BUSES;
      }
      break;
    
    default:
      path = ROUTES.BUSES;
  }
  
  return `${baseUrl}${path}`;
};

/**
 * Navigation analytics helper
 */
export const trackNavigation = (
  from: string,
  to: string,
  context?: { companyId?: string; tab?: string }
) => {
  // Implement analytics tracking here
  console.log('Navigation tracked:', { from, to, context });
};

/**
 * Keyboard navigation helper
 */
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  navigationActions: {
    goBack?: () => void;
    goToCompanyList?: () => void;
    switchTab?: (tab: 'bus-numbers' | 'registered-buses') => void;
  }
) => {
  // Handle common keyboard shortcuts
  if (event.altKey) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        navigationActions.goBack?.();
        break;
      
      case 'h':
        event.preventDefault();
        navigationActions.goToCompanyList?.();
        break;
      
      case '1':
        event.preventDefault();
        navigationActions.switchTab?.('bus-numbers');
        break;
      
      case '2':
        event.preventDefault();
        navigationActions.switchTab?.('registered-buses');
        break;
    }
  }
};
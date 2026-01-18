import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import {
  BusCompany,
  BusNumber,
  RegisteredBus,
  CompanyManagementState,
  CompanyManagementActions,
  CompanyFormData,
  BusNumberFormData,
  RegisteredBusFormData,
  CompanyManagementError,
  CompanySearchParams
} from '../types/busCompany';
import { busCompanyService } from '../services/busCompanyService';

// Action Types
type CompanyManagementAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COMPANIES'; payload: BusCompany[] }
  | { type: 'SET_SELECTED_COMPANY'; payload: BusCompany | null }
  | { type: 'SET_BUS_NUMBERS'; payload: BusNumber[] }
  | { type: 'SET_REGISTERED_BUSES'; payload: RegisteredBus[] }
  | { type: 'SET_CURRENT_VIEW'; payload: 'company-list' | 'company-management' }
  | { type: 'SET_ACTIVE_TAB'; payload: 'bus-numbers' | 'registered-buses' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: { city?: string; status?: string } }
  | { type: 'ADD_COMPANY'; payload: BusCompany }
  | { type: 'UPDATE_COMPANY'; payload: { id: string; company: BusCompany } }
  | { type: 'REMOVE_COMPANY'; payload: string }
  | { type: 'ADD_BUS_NUMBER'; payload: BusNumber }
  | { type: 'UPDATE_BUS_NUMBER'; payload: { id: string; busNumber: BusNumber } }
  | { type: 'REMOVE_BUS_NUMBER'; payload: string }
  | { type: 'ADD_REGISTERED_BUS'; payload: RegisteredBus }
  | { type: 'UPDATE_REGISTERED_BUS'; payload: { id: number; bus: RegisteredBus } }
  | { type: 'REMOVE_REGISTERED_BUS'; payload: number };

// Initial State
const initialState: CompanyManagementState = {
  companies: [],
  selectedCompany: null,
  busNumbers: [],
  registeredBuses: [],
  loading: true, // Start with loading true so initial fetch shows skeleton
  error: null,
  currentView: 'company-list',
  activeTab: 'bus-numbers',
  searchQuery: '',
  filters: {}
};

// Reducer
const companyManagementReducer = (
  state: CompanyManagementState,
  action: CompanyManagementAction
): CompanyManagementState => {
  switch (action.type) {
    case 'SET_LOADING':
      console.log('Reducer: SET_LOADING ->', action.payload, 'current:', state.loading);
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_COMPANIES':
      return { ...state, companies: action.payload, loading: false, error: null };

    case 'SET_SELECTED_COMPANY':
      return { ...state, selectedCompany: action.payload };

    case 'SET_BUS_NUMBERS':
      return { ...state, busNumbers: action.payload };

    case 'SET_REGISTERED_BUSES':
      return { ...state, registeredBuses: action.payload };

    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'ADD_COMPANY':
      return {
        ...state,
        companies: [...state.companies, action.payload],
        loading: false,
        error: null
      };

    case 'UPDATE_COMPANY':
      return {
        ...state,
        companies: state.companies.map(company =>
          company.id === action.payload.id ? action.payload.company : company
        ),
        selectedCompany: state.selectedCompany?.id === action.payload.id
          ? action.payload.company
          : state.selectedCompany,
        loading: false,
        error: null
      };

    case 'REMOVE_COMPANY':
      return {
        ...state,
        companies: state.companies.filter(company => company.id !== action.payload),
        selectedCompany: state.selectedCompany?.id === action.payload ? null : state.selectedCompany,
        loading: false,
        error: null
      };

    case 'ADD_BUS_NUMBER':
      return {
        ...state,
        busNumbers: [...state.busNumbers, action.payload],
        loading: false,
        error: null
      };

    case 'UPDATE_BUS_NUMBER':
      return {
        ...state,
        busNumbers: state.busNumbers.map(busNumber =>
          busNumber.id === action.payload.id ? action.payload.busNumber : busNumber
        ),
        loading: false,
        error: null
      };

    case 'REMOVE_BUS_NUMBER':
      return {
        ...state,
        busNumbers: state.busNumbers.filter(busNumber => busNumber.id !== action.payload),
        loading: false,
        error: null
      };

    case 'ADD_REGISTERED_BUS':
      return {
        ...state,
        registeredBuses: [...state.registeredBuses, action.payload],
        loading: false,
        error: null
      };

    case 'UPDATE_REGISTERED_BUS':
      return {
        ...state,
        registeredBuses: state.registeredBuses.map(bus =>
          bus.id === action.payload.id ? action.payload.bus : bus
        ),
        loading: false,
        error: null
      };

    case 'REMOVE_REGISTERED_BUS': {
      console.log('Reducer: Removing registered bus with ID:', action.payload);
      console.log('Current buses:', state.registeredBuses.map(b => ({ id: b.id, reg: b.registrationNumber })));
      const filteredBuses = state.registeredBuses.filter(bus => String(bus.id) !== String(action.payload));
      console.log('Buses after filter:', filteredBuses.map(b => ({ id: b.id, reg: b.registrationNumber })));
      return {
        ...state,
        registeredBuses: filteredBuses,
        loading: false,
        error: null
      };
    }

    default:
      return state;
  }
};

// Context Type
interface CompanyManagementContextType {
  state: CompanyManagementState;
  actions: CompanyManagementActions;
}

// Create Context
const CompanyManagementContext = createContext<CompanyManagementContextType | undefined>(undefined);

// Provider Props
interface CompanyManagementProviderProps {
  children: ReactNode;
}

// Provider Component
export const CompanyManagementProvider: React.FC<CompanyManagementProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(companyManagementReducer, initialState);

  // Helper function to handle errors
  const handleError = useCallback((error: any, context: string) => {
    console.error(`CompanyManagementContext: Error in ${context}:`, error);

    let errorMessage = 'An unexpected error occurred';

    if (error instanceof Error) {
      const managementError = error as CompanyManagementError;
      if (managementError.type) {
        errorMessage = managementError.message;
      } else {
        errorMessage = error.message;
      }
    }

    dispatch({ type: 'SET_ERROR', payload: errorMessage });
  }, []);

  // Navigation Actions
  const selectCompany = useCallback((company: BusCompany) => {
    console.log('CompanyManagementContext: Selecting company:', company.name);
    dispatch({ type: 'SET_SELECTED_COMPANY', payload: company });
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'company-management' });
  }, []);

  const goBackToCompanyList = useCallback(() => {
    console.log('CompanyManagementContext: Going back to company list');
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'company-list' });
    dispatch({ type: 'SET_SELECTED_COMPANY', payload: null });
    dispatch({ type: 'SET_BUS_NUMBERS', payload: [] });
    dispatch({ type: 'SET_REGISTERED_BUSES', payload: [] });
  }, []);

  const setActiveTab = useCallback((tab: 'bus-numbers' | 'registered-buses') => {
    console.log('CompanyManagementContext: Setting active tab:', tab);
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  // Data Loading Actions
  const loadCompanies = useCallback(async () => {
    console.log('CompanyManagementContext: Loading companies');
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    // Use a small delay to ensure the loading state renders before fetch
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const companies = await busCompanyService.getAllCompanies();
      dispatch({ type: 'SET_COMPANIES', payload: companies });
      console.log(`CompanyManagementContext: Loaded ${companies.length} companies`);
    } catch (error) {
      handleError(error, 'loadCompanies');
    }
  }, [handleError]);

  const loadCompanyData = useCallback(async (companyId: string) => {
    console.log('CompanyManagementContext: Loading company data for:', companyId);

    // Force a synchronous state update before async operations
    dispatch({ type: 'SET_LOADING', payload: true });

    // Use a small delay to ensure the loading state renders before fetch
    await new Promise(resolve => setTimeout(resolve, 50));

    console.log('CompanyManagementContext: Starting fetch...');

    try {
      const [busNumbers, registeredBuses] = await Promise.all([
        busCompanyService.getBusNumbersByCompany(companyId),
        busCompanyService.getRegisteredBusesByCompany(companyId)
      ]);

      console.log('CompanyManagementContext: Fetch complete, setting data...');
      dispatch({ type: 'SET_BUS_NUMBERS', payload: busNumbers });
      dispatch({ type: 'SET_REGISTERED_BUSES', payload: registeredBuses });

      console.log(`CompanyManagementContext: Loaded ${busNumbers.length} bus numbers and ${registeredBuses.length} registered buses`);

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      handleError(error, 'loadCompanyData');
    }
  }, [handleError]);

  const searchCompanies = useCallback(async (query: string) => {
    console.log('CompanyManagementContext: Searching companies with query:', query);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });

    try {
      const companies = query.trim()
        ? await busCompanyService.searchCompanies(query)
        : await busCompanyService.getAllCompanies();

      dispatch({ type: 'SET_COMPANIES', payload: companies });
      console.log(`CompanyManagementContext: Found ${companies.length} companies`);
    } catch (error) {
      handleError(error, 'searchCompanies');
    }
  }, [handleError]);

  // Company CRUD Actions
  const createCompany = useCallback(async (companyData: CompanyFormData) => {
    console.log('CompanyManagementContext: Creating company:', companyData.name);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Use the new image-enabled method
      const newCompany = await busCompanyService.createCompanyWithImage(companyData);
      dispatch({ type: 'ADD_COMPANY', payload: newCompany });
      console.log('CompanyManagementContext: Company created successfully:', newCompany.id);
    } catch (error) {
      handleError(error, 'createCompany');
      throw error; // Re-throw so the UI can handle it
    }
  }, [handleError]);

  const updateCompany = useCallback(async (id: string, updates: Partial<CompanyFormData>) => {
    console.log('CompanyManagementContext: Updating company:', id);
    console.log('CompanyManagementContext: Update data:', updates);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Use the new image-enabled method
      const updatedCompany = await busCompanyService.updateCompanyWithImage(id, updates);
      console.log('CompanyManagementContext: Received updated company:', updatedCompany);
      dispatch({ type: 'UPDATE_COMPANY', payload: { id, company: updatedCompany } });
      console.log('CompanyManagementContext: Company updated successfully:', id);
    } catch (error) {
      console.error('CompanyManagementContext: Update error:', error);
      handleError(error, 'updateCompany');
      throw error; // Re-throw so the UI can handle it
    }
  }, [handleError]);

  const deleteCompany = useCallback(async (id: string) => {
    console.log('CompanyManagementContext: Deleting company:', id);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await busCompanyService.deleteCompany(id);
      dispatch({ type: 'REMOVE_COMPANY', payload: id });
      console.log('CompanyManagementContext: Company deleted successfully:', id);
    } catch (error) {
      handleError(error, 'deleteCompany');
      throw error; // Re-throw so the UI can handle it
    }
  }, [handleError]);

  // Bus Number CRUD Actions
  const createBusNumber = useCallback(async (companyId: string, busNumberData: BusNumberFormData) => {
    console.log('CompanyManagementContext: Creating bus number:', busNumberData.busNumber);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const newBusNumber = await busCompanyService.createBusNumber(companyId, busNumberData);
      dispatch({ type: 'ADD_BUS_NUMBER', payload: newBusNumber });
      console.log('CompanyManagementContext: Bus number created successfully:', newBusNumber.id);
    } catch (error) {
      handleError(error, 'createBusNumber');
      throw error;
    }
  }, [handleError]);

  const updateBusNumber = useCallback(async (id: string, updates: Partial<BusNumberFormData>) => {
    console.log('CompanyManagementContext: Updating bus number:', id);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const updatedBusNumber = await busCompanyService.updateBusNumber(id, updates);
      dispatch({ type: 'UPDATE_BUS_NUMBER', payload: { id, busNumber: updatedBusNumber } });
      console.log('CompanyManagementContext: Bus number updated successfully:', id);
    } catch (error) {
      handleError(error, 'updateBusNumber');
      throw error;
    }
  }, [handleError]);

  const deleteBusNumber = useCallback(async (id: string) => {
    console.log('CompanyManagementContext: Deleting bus number:', id);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await busCompanyService.deleteBusNumber(id);
      dispatch({ type: 'REMOVE_BUS_NUMBER', payload: id });
      console.log('CompanyManagementContext: Bus number deleted successfully:', id);
    } catch (error) {
      handleError(error, 'deleteBusNumber');
      throw error;
    }
  }, [handleError]);

  // Registered Bus CRUD Actions
  const createRegisteredBus = useCallback(async (companyId: string, busData: RegisteredBusFormData) => {
    console.log('CompanyManagementContext: Creating registered bus:', busData.registrationNumber);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const newBus = await busCompanyService.createRegisteredBus(companyId, busData);
      // Also create backend bus record if extra fields are present (non-fatal)
      try {
        const companyName = state.selectedCompany?.name;
        await busCompanyService.createBackendBus(companyId, busData, companyName);
      } catch (err) {
        console.warn('CompanyManagementContext: createBackendBus failed (non-fatal)', err);
      }
      dispatch({ type: 'ADD_REGISTERED_BUS', payload: newBus });
      console.log('CompanyManagementContext: Registered bus created successfully:', newBus.id);
    } catch (error) {
      handleError(error, 'createRegisteredBus');
      throw error;
    }
  }, [handleError]);

  const updateRegisteredBus = useCallback(async (id: number, updates: Partial<RegisteredBusFormData>, companyId: string) => {
    console.log('CompanyManagementContext: Updating registered bus:', id);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const updatedBus = await busCompanyService.updateRegisteredBus(id, updates, companyId);
      dispatch({ type: 'UPDATE_REGISTERED_BUS', payload: { id, bus: updatedBus } });
      console.log('CompanyManagementContext: Registered bus updated successfully:', id);
    } catch (error) {
      handleError(error, 'updateRegisteredBus');
      throw error;
    }
  }, [handleError]);

  const deleteRegisteredBus = useCallback(async (id: number) => {
    console.log('CompanyManagementContext: Deleting registered bus:', id);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await busCompanyService.deleteRegisteredBus(id);
      dispatch({ type: 'REMOVE_REGISTERED_BUS', payload: id });
      console.log('CompanyManagementContext: Registered bus deleted successfully:', id);
    } catch (error) {
      handleError(error, 'deleteRegisteredBus');
      throw error;
    }
  }, [handleError]);

  // Create actions object with useMemo to prevent recreation on every render
  const actions: CompanyManagementActions = useMemo(() => ({
    // Navigation
    selectCompany,
    goBackToCompanyList,
    setActiveTab,

    // Data operations
    loadCompanies,
    loadCompanyData,
    searchCompanies,

    // CRUD operations
    createCompany,
    updateCompany,
    deleteCompany,

    // Extended actions for bus numbers and registered buses
    createBusNumber,
    updateBusNumber,
    deleteBusNumber,
    createRegisteredBus,
    updateRegisteredBus,
    deleteRegisteredBus
  }), [
    selectCompany,
    goBackToCompanyList,
    setActiveTab,
    loadCompanies,
    loadCompanyData,
    searchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    createBusNumber,
    updateBusNumber,
    deleteBusNumber,
    createRegisteredBus,
    updateRegisteredBus,
    deleteRegisteredBus
  ]);

  const contextValue: CompanyManagementContextType = {
    state,
    actions
  };

  return (
    <CompanyManagementContext.Provider value={contextValue}>
      {children}
    </CompanyManagementContext.Provider>
  );
};

// Custom hook to use the context
export const useCompanyManagement = (): CompanyManagementContextType => {
  const context = useContext(CompanyManagementContext);
  if (!context) {
    throw new Error('useCompanyManagement must be used within a CompanyManagementProvider');
  }
  return context;
};

export default CompanyManagementContext;
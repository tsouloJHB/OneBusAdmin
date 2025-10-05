// Bus Company Management Types

// Bus Company Interface
export interface BusCompany {
  id: string;
  name: string;
  registrationNumber: string;
  companyCode: string;
  city: string;
  address?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  imagePath?: string;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

// Bus Number Interface
export interface BusNumber {
  id: string;
  busCompanyId: string;
  busNumber: string;
  routeName: string;
  description?: string;
  startDestination: string;
  endDestination: string;
  direction: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
  frequencyMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Registered Bus Interface
export interface RegisteredBus {
  id: string;
  companyId: string;
  companyName: string;
  registrationNumber: string;
  busNumber?: string;
  busId?: string;
  trackerImei: string;
  driverId?: string;
  driverName?: string;
  model: string;
  year: number;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  routeId?: number;
  routeName?: string;
  routeAssignedAt?: Date;
  lastInspection?: Date;
  nextInspection?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Navigation State
export interface NavigationState {
  currentView: 'company-list' | 'company-management';
  selectedCompany?: BusCompany;
  activeTab?: 'bus-numbers' | 'registered-buses';
  breadcrumbs: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  path: string;
  active: boolean;
}

// Company Management State
export interface CompanyManagementState {
  // Data
  companies: BusCompany[];
  selectedCompany: BusCompany | null;
  busNumbers: BusNumber[];
  registeredBuses: RegisteredBus[];
  
  // UI State
  loading: boolean;
  error: string | null;
  currentView: 'company-list' | 'company-management';
  activeTab: 'bus-numbers' | 'registered-buses';
  
  // Search and filters
  searchQuery: string;
  filters: {
    city?: string;
    status?: string;
  };
}

export interface CompanyManagementActions {
  // Navigation
  selectCompany: (company: BusCompany) => void;
  goBackToCompanyList: () => void;
  setActiveTab: (tab: 'bus-numbers' | 'registered-buses') => void;
  
  // Data operations
  loadCompanies: () => Promise<void>;
  loadCompanyData: (companyId: string) => Promise<void>;
  searchCompanies: (query: string) => Promise<void>;
  
  // Company CRUD operations
  createCompany: (company: CompanyFormData) => Promise<void>;
  updateCompany: (id: string, updates: Partial<CompanyFormData>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  
  // Bus Number CRUD operations
  createBusNumber: (companyId: string, busNumber: BusNumberFormData) => Promise<void>;
  updateBusNumber: (id: string, updates: Partial<BusNumberFormData>) => Promise<void>;
  deleteBusNumber: (id: string) => Promise<void>;
  
  // Registered Bus CRUD operations
  createRegisteredBus: (companyId: string, bus: RegisteredBusFormData) => Promise<void>;
  updateRegisteredBus: (id: string, updates: Partial<RegisteredBusFormData>, companyId: string) => Promise<void>;
  deleteRegisteredBus: (id: string) => Promise<void>;
}

// API Response Types
export interface BusCompanyResponse {
  id: number;
  name: string;
  registrationNumber: string;
  companyCode: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isActive: boolean;
  busCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusNumberResponse {
  id: number;
  busCompanyId: number;
  busNumber: string;
  routeName: string;
  description?: string;
  startDestination: string;
  endDestination: string;
  direction: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
  frequencyMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisteredBusResponse {
  id: string;
  companyId: string;
  companyName: string;
  registrationNumber: string;
  busNumber?: string;
  busId?: string;
  trackerImei: string;
  driverId?: string;
  driverName?: string;
  model: string;
  year: number;
  capacity: number;
  status: string;
  routeId?: number;
  routeName?: string;
  routeAssignedAt?: string;
  lastInspection?: string;
  nextInspection?: string;
  createdAt: string;
  updatedAt: string;
}

// Error Handling Types
export enum CompanyManagementErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SERVER_ERROR = 'SERVER_ERROR'
}

export interface CompanyManagementError extends Error {
  type: CompanyManagementErrorType;
  details?: any;
  timestamp: Date;
}

// Form Types
export interface CompanyFormData {
  name: string;
  registrationNumber: string;
  companyCode: string;
  city: string;
  address?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  image?: File | null;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface BusNumberFormData {
  busNumber: string;
  routeName: string;
  description?: string;
  startDestination: string;
  endDestination: string;
  direction: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
  frequencyMinutes: number;
  isActive: boolean;
}

export interface RegisteredBusFormData {
  registrationNumber: string;
  busNumber?: string;
  busId?: string;
  trackerImei: string;
  driverId?: string;
  driverName?: string;
  model: string;
  year: number;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  route?: string; // Selected route name for backend bus creation
  routeId?: number; // Selected route ID for registered bus creation
  routeAssignment?: {
    routeId: string;
    routeName: string;
  };
  lastInspection?: Date;
  nextInspection?: Date;
}

// Search and Filter Types
export interface CompanySearchParams {
  query?: string;
  city?: string;
  status?: string;
  registrationNumber?: string;
  companyCode?: string;
}

export interface BusNumberSearchParams {
  companyId: string;
  query?: string;
  routeId?: string;
  status?: string;
}

export interface RegisteredBusSearchParams {
  companyId: string;
  query?: string;
  status?: string;
  routeId?: string;
  model?: string;
}

// Validation Schema Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

// Component Props Types
export interface CompanyCardProps {
  company: BusCompany;
  onSelect: (company: BusCompany) => void;
  onEdit?: (company: BusCompany) => void;
  onDelete?: (company: BusCompany) => void;
}

export interface CompanySearchProps {
  onSearch: (params: CompanySearchParams) => void;
  loading?: boolean;
  initialQuery?: string;
}

export interface BusNumberManagementProps {
  companyId: string;
  busNumbers: BusNumber[];
  loading?: boolean;
  onAdd: (companyId: string, busNumber: BusNumberFormData) => Promise<void>;
  onEdit: (id: string, updates: Partial<BusNumberFormData>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export interface RegisteredBusesProps {
  companyId: string;
  companyName: string;
  registeredBuses: RegisteredBus[];
  loading?: boolean;
  availableRoutes?: string[];
  onAdd: (companyId: string, bus: RegisteredBusFormData) => Promise<void>;
  onEdit: (id: string, updates: Partial<RegisteredBusFormData>, companyId: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}
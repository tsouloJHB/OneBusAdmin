// Core Data Models
export interface Route {
  id: number;
  name: string; // Keep name for compatibility
  routeName?: string; // Optional for backend compatibility
  description?: string;
  company?: string;
  busNumber?: string;
  direction?: string;
  startPoint: string;
  endPoint: string;
  active?: boolean;
  isActive?: boolean; // For compatibility
  stops?: BusStop[];
  schedule?: Schedule[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Stop {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  order: number;
}

export interface BusStop {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  order: number;
  routeId: number;
  // Optional index used by backend for ordering stops
  busStopIndex?: number;
  // Direction string (e.g., 'Northbound', 'Southbound', 'Bidirectional')
  direction?: string;
}

export interface TemporaryStop {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}



export interface Schedule {
  id: string;
  departureTime: string;
  arrivalTime: string;
  daysOfWeek: string[];
}

export interface Bus {
  id: string;
  busNumber: string;
  capacity: number;
  model: string;
  year: number;
  status: 'active' | 'maintenance' | 'retired';
  assignedRouteId?: string;
  assignedRoute?: Route;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields from backend
  busCompany?: string;
  driverId?: string;
  driverName?: string;
  trackerImei?: string;
}

export interface ActiveBus {
  id: string;
  bus: Bus;
  route: Route;
  currentLocation: {
    lat: number;
    lng: number;
  };
  nextStop: Stop;
  lastStop?: Stop;
  estimatedArrival: Date;
  passengerCount: number;
  status: 'on_route' | 'at_stop' | 'delayed';
  lastUpdated: Date;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'COMPANY_ADMIN' | 'CUSTOMER';
  isActive: boolean;
  lastLogin?: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  type: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'SERVER_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  fieldErrors?: Record<string, string>;
  statusCode?: number;
}

// API Request Types
export interface CreateRouteRequest {
  company: string;
  busNumber: string;
  routeName: string;
  description: string;
  direction: string;
  startPoint: string;
  endPoint: string;
  active: boolean;
}

export interface UpdateRouteRequest extends Partial<CreateRouteRequest> {
  id: number;
}

export interface CreateBusRequest {
  busId: string;
  trackerImei: string;
  busNumber: string;
  route: string;
  busCompany: string;
  driverId: string;
  driverName: string;
}

export interface UpdateBusRequest extends Partial<CreateBusRequest> {
  busId: string; // Use busId instead of id for updates
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string; // ISO timestamp
  email: string;
  fullName: string;
  role: 'ADMIN' | 'COMPANY_ADMIN' | 'CUSTOMER';
}

// Filter and Search Types
export interface RouteFilters {
  search?: string;
  isActive?: boolean;
  company?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface BusFilters {
  search?: string;
  status?: Bus['status'];
  assignedRouteId?: string;
  sortBy?: 'busNumber' | 'capacity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ActiveBusFilters {
  search?: string;
  routeId?: string;
  status?: ActiveBus['status'];
  companyId?: string;
}

// Form Validation Types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}

export type FormState<T> = {
  data: T;
  errors: Record<keyof T, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
};

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

export type TableAction = 'view' | 'edit' | 'delete';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoHide?: boolean;
  duration?: number;
}

// Authentication Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// Dashboard Statistics Types
export interface DashboardStats {
  totalRoutes: number;
  totalBuses: number;
  activeBuses: number;
  totalUsers: number;
  totalCompanies?: number;
  totalTrackers?: number;
  routesChange?: number;
  busesChange?: number;
  usersChange?: number;
  lastUpdated?: string;
  lastSnapshot?: string | null;
  recentActivity?: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'route_created' | 'bus_added' | 'bus_updated' | 'route_updated';
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

// Tracker Types
export interface Tracker {
  id: number;
  imei: string;
  brand: string;
  model: string;
  purchaseDate?: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED' | 'RETIRED';
  companyId?: number;
  companyName?: string;
  assignedBusId?: number;
  assignedBusNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTrackerRequest {
  imei: string;
  brand: string;
  model: string;
  purchaseDate?: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED' | 'RETIRED';
  companyId?: number;
  notes?: string;
}

export interface UpdateTrackerRequest {
  imei?: string;
  brand?: string;
  model?: string;
  purchaseDate?: string;
  status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED' | 'RETIRED';
  companyId?: number;
  notes?: string;
}

export interface TrackerStatistics {
  total: number;
  available: number;
  inUse: number;
  maintenance: number;
  damaged: number;
  retired: number;
}

// Re-export marker types
export * from './marker';
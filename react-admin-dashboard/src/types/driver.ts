export interface Driver {
  id: number;
  driverId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ON_LEAVE';
  companyId?: number;
  companyName?: string;
  isRegisteredByAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  // New fields
  onDuty: boolean;
  currentlyAssignedBusId?: string;
  currentlyAssignedBusNumber?: string;
  lastAssignedBusId?: string;
  lastAssignedBusNumber?: string;
  assignedRouteId?: number;
  assignedRouteName?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  totalHoursWorked?: number;
}

export interface DriverRegistrationRequest {
  driverId: string;
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  companyId?: number;
}

export interface DriverStatistics {
  totalDrivers: number;
  activeDrivers: number;
}

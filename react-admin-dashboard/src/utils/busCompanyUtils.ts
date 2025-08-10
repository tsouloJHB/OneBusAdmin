import {
  BusCompany,
  BusNumber,
  RegisteredBus,
  BusCompanyResponse,
  BusNumberResponse,
  RegisteredBusResponse,
  ValidationSchema,
  ValidationResult,
  CompanyFormData,
  BusNumberFormData,
  RegisteredBusFormData
} from '../types/busCompany';

// Data Transformation Utilities

export const transformBusCompanyResponse = (response: BusCompanyResponse): BusCompany => ({
  id: response.id,
  name: response.name,
  registrationNumber: response.registrationNumber,
  companyCode: response.companyCode,
  city: response.city,
  address: response.address,
  contactInfo: response.contactInfo,
  status: response.status as 'active' | 'inactive' | 'suspended',
  createdAt: new Date(response.createdAt),
  updatedAt: new Date(response.updatedAt)
});

export const transformBusNumberResponse = (response: BusNumberResponse): BusNumber => ({
  id: response.id,
  companyId: response.companyId,
  busNumber: response.busNumber,
  routeId: response.routeId,
  routeName: response.routeName,
  status: response.status as 'active' | 'inactive' | 'maintenance',
  assignedDriver: response.assignedDriver,
  capacity: response.capacity,
  createdAt: new Date(response.createdAt),
  updatedAt: new Date(response.updatedAt)
});

export const transformRegisteredBusResponse = (response: RegisteredBusResponse): RegisteredBus => ({
  id: response.id,
  companyId: response.companyId,
  registrationNumber: response.registrationNumber,
  busNumber: response.busNumber,
  model: response.model,
  year: response.year,
  capacity: response.capacity,
  status: response.status as 'active' | 'inactive' | 'maintenance' | 'retired',
  routeAssignment: response.routeAssignment ? {
    routeId: response.routeAssignment.routeId,
    routeName: response.routeAssignment.routeName,
    assignedAt: new Date(response.routeAssignment.assignedAt)
  } : undefined,
  lastInspection: response.lastInspection ? new Date(response.lastInspection) : undefined,
  nextInspection: response.nextInspection ? new Date(response.nextInspection) : undefined,
  createdAt: new Date(response.createdAt),
  updatedAt: new Date(response.updatedAt)
});

// Validation Utilities

export const companyValidationSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  registrationNumber: {
    required: true,
    pattern: /^[A-Z0-9]{6,20}$/,
    custom: (value: string) => {
      if (!value) return null;
      if (!/^[A-Z0-9]+$/.test(value)) {
        return 'Registration number must contain only uppercase letters and numbers';
      }
      return null;
    }
  },
  companyCode: {
    required: true,
    pattern: /^[A-Z]{2,10}$/,
    custom: (value: string) => {
      if (!value) return null;
      if (!/^[A-Z]+$/.test(value)) {
        return 'Company code must contain only uppercase letters';
      }
      return null;
    }
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  address: {
    maxLength: 200
  },
  'contactInfo.phone': {
    pattern: /^[\+]?[0-9\-\s\(\)]{10,20}$/
  },
  'contactInfo.email': {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

export const busNumberValidationSchema: ValidationSchema = {
  busNumber: {
    required: true,
    pattern: /^[A-Z0-9\-]{3,20}$/,
    custom: (value: string) => {
      if (!value) return null;
      if (!/^[A-Z0-9\-]+$/.test(value)) {
        return 'Bus number must contain only uppercase letters, numbers, and hyphens';
      }
      return null;
    }
  },
  assignedDriver: {
    minLength: 2,
    maxLength: 100
  },
  capacity: {
    custom: (value: number) => {
      if (value !== undefined && value !== null) {
        if (value < 1 || value > 200) {
          return 'Capacity must be between 1 and 200';
        }
      }
      return null;
    }
  }
};

export const registeredBusValidationSchema: ValidationSchema = {
  registrationNumber: {
    required: true,
    pattern: /^[A-Z0-9\-]{6,20}$/,
    custom: (value: string) => {
      if (!value) return null;
      if (!/^[A-Z0-9\-]+$/.test(value)) {
        return 'Registration number must contain only uppercase letters, numbers, and hyphens';
      }
      return null;
    }
  },
  busNumber: {
    pattern: /^[A-Z0-9\-]{3,20}$/
  },
  model: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  year: {
    required: true,
    custom: (value: number) => {
      const currentYear = new Date().getFullYear();
      if (value < 1990 || value > currentYear + 1) {
        return `Year must be between 1990 and ${currentYear + 1}`;
      }
      return null;
    }
  },
  capacity: {
    required: true,
    custom: (value: number) => {
      if (value < 1 || value > 200) {
        return 'Capacity must be between 1 and 200';
      }
      return null;
    }
  }
};

export const validateForm = (data: any, schema: ValidationSchema): ValidationResult => {
  const errors: { [key: string]: string } = {};

  Object.keys(schema).forEach(field => {
    const rule = schema[field];
    const value = getNestedValue(data, field);

    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      return;
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`;
        return;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${field} must be no more than ${rule.maxLength} characters`;
        return;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = `${field} format is invalid`;
        return;
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

// Status Utilities

export const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'warning';
    case 'suspended':
    case 'retired':
      return 'error';
    case 'maintenance':
      return 'warning';
    default:
      return 'default';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'suspended':
      return 'Suspended';
    case 'maintenance':
      return 'Maintenance';
    case 'retired':
      return 'Retired';
    default:
      return status;
  }
};

// Search and Filter Utilities

export const filterCompanies = (companies: BusCompany[], query: string): BusCompany[] => {
  if (!query.trim()) return companies;

  const searchTerm = query.toLowerCase();
  return companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm) ||
    company.registrationNumber.toLowerCase().includes(searchTerm) ||
    company.companyCode.toLowerCase().includes(searchTerm) ||
    company.city.toLowerCase().includes(searchTerm)
  );
};

export const filterBusNumbers = (busNumbers: BusNumber[], query: string): BusNumber[] => {
  if (!query.trim()) return busNumbers;

  const searchTerm = query.toLowerCase();
  return busNumbers.filter(busNumber =>
    busNumber.busNumber.toLowerCase().includes(searchTerm) ||
    (busNumber.routeName && busNumber.routeName.toLowerCase().includes(searchTerm)) ||
    (busNumber.assignedDriver && busNumber.assignedDriver.toLowerCase().includes(searchTerm))
  );
};

export const filterRegisteredBuses = (buses: RegisteredBus[], query: string): RegisteredBus[] => {
  if (!query.trim()) return buses;

  const searchTerm = query.toLowerCase();
  return buses.filter(bus =>
    bus.registrationNumber.toLowerCase().includes(searchTerm) ||
    (bus.busNumber && bus.busNumber.toLowerCase().includes(searchTerm)) ||
    bus.model.toLowerCase().includes(searchTerm) ||
    (bus.routeAssignment && bus.routeAssignment.routeName.toLowerCase().includes(searchTerm))
  );
};

// Date Utilities

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const isInspectionDue = (nextInspection?: Date): boolean => {
  if (!nextInspection) return false;
  const today = new Date();
  const daysUntilInspection = Math.ceil((nextInspection.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilInspection <= 30; // Due within 30 days
};

export const isInspectionOverdue = (nextInspection?: Date): boolean => {
  if (!nextInspection) return false;
  return nextInspection < new Date();
};

// Form Data Transformation

export const companyToFormData = (company: BusCompany): CompanyFormData => ({
  name: company.name,
  registrationNumber: company.registrationNumber,
  companyCode: company.companyCode,
  city: company.city,
  address: company.address,
  contactInfo: company.contactInfo,
  status: company.status
});

export const busNumberToFormData = (busNumber: BusNumber): BusNumberFormData => ({
  busNumber: busNumber.busNumber,
  routeId: busNumber.routeId,
  status: busNumber.status,
  assignedDriver: busNumber.assignedDriver,
  capacity: busNumber.capacity
});

export const registeredBusToFormData = (bus: RegisteredBus): RegisteredBusFormData => ({
  registrationNumber: bus.registrationNumber,
  busNumber: bus.busNumber,
  model: bus.model,
  year: bus.year,
  capacity: bus.capacity,
  status: bus.status,
  routeAssignment: bus.routeAssignment ? {
    routeId: bus.routeAssignment.routeId,
    routeName: bus.routeAssignment.routeName
  } : undefined,
  lastInspection: bus.lastInspection,
  nextInspection: bus.nextInspection
});
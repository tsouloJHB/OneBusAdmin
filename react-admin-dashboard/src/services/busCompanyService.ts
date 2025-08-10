import {
  BusCompany,
  BusNumber,
  RegisteredBus,
  BusCompanyResponse,
  BusNumberResponse,
  RegisteredBusResponse,
  CompanyFormData,
  BusNumberFormData,
  RegisteredBusFormData,
  CompanyManagementError,
  CompanyManagementErrorType
} from '../types/busCompany';
import {
  transformBusCompanyResponse,
  transformBusNumberResponse,
  transformRegisteredBusResponse
} from '../utils/busCompanyUtils';

class BusCompanyService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
  }

  // Helper method for API calls
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      console.log(`BusCompanyService: Making API call to ${url}`);
      const response = await fetch(url, { ...defaultOptions, ...options });

      if (!response.ok) {
        const errorData = await response.text();
        throw this.createError(response.status, errorData, endpoint);
      }

      const data = await response.json();
      console.log(`BusCompanyService: API call successful for ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`BusCompanyService: API call failed for ${endpoint}:`, error);
      if (error instanceof Error && error.name === 'CompanyManagementError') {
        throw error;
      }
      throw this.createError(500, error instanceof Error ? error.message : 'Unknown error', endpoint);
    }
  }

  // Error creation helper
  private createError(status: number, message: string, endpoint: string): CompanyManagementError {
    let type: CompanyManagementErrorType;
    let userMessage: string;

    switch (status) {
      case 400:
        type = CompanyManagementErrorType.VALIDATION_ERROR;
        userMessage = 'Invalid data provided. Please check your input.';
        break;
      case 401:
      case 403:
        type = CompanyManagementErrorType.PERMISSION_DENIED;
        userMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        type = CompanyManagementErrorType.NOT_FOUND;
        userMessage = 'The requested resource was not found.';
        break;
      case 500:
      default:
        type = CompanyManagementErrorType.SERVER_ERROR;
        userMessage = 'A server error occurred. Please try again later.';
        break;
    }

    const error = new Error(userMessage) as CompanyManagementError;
    error.name = 'CompanyManagementError';
    error.type = type;
    error.details = { status, originalMessage: message, endpoint };
    error.timestamp = new Date();

    return error;
  }

  // Company CRUD Operations

  /**
   * Get all bus companies
   */
  async getAllCompanies(): Promise<BusCompany[]> {
    try {
      const response = await this.apiCall<BusCompanyResponse[]>('/api/bus-companies');
      return response.map(transformBusCompanyResponse);
    } catch (error) {
      console.error('BusCompanyService: Error getting all companies:', error);
      throw error;
    }
  }

  /**
   * Get bus company by ID
   */
  async getCompanyById(id: string): Promise<BusCompany> {
    try {
      const response = await this.apiCall<BusCompanyResponse>(`/api/bus-companies/${id}`);
      return transformBusCompanyResponse(response);
    } catch (error) {
      console.error(`BusCompanyService: Error getting company ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new bus company
   */
  async createCompany(companyData: CompanyFormData): Promise<BusCompany> {
    try {
      const response = await this.apiCall<BusCompanyResponse>('/api/bus-companies', {
        method: 'POST',
        body: JSON.stringify(companyData),
      });
      return transformBusCompanyResponse(response);
    } catch (error) {
      console.error('BusCompanyService: Error creating company:', error);
      throw error;
    }
  }

  /**
   * Update an existing bus company
   */
  async updateCompany(id: string, updates: Partial<CompanyFormData>): Promise<BusCompany> {
    try {
      const response = await this.apiCall<BusCompanyResponse>(`/api/bus-companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return transformBusCompanyResponse(response);
    } catch (error) {
      console.error(`BusCompanyService: Error updating company ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a bus company
   */
  async deleteCompany(id: string): Promise<void> {
    try {
      await this.apiCall<void>(`/api/bus-companies/${id}`, {
        method: 'DELETE',
      });
      console.log(`BusCompanyService: Successfully deleted company ${id}`);
    } catch (error) {
      console.error(`BusCompanyService: Error deleting company ${id}:`, error);
      throw error;
    }
  }

  // Company Search Operations

  /**
   * Search companies by name
   */
  async searchCompanies(query: string): Promise<BusCompany[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await this.apiCall<BusCompanyResponse[]>(`/api/bus-companies/search?q=${encodedQuery}`);
      return response.map(transformBusCompanyResponse);
    } catch (error) {
      console.error('BusCompanyService: Error searching companies:', error);
      throw error;
    }
  }

  /**
   * Get companies by city
   */
  async getCompaniesByCity(city: string): Promise<BusCompany[]> {
    try {
      const encodedCity = encodeURIComponent(city);
      const response = await this.apiCall<BusCompanyResponse[]>(`/api/bus-companies/city/${encodedCity}`);
      return response.map(transformBusCompanyResponse);
    } catch (error) {
      console.error(`BusCompanyService: Error getting companies by city ${city}:`, error);
      throw error;
    }
  }

  /**
   * Get company by registration number
   */
  async getCompanyByRegistration(registrationNumber: string): Promise<BusCompany> {
    try {
      const encodedRegNumber = encodeURIComponent(registrationNumber);
      const response = await this.apiCall<BusCompanyResponse>(`/api/bus-companies/registration/${encodedRegNumber}`);
      return transformBusCompanyResponse(response);
    } catch (error) {
      console.error(`BusCompanyService: Error getting company by registration ${registrationNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get company by company code
   */
  async getCompanyByCode(companyCode: string): Promise<BusCompany> {
    try {
      const encodedCode = encodeURIComponent(companyCode);
      const response = await this.apiCall<BusCompanyResponse>(`/api/bus-companies/code/${encodedCode}`);
      return transformBusCompanyResponse(response);
    } catch (error) {
      console.error(`BusCompanyService: Error getting company by code ${companyCode}:`, error);
      throw error;
    }
  }

  // Bus Number Operations

  /**
   * Get bus numbers by company ID
   */
  async getBusNumbersByCompany(companyId: string): Promise<BusNumber[]> {
    try {
      const response = await this.apiCall<BusNumberResponse[]>(`/api/bus-numbers/company/${companyId}`);
      return response.map(transformBusNumberResponse);
    } catch (error) {
      console.error(`BusCompanyService: Error getting bus numbers for company ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new bus number
   */
  async createBusNumber(companyId: string, busNumberData: BusNumberFormData): Promise<BusNumber> {
    try {
      const requestData = {
        ...busNumberData,
        companyId
      };
      const response = await this.apiCall<BusNumberResponse>('/api/bus-numbers', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      return transformBusNumberResponse(response);
    } catch (error) {
      console.error('BusCompanyService: Error creating bus number:', error);
      throw error;
    }
  }

  /**
   * Update an existing bus number
   */
  async updateBusNumber(id: string, updates: Partial<BusNumberFormData>): Promise<BusNumber> {
    try {
      const response = await this.apiCall<BusNumberResponse>(`/api/bus-numbers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return transformBusNumberResponse(response);
    } catch (error) {
      console.error(`BusCompanyService: Error updating bus number ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a bus number
   */
  async deleteBusNumber(id: string): Promise<void> {
    try {
      await this.apiCall<void>(`/api/bus-numbers/${id}`, {
        method: 'DELETE',
      });
      console.log(`BusCompanyService: Successfully deleted bus number ${id}`);
    } catch (error) {
      console.error(`BusCompanyService: Error deleting bus number ${id}:`, error);
      throw error;
    }
  }

  // Registered Bus Operations

  /**
   * Get registered buses by company ID
   */
  async getRegisteredBusesByCompany(companyId: string): Promise<RegisteredBus[]> {
    try {
      const response = await this.apiCall<RegisteredBusResponse[]>(`/api/registered-buses/company/${companyId}`);
      return response.map(transformRegisteredBusResponse);
    } catch (error) {
      console.error(`BusCompanyService: Error getting registered buses for company ${companyId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new registered bus
   */
  async createRegisteredBus(companyId: string, busData: RegisteredBusFormData): Promise<RegisteredBus> {
    try {
      const requestData = {
        ...busData,
        companyId,
        // Transform dates to ISO strings for API
        lastInspection: busData.lastInspection?.toISOString(),
        nextInspection: busData.nextInspection?.toISOString(),
      };
      const response = await this.apiCall<RegisteredBusResponse>('/api/registered-buses', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      return transformRegisteredBusResponse(response);
    } catch (error) {
      console.error('BusCompanyService: Error creating registered bus:', error);
      throw error;
    }
  }

  /**
   * Update an existing registered bus
   */
  async updateRegisteredBus(id: string, updates: Partial<RegisteredBusFormData>): Promise<RegisteredBus> {
    try {
      const requestData = {
        ...updates,
        // Transform dates to ISO strings for API
        lastInspection: updates.lastInspection?.toISOString(),
        nextInspection: updates.nextInspection?.toISOString(),
      };
      const response = await this.apiCall<RegisteredBusResponse>(`/api/registered-buses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
      return transformRegisteredBusResponse(response);
    } catch (error) {
      console.error(`BusCompanyService: Error updating registered bus ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a registered bus
   */
  async deleteRegisteredBus(id: string): Promise<void> {
    try {
      await this.apiCall<void>(`/api/registered-buses/${id}`, {
        method: 'DELETE',
      });
      console.log(`BusCompanyService: Successfully deleted registered bus ${id}`);
    } catch (error) {
      console.error(`BusCompanyService: Error deleting registered bus ${id}:`, error);
      throw error;
    }
  }

  // Utility Methods

  /**
   * Check if a company code is available
   */
  async isCompanyCodeAvailable(companyCode: string, excludeId?: string): Promise<boolean> {
    try {
      await this.getCompanyByCode(companyCode);
      // If we get here, the code exists
      return false;
    } catch (error) {
      // If it's a not found error, the code is available
      if (error instanceof Error && (error as CompanyManagementError).type === CompanyManagementErrorType.NOT_FOUND) {
        return true;
      }
      // For other errors, we can't determine availability
      throw error;
    }
  }

  /**
   * Check if a registration number is available
   */
  async isRegistrationNumberAvailable(registrationNumber: string, excludeId?: string): Promise<boolean> {
    try {
      await this.getCompanyByRegistration(registrationNumber);
      // If we get here, the registration number exists
      return false;
    } catch (error) {
      // If it's a not found error, the registration number is available
      if (error instanceof Error && (error as CompanyManagementError).type === CompanyManagementErrorType.NOT_FOUND) {
        return true;
      }
      // For other errors, we can't determine availability
      throw error;
    }
  }
}

// Create and export a singleton instance
export const busCompanyService = new BusCompanyService();
export default busCompanyService;
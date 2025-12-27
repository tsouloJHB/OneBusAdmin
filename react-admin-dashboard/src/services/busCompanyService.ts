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
    // If REACT_APP_API_BASE_URL is not provided, default to the local backend port used in dev (8081).
    // You can override with an env var (REACT_APP_API_BASE_URL) when running the frontend.
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api';
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

      // Some endpoints (e.g., DELETE) return 204 No Content; avoid parsing JSON in that case
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        console.log(`BusCompanyService: API call successful (no content) for ${endpoint}`);
        return null as unknown as T;
      }

      const data = await response.json();
      console.log(`BusCompanyService: API call successful for ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`BusCompanyService: API call failed for ${endpoint}:`, error);
      if (error instanceof Error && error.name === 'CompanyManagementError') {
        throw error;
      }
      
      // Handle network errors (connection refused, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw this.createError(404, 'API server not available', endpoint);
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
        // Prefer server-provided validation details when available so the UI can show precise messages.
        if (message) {
          try {
              const parsed = JSON.parse(message);
              // Common backend shapes: { message: '...' } or { error: '...' }
              if (parsed && typeof parsed === 'object') {
                userMessage = parsed.message || parsed.error || JSON.stringify(parsed);
              } else {
                userMessage = String(parsed);
              }
          } catch (e) {
            // Not JSON - use raw text
            userMessage = message;
          }
        } else {
          userMessage = 'Invalid data provided. Please check your input.';
        }
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
      const response = await this.apiCall<BusCompanyResponse[]>('/bus-companies');
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
      const response = await this.apiCall<BusCompanyResponse>(`/bus-companies/${id}`);
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
      // Transform the form data to match API expectations
      const apiData = {
        name: companyData.name,
        registrationNumber: companyData.registrationNumber,
        companyCode: companyData.companyCode,
        email: companyData.contactInfo?.email || '',
        phone: companyData.contactInfo?.phone || '',
        address: companyData.address || '',
        city: companyData.city,
        postalCode: '', // Add default values for required fields
        country: 'South Africa', // Default country
        isActive: companyData.status === 'active'
      };
      
      console.log('BusCompanyService: Creating company with data:', apiData);
      
      const response = await this.apiCall<BusCompanyResponse>('/bus-companies', {
        method: 'POST',
        body: JSON.stringify(apiData),
      });
      
      console.log('BusCompanyService: Company created successfully:', response);
      return transformBusCompanyResponse(response);
    } catch (error) {
      console.error('BusCompanyService: Error creating company:', error);
      console.error('BusCompanyService: Form data was:', companyData);
      throw error;
    }
  }

  /**
   * Create a new bus company with image
   */
  async createCompanyWithImage(companyData: CompanyFormData): Promise<BusCompany> {
    try {
      // If there's an image, use multipart endpoint
      if (companyData.image) {
        return this.createCompanyMultipart(companyData);
      }
      
      // Otherwise use regular JSON endpoint
      return this.createCompany(companyData);
    } catch (error) {
      console.error('BusCompanyService: Error creating company with image:', error);
      throw error;
    }
  }

  /**
   * Create company using multipart form data
   */
  private async createCompanyMultipart(companyData: CompanyFormData): Promise<BusCompany> {
    const formData = new FormData();
    
    // Add form fields
    formData.append('name', companyData.name);
    formData.append('registrationNumber', companyData.registrationNumber);
    formData.append('companyCode', companyData.companyCode);
    formData.append('city', companyData.city);
    
    if (companyData.contactInfo?.email) {
      formData.append('email', companyData.contactInfo.email);
    }
    if (companyData.contactInfo?.phone) {
      formData.append('phone', companyData.contactInfo.phone);
    }
    if (companyData.address) {
      formData.append('address', companyData.address);
    }
    
    formData.append('country', 'South Africa');
    formData.append('isActive', (companyData.status === 'active').toString());
    
    // Add image file
    if (companyData.image) {
      formData.append('image', companyData.image);
    }

    try {
      const url = `${this.baseUrl}/bus-companies`;
      console.log(`BusCompanyService: Creating company with image at ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw this.createError(response.status, errorData, '/bus-companies');
      }

      const data = await response.json();
      console.log('BusCompanyService: Company created successfully with image:', data);
      return transformBusCompanyResponse(data);
    } catch (error) {
      console.error('BusCompanyService: Error in multipart create:', error);
      throw error;
    }
  }

  /**
   * Update an existing bus company
   */
  async updateCompany(id: string, updates: Partial<CompanyFormData>): Promise<BusCompany> {
    try {
      console.log('BusCompanyService: Updating company with data:', updates);
      
      // Transform the form data to match API expectations
      const apiData: any = {};
      if (updates.name !== undefined) apiData.name = updates.name;
      if (updates.registrationNumber !== undefined) apiData.registrationNumber = updates.registrationNumber;
      if (updates.companyCode !== undefined) apiData.companyCode = updates.companyCode;
      if (updates.contactInfo?.email !== undefined) apiData.email = updates.contactInfo.email;
      if (updates.contactInfo?.phone !== undefined) apiData.phone = updates.contactInfo.phone;
      if (updates.address !== undefined) apiData.address = updates.address;
      if (updates.city !== undefined) apiData.city = updates.city;
      if (updates.status !== undefined) apiData.isActive = updates.status === 'active';
      
      console.log('BusCompanyService: Transformed API data:', apiData);
      console.log('BusCompanyService: API URL:', `${this.baseUrl}/bus-companies/${id}`);
      
      const response = await this.apiCall<BusCompanyResponse>(`/bus-companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(apiData),
      });
      
      console.log('BusCompanyService: Update response:', response);
      const transformedResponse = transformBusCompanyResponse(response);
      console.log('BusCompanyService: Transformed response:', transformedResponse);
      return transformedResponse;
    } catch (error) {
      console.error(`BusCompanyService: Error updating company ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing bus company with image
   */
  async updateCompanyWithImage(id: string, updates: Partial<CompanyFormData>): Promise<BusCompany> {
    try {
      // If there's an image, use multipart endpoint
      if (updates.image) {
        return this.updateCompanyMultipart(id, updates);
      }
      
      // Otherwise use regular JSON endpoint
      return this.updateCompany(id, updates);
    } catch (error) {
      console.error('BusCompanyService: Error updating company with image:', error);
      throw error;
    }
  }

  /**
   * Update company using multipart form data
   */
  private async updateCompanyMultipart(id: string, updates: Partial<CompanyFormData>): Promise<BusCompany> {
    const formData = new FormData();
    
    // Add form fields (only if they're provided)
    if (updates.name !== undefined) formData.append('name', updates.name);
    if (updates.registrationNumber !== undefined) formData.append('registrationNumber', updates.registrationNumber);
    if (updates.companyCode !== undefined) formData.append('companyCode', updates.companyCode);
    if (updates.city !== undefined) formData.append('city', updates.city);
    if (updates.contactInfo?.email !== undefined) formData.append('email', updates.contactInfo.email);
    if (updates.contactInfo?.phone !== undefined) formData.append('phone', updates.contactInfo.phone);
    if (updates.address !== undefined) formData.append('address', updates.address);
    if (updates.status !== undefined) formData.append('isActive', (updates.status === 'active').toString());
    
    // Add image file
    if (updates.image) {
      formData.append('image', updates.image);
    }

    try {
      const url = `${this.baseUrl}/bus-companies/${id}`;
      console.log(`BusCompanyService: Updating company with image at ${url}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw this.createError(response.status, errorData, `/bus-companies/${id}`);
      }

      const data = await response.json();
      console.log('BusCompanyService: Company updated successfully with image:', data);
      return transformBusCompanyResponse(data);
    } catch (error) {
      console.error('BusCompanyService: Error in multipart update:', error);
      throw error;
    }
  }

  /**
   * Delete company image
   */
  async deleteCompanyImage(id: string): Promise<void> {
    try {
      await this.apiCall<void>(`/bus-companies/${id}/image`, {
        method: 'DELETE',
      });
      console.log(`BusCompanyService: Successfully deleted company image for ${id}`);
    } catch (error) {
      console.error(`BusCompanyService: Error deleting company image ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a bus company
   */
  async deleteCompany(id: string): Promise<void> {
    try {
      await this.apiCall<void>(`/bus-companies/${id}`, {
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
      const response = await this.apiCall<BusCompanyResponse[]>(`/bus-companies/search?q=${encodedQuery}`);
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
      const response = await this.apiCall<BusCompanyResponse[]>(`/bus-companies/city/${encodedCity}`);
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
      const response = await this.apiCall<BusCompanyResponse>(`/bus-companies/registration/${encodedRegNumber}`);
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
      const response = await this.apiCall<BusCompanyResponse>(`/bus-companies/code/${encodedCode}`);
      return transformBusCompanyResponse(response);
    } catch (error) {
      console.error(`BusCompanyService: Error getting company by code ${companyCode}:`, error);
      throw error;
    }
  }

  // Bus Number Operations

  /**
   * Get all bus numbers
   */
  async getAllBusNumbers(): Promise<BusNumber[]> {
    try {
      const response = await this.apiCall<BusNumberResponse[]>('/bus-numbers');
      return response.map(transformBusNumberResponse);
    } catch (error) {
      console.error('BusCompanyService: Error getting all bus numbers:', error);
      throw error;
    }
  }

  /**
   * Get bus numbers by company ID
   */
  async getBusNumbersByCompany(companyId: string): Promise<BusNumber[]> {
    try {
      // Get all bus numbers and filter by company ID
      const allBusNumbers = await this.getAllBusNumbers();
      return allBusNumbers.filter(busNumber => busNumber.busCompanyId === companyId);
    } catch (error) {
      console.error(`BusCompanyService: Error getting bus numbers for company ${companyId}:`, error);
      
      // If it's a 404 or connection error, return empty array for development
      if (error instanceof Error && (error as CompanyManagementError).type === CompanyManagementErrorType.NOT_FOUND) {
        console.log('BusCompanyService: API not available, returning empty bus numbers list for development');
        return [];
      }
      
      throw error;
    }
  }

  /**
   * Get bus number by ID
   */
  async getBusNumberById(id: string): Promise<BusNumber> {
    try {
      const response = await this.apiCall<BusNumberResponse>(`/bus-numbers/${id}`);
      return transformBusNumberResponse(response);
    } catch (error) {
      console.error(`BusCompanyService: Error getting bus number ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all active bus numbers
   */
  async getActiveBusNumbers(): Promise<BusNumber[]> {
    try {
      const response = await this.apiCall<BusNumberResponse[]>('/bus-numbers/active');
      return response.map(transformBusNumberResponse);
    } catch (error) {
      console.error('BusCompanyService: Error getting active bus numbers:', error);
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
        busCompanyId: parseInt(companyId)
      };
      
      console.log('=== BUS COMPANY SERVICE CREATE ===');
      console.log('BusCompanyService: Creating bus number with data:', requestData);
      console.log('BusCompanyService: Company ID:', companyId);
      console.log('BusCompanyService: Parsed Company ID:', parseInt(companyId));
      console.log('BusCompanyService: API URL:', `${this.baseUrl}/bus-numbers`);
      
      const response = await this.apiCall<BusNumberResponse>('/bus-numbers', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      
      console.log('BusCompanyService: Bus number created successfully:', response);
      const transformedResponse = transformBusNumberResponse(response);
      console.log('BusCompanyService: Transformed response:', transformedResponse);
      return transformedResponse;
    } catch (error) {
      console.error('BusCompanyService: Error creating bus number:', error);
      console.error('BusCompanyService: Error type:', typeof error);
      console.error('BusCompanyService: Error message:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Update an existing bus number
   */
  async updateBusNumber(id: string, updates: Partial<BusNumberFormData>): Promise<BusNumber> {
    try {
      console.log('BusCompanyService: Updating bus number with data:', updates);
      
      // First get the existing bus number to retrieve the busCompanyId
      const existingBusNumber = await this.getBusNumberById(id);
      console.log('BusCompanyService: Existing bus number:', existingBusNumber);
      
      // Transform the data to match API expectations
      const requestData = {
        ...updates,
        busCompanyId: parseInt(existingBusNumber.busCompanyId) // Include required busCompanyId
      };
      
      console.log('BusCompanyService: Transformed request data:', requestData);
      console.log('BusCompanyService: API URL:', `${this.baseUrl}/bus-numbers/${id}`);
      
      const response = await this.apiCall<BusNumberResponse>(`/bus-numbers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(requestData),
      });
      
      console.log('BusCompanyService: Bus number updated successfully:', response);
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
      await this.apiCall<void>(`/bus-numbers/${id}`, {
        method: 'DELETE',
      });
      console.log(`BusCompanyService: Successfully deleted bus number ${id}`);
    } catch (error) {
      console.error(`BusCompanyService: Error deleting bus number ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate a bus number
   */
  async activateBusNumber(id: string): Promise<BusNumber> {
    try {
      const response = await this.apiCall<BusNumberResponse>(`/bus-numbers/${id}/activate`, {
        method: 'PATCH',
      });
      console.log(`BusCompanyService: Successfully activated bus number ${id}`);
      return transformBusNumberResponse(response);
    } catch (error) {
      console.error(`BusCompanyService: Error activating bus number ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate a bus number
   */
  async deactivateBusNumber(id: string): Promise<BusNumber> {
    try {
      const response = await this.apiCall<BusNumberResponse>(`/bus-numbers/${id}/deactivate`, {
        method: 'PATCH',
      });
      console.log(`BusCompanyService: Successfully deactivated bus number ${id}`);
      return transformBusNumberResponse(response);
    } catch (error) {
      console.error(`BusCompanyService: Error deactivating bus number ${id}:`, error);
      throw error;
    }
  }

  // Registered Bus Operations

  /**
   * Get registered buses by company ID
   */
  async getRegisteredBusesByCompany(companyId: string): Promise<RegisteredBus[]> {
    try {
      // Use the registered-buses endpoint which directly queries the registered_buses table
      const response = await this.apiCall<RegisteredBusResponse[]>(`/registered-buses/company/${companyId}`);
      
      // Transform response to RegisteredBus format
      return response.map(transformRegisteredBusResponse);
    } catch (error) {
      console.error(`BusCompanyService: Error getting registered buses for company ${companyId}:`, error);
      
      // If it's a 404 or connection error, return empty array for development
      if (error instanceof Error && (error as CompanyManagementError).type === CompanyManagementErrorType.NOT_FOUND) {
        console.log('BusCompanyService: API not available, returning empty registered buses list for development');
        return [];
      }
      
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
        // Map route fields for backend
        routeId: busData.routeId,
        routeName: busData.route,
      };
      const response = await this.apiCall<RegisteredBusResponse>('/registered-buses', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      console.log('BusCompanyService: Registered bus created successfully:', response); 

      // Also create/update the consolidated Bus record so the Active Buses view sees it
      try {
        await this.createBackendBus(companyId, busData, response.companyName);
      } catch (e) {
        // Non-fatal: log and continue
        console.error('BusCompanyService: createBackendBus fallback failed:', e);
      }

      return transformRegisteredBusResponse(response);
    } catch (error) {
      console.error('BusCompanyService: Error creating registered bus:', error);
      throw error;
    }
  }

  /**
   * Create backend Bus record when registering a bus (optional)
   */
  async createBackendBus(companyId: string, busData: RegisteredBusFormData, companyName?: string): Promise<any> {
    try {
      // Build payload expected by backend /api/buses
      const payload: any = {
        busId: busData.busId || undefined,
        trackerImei: busData.trackerImei || undefined,
        busNumber: busData.busNumber || undefined,
        route: busData.route || undefined,
        busCompanyName: companyName || undefined,
        driverId: (busData as any).driverId || undefined,
        driverName: (busData as any).driverName || undefined
      };

      // Remove undefined keys
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      // POST to /buses
      const response = await this.apiCall('/buses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('BusCompanyService: Backend bus created:', response);
      return response;
    } catch (error) {
      console.error('BusCompanyService: Error creating backend bus:', error);
      // Non-fatal: don't throw to avoid blocking registered-bus creation
      return null;
    }
  }

  /**
   * Update an existing registered bus
   */
  async updateRegisteredBus(id: number, updates: Partial<RegisteredBusFormData>, companyId?: string): Promise<RegisteredBus> {
    try {
      // First get the existing bus data
      let existingBus: RegisteredBus | undefined;

      if (companyId) {
        // Get all registered buses for the company and find the one with matching ID
        const allBuses = await this.getRegisteredBusesByCompany(companyId);
        existingBus = allBuses.find(bus => bus.id === id);
      }

      if (!existingBus) {
        throw new Error(`Registered bus with ID ${id} not found`);
      }

      const requestData = {
        // Start with existing data
        companyId: existingBus.companyId,
        registrationNumber: existingBus.registrationNumber,
        busNumber: existingBus.busNumber,
        model: existingBus.model,
        year: existingBus.year,
        capacity: existingBus.capacity,
        status: existingBus.status,
        // Apply updates
        ...updates,
        // Transform dates to ISO strings for API
        lastInspection: updates.lastInspection?.toISOString() || existingBus.lastInspection?.toISOString(),
        nextInspection: updates.nextInspection?.toISOString() || existingBus.nextInspection?.toISOString(),
        // Map route fields for backend (prefer updates over existing)
        routeId: updates.routeId !== undefined ? updates.routeId : existingBus.routeId,
        routeName: updates.route ? updates.route : existingBus.routeName,
      };

      const response = await this.apiCall<RegisteredBusResponse>(`/registered-buses/${id}`, {
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
  async deleteRegisteredBus(id: number): Promise<void> {
    try {
      await this.apiCall<void>(`/registered-buses/${id}`, {
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

  /**
   * Get all available routes
   */
  async getRoutes(): Promise<any[]> {
    try {
      const response = await this.apiCall<any[]>('/routes');
      return response;
    } catch (error) {
      console.error('BusCompanyService: Error getting routes:', error);
      throw error;
    }
  }

  /**
   * Get routes for a specific bus number and company
   */
  async getRoutesByBusNumberAndCompany(busNumber: string, companyName: string): Promise<any[]> {
    try {
      const encodedCompanyName = encodeURIComponent(companyName);
      const response = await this.apiCall<any>(`/routes/${busNumber}/${encodedCompanyName}`);
      // The API returns an object with a 'routes' array
      return response.routes || [];
    } catch (error) {
      console.error('BusCompanyService: Error getting routes by bus number and company:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const busCompanyService = new BusCompanyService();
export default busCompanyService;
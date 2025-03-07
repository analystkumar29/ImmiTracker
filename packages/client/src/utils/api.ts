import axios from 'axios';
import { store } from '../store';
import { toast } from 'react-hot-toast';
import { logout } from '../store/slices/authSlice';
import { handleError, ErrorType } from './errorHandler';

// Base API URL - use environment variable if available, otherwise fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Explicitly disable caching for all requests
api.defaults.headers.common['Cache-Control'] = 'no-cache, no-store, must-revalidate';
api.defaults.headers.common['Pragma'] = 'no-cache';
api.defaults.headers.common['Expires'] = '0';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const { token } = store.getState().auth;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from Redux store
    const { token } = store.getState().auth;
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Also try to get token from localStorage as a fallback
      const localToken = localStorage.getItem('token');
      if (localToken) {
        config.headers.Authorization = `Bearer ${localToken}`;
      }
    }
    
    // Add cache busting for GET requests
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime() // Add timestamp to prevent caching
      };
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const parsedError = handleError(error);
    
    // Handle authentication errors (401) by logging out the user
    if (parsedError.type === ErrorType.AUTHENTICATION) {
      store.dispatch(logout());
      // Redirect to login page with a message
      window.location.href = '/login?session_expired=true';
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Wrapper function for API calls with better error handling
export const apiCall = async <T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  options?: {
    showErrorToast?: boolean;
    customErrorMessage?: string;
    showSuccessToast?: boolean;
    successMessage?: string;
  }
): Promise<T> => {
  const defaultOptions = {
    showErrorToast: true,
    showSuccessToast: false,
    ...options
  };

  try {
    let response;
    
    switch (method) {
      case 'get':
        response = await api.get<T>(url);
        break;
      case 'post':
        response = await api.post<T>(url, data);
        break;
      case 'put':
        response = await api.put<T>(url, data);
        break;
      case 'delete':
        response = await api.delete<T>(url);
        break;
    }
    
    // Show success toast if requested
    if (defaultOptions.showSuccessToast && defaultOptions.successMessage) {
      toast.success(defaultOptions.successMessage);
    }
    
    return response.data;
  } catch (error) {
    // Error handling is done in the interceptor, but we can add custom handling here
    if (defaultOptions.showErrorToast && defaultOptions.customErrorMessage) {
      toast.error(defaultOptions.customErrorMessage);
    }
    
    throw error;
  }
};

// Get milestone templates by program type and subtype
export const getMilestoneTemplates = async (programType: string, programSubType?: string, includeUnapproved = false) => {
  try {
    // If programType is provided, use the path parameter endpoint
    if (programType) {
      const params = new URLSearchParams();
      if (programSubType) params.append('subType', programSubType);
      params.append('includeUnapproved', String(includeUnapproved));
      
      return await apiCall<any>('get', `/milestones/templates/${encodeURIComponent(programType)}?${params.toString()}`);
    } else {
      // If no programType, use the general endpoint
      const params = new URLSearchParams();
      params.append('includeUnapproved', String(includeUnapproved));
      
      return await apiCall<any>('get', `/milestones/templates?${params.toString()}`);
    }
  } catch (error) {
    handleError(error, 'Failed to fetch milestone templates');
    throw error;
  }
};

// Milestone flagging
export const flagMilestoneTemplate = async (templateId: string) => {
  try {
    return await apiCall<any>(
      'post', 
      `/milestones/templates/${templateId}/flag`,
      null,
      { 
        showSuccessToast: true, 
        successMessage: 'Milestone has been flagged for review' 
      }
    );
  } catch (error) {
    handleError(error, 'Failed to flag milestone template');
    throw error;
  }
};

export const unflagMilestoneTemplate = async (templateId: string) => {
  try {
    return await apiCall<any>(
      'post', 
      `/milestones/templates/${templateId}/unflag`,
      null,
      { 
        showSuccessToast: true, 
        successMessage: 'Flag has been removed from milestone' 
      }
    );
  } catch (error) {
    handleError(error, 'Failed to unflag milestone template');
    throw error;
  }
};

// Application Types
export const getApplicationTypes = async (includeNonDefault = false) => {
  try {
    const params = new URLSearchParams();
    params.append('includeNonDefault', String(includeNonDefault));
    
    return await apiCall<any>('get', `/application-types?${params.toString()}`);
  } catch (error) {
    handleError(error, 'Failed to fetch application types');
    throw error;
  }
};

export const getApplicationTypesByCategory = async (category: string) => {
  try {
    return await apiCall<any>('get', `/application-types/category/${category}`);
  } catch (error) {
    handleError(error, 'Failed to fetch application types by category');
    throw error;
  }
};

export const createApplicationType = async (data: {
  name: string,
  description?: string,
  category: string
}) => {
  try {
    return await apiCall<any>(
      'post', 
      '/application-types', 
      data,
      {
        showSuccessToast: true,
        successMessage: 'Application type created successfully'
      }
    );
  } catch (error) {
    handleError(error, 'Failed to create application type');
    throw error;
  }
};

// Application Type flagging
export const flagApplicationType = async (typeId: string) => {
  try {
    return await apiCall<any>(
      'post', 
      `/application-types/${typeId}/flag`,
      null,
      {
        showSuccessToast: true,
        successMessage: 'Application type has been flagged for review'
      }
    );
  } catch (error) {
    handleError(error, 'Failed to flag application type');
    throw error;
  }
};

export const unflagApplicationType = async (typeId: string) => {
  try {
    return await apiCall<any>(
      'post', 
      `/application-types/${typeId}/unflag`,
      null,
      {
        showSuccessToast: true,
        successMessage: 'Flag has been removed from application type'
      }
    );
  } catch (error) {
    handleError(error, 'Failed to unflag application type');
    throw error;
  }
};

export const getAllUniqueMilestoneTemplates = async (includeUnapproved = false) => {
  try {
    const params = new URLSearchParams();
    if (includeUnapproved) {
      params.append('includeUnapproved', 'true');
    }
    
    const response = await axios.get(`/api/milestones/templates/all/unique?${params.toString()}`);
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to fetch milestone templates');
    return [];
  }
};

export const updateApplicationStatus = async (applicationId: string, statusUpdate: {
  statusName: string;
  statusDate: string;
  notes?: string;
}) => {
  try {
    const response = await axios.post(`/api/applications/${applicationId}/status`, statusUpdate);
    return response.data;
  } catch (error) {
    handleError(error, 'Failed to update application status');
    throw error;
  }
};

/**
 * Get milestone templates grouped by category
 */
export const getMilestoneTemplatesByCategory = async (programType?: string, programSubType?: string) => {
  try {
    const params = new URLSearchParams();
    if (programType) params.append('programType', programType);
    if (programSubType) params.append('programSubType', programSubType);
    
    return await apiCall<Record<string, any[]>>('get', `/milestones/templates/category?${params.toString()}`);
  } catch (error) {
    handleError(error, 'Failed to fetch milestone templates by category');
    throw error;
  }
};

/**
 * Run milestone normalization process (admin only)
 */
export const normalizeMilestones = async (merge = false) => {
  try {
    const params = new URLSearchParams();
    params.append('merge', merge.toString());
    
    return await apiCall<any>(
      'post', 
      `/milestones/normalize?${params.toString()}`,
      null,
      {
        showSuccessToast: true,
        successMessage: merge 
          ? 'Milestone normalization and merging completed successfully' 
          : 'Milestone normalization completed successfully'
      }
    );
  } catch (error) {
    handleError(error, 'Failed to normalize milestones');
    throw error;
  }
}; 
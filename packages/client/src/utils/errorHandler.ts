import { toast } from 'react-hot-toast';
import axios, { AxiosError } from 'axios';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// Error response structure
export interface ErrorResponse {
  type: ErrorType;
  message: string;
  details?: string | Record<string, string[]>;
  statusCode?: number;
}

/**
 * Parses an error and returns a standardized error response
 */
export const parseError = (error: unknown): ErrorResponse => {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Network errors (no response received)
    if (axiosError.code === 'ECONNABORTED' || !axiosError.response) {
      return {
        type: ErrorType.NETWORK,
        message: 'Network error. Please check your connection and try again.',
        statusCode: 0
      };
    }
    
    // Server responded with an error
    const statusCode = axiosError.response.status;
    const responseData = axiosError.response.data as any;
    
    // Authentication errors
    if (statusCode === 401) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: responseData?.message || 'Your session has expired. Please log in again.',
        statusCode
      };
    }
    
    // Authorization errors
    if (statusCode === 403) {
      return {
        type: ErrorType.AUTHORIZATION,
        message: responseData?.message || 'You do not have permission to perform this action.',
        statusCode
      };
    }
    
    // Not found errors
    if (statusCode === 404) {
      return {
        type: ErrorType.NOT_FOUND,
        message: responseData?.message || 'The requested resource was not found.',
        statusCode
      };
    }
    
    // Validation errors
    if (statusCode === 400 || statusCode === 422) {
      return {
        type: ErrorType.VALIDATION,
        message: responseData?.message || 'Validation error. Please check your input.',
        details: responseData?.errors || responseData?.details,
        statusCode
      };
    }
    
    // Server errors
    if (statusCode >= 500) {
      return {
        type: ErrorType.SERVER,
        message: 'Server error. Please try again later or contact support.',
        statusCode
      };
    }
    
    // Other HTTP errors
    return {
      type: ErrorType.UNKNOWN,
      message: responseData?.message || 'An unexpected error occurred.',
      statusCode
    };
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'An unexpected error occurred.'
    };
  }
  
  // Handle unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred.'
  };
};

/**
 * Handles an error by parsing it and showing appropriate notifications
 */
export const handleError = (error: unknown, customMessage?: string): ErrorResponse => {
  const parsedError = parseError(error);
  
  // Show toast notification with appropriate message
  if (customMessage) {
    toast.error(customMessage);
  } else {
    toast.error(parsedError.message);
  }
  
  // Log the error to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error details:', error);
  }
  
  // Special handling for authentication errors
  if (parsedError.type === ErrorType.AUTHENTICATION) {
    // Could trigger a logout action or redirect to login
    // store.dispatch(logout());
    // window.location.href = '/login';
  }
  
  return parsedError;
};

/**
 * Extracts field-specific error messages from validation errors
 */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  const parsedError = parseError(error);
  const fieldErrors: Record<string, string> = {};
  
  if (parsedError.type === ErrorType.VALIDATION && parsedError.details) {
    if (typeof parsedError.details === 'object') {
      // Convert array of errors per field to single message
      Object.entries(parsedError.details).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          fieldErrors[field] = messages[0];
        }
      });
    }
  }
  
  return fieldErrors;
};

export default {
  parseError,
  handleError,
  getFieldErrors,
  ErrorType
}; 
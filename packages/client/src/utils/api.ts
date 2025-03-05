import axios from 'axios';
import { store } from '../store';
import { toast } from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

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
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        console.error('Unauthorized access attempt - you may need to log in again');
        // You could add redirect to login logic here
      } else if (error.response.status === 403) {
        toast.error('You do not have permission to perform this action');
      } else if (error.response.status === 404) {
        toast.error('The requested resource was not found');
      } else if (error.response.status >= 500) {
        toast.error('Server error occurred. Please try again later.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an error
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

export default api; 
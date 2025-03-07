import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper function to check if token exists in localStorage
const getTokenFromStorage = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

// Get initial token from localStorage
const storedToken = getTokenFromStorage();

const initialState: AuthState = {
  user: null,
  token: storedToken,
  isAuthenticated: !!storedToken, // Set isAuthenticated based on token existence
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      
      // Store token in localStorage
      try {
        localStorage.setItem('token', token);
        // Also store user ID to help with data separation
        localStorage.setItem('userId', user.id);
      } catch (error) {
        console.error('Failed to save auth data to localStorage:', error);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Clear token from localStorage
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      } catch (error) {
        console.error('Failed to remove auth data from localStorage:', error);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // Add a reducer to check and validate token
    validateToken: (state) => {
      const token = getTokenFromStorage();
      if (!token) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      } else if (!state.token) {
        state.token = token;
        state.isAuthenticated = true;
      }
    }
  },
});

export const { setCredentials, logout, setLoading, setError, validateToken } = authSlice.actions;
export default authSlice.reducer; 
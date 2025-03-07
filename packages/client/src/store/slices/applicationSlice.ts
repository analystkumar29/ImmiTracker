import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

interface StatusHistory {
  id: string;
  statusName: string;
  statusDate: string;
  notes?: string;
  createdAt: string;
}

interface Application {
  id: string;
  type: string;
  subType: string;
  country: string;
  city: string;
  submissionDate: string;
  currentStatus: string;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

interface ApplicationState {
  applications: Application[];
  selectedApplication: Application | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationState = {
  applications: [],
  selectedApplication: null,
  loading: false,
  error: null,
};

export const createApplication = createAsyncThunk(
  'application/create',
  async (applicationData: Omit<Application, 'id' | 'statusHistory' | 'createdAt' | 'updatedAt' | 'currentStatus'>) => {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create application');
    }

    return await response.json();
  }
);

export const fetchApplications = createAsyncThunk(
  'applications/fetchApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/applications');
      
      // Validate that we received an array of applications
      if (Array.isArray(response.data)) {
        console.log('Fetched applications:', response.data.length);
        return response.data;
      } else {
        console.error('Invalid response format:', response.data);
        return rejectWithValue('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      // Handle authentication errors
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication error. Please log in again.');
      }
      return rejectWithValue(error.message || 'Failed to fetch applications');
    }
  }
);

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setApplications: (state, action: PayloadAction<Application[]>) => {
      state.applications = action.payload;
    },
    addApplication: (state, action: PayloadAction<Application>) => {
      state.applications.push(action.payload);
    },
    updateApplication: (state, action: PayloadAction<Application>) => {
      const index = state.applications.findIndex(
        (app) => app.id === action.payload.id
      );
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
    },
    setSelectedApplication: (state, action: PayloadAction<Application | null>) => {
      state.selectedApplication = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.applications.push(action.payload);
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create application';
      })
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch applications';
      })
      .addCase('auth/logout', (state) => {
        return initialState;
      });
  },
});

export const {
  setApplications,
  addApplication,
  updateApplication,
  setSelectedApplication,
  setLoading,
  setError,
} = applicationSlice.actions;

export default applicationSlice.reducer; 
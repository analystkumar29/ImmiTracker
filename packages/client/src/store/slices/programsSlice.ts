import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Define the Program interface
export interface Program {
  id: string;
  programName: string;
  programSubType?: string;
  category?: string;
  description?: string;
  visaOffices?: string;
  milestoneUpdates: string[];
  processingTimeMonths?: number;
}

// Define the state structure
interface ProgramsState {
  programs: Program[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ProgramsState = {
  programs: [],
  loading: false,
  error: null,
};

// Create async thunk for fetching programs
export const fetchPrograms = createAsyncThunk(
  'programs/fetchPrograms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/programs');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch programs');
    }
  }
);

// Create the slice
const programsSlice = createSlice({
  name: 'programs',
  initialState,
  reducers: {
    setPrograms: (state, action: PayloadAction<Program[]>) => {
      state.programs = action.payload;
    },
    addProgram: (state, action: PayloadAction<Program>) => {
      state.programs.push(action.payload);
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
      .addCase(fetchPrograms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.loading = false;
        state.programs = action.payload;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch programs';
      });
  },
});

// Export actions and reducer
export const { setPrograms, addProgram, setLoading, setError } = programsSlice.actions;
export default programsSlice.reducer; 
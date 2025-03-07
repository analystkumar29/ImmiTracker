import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  flagMilestoneTemplate, 
  unflagMilestoneTemplate,
  flagApplicationType,
  unflagApplicationType
} from '../../utils/api';

interface FlaggedItem {
  id: string;
  type: 'milestone' | 'applicationType';
}

interface FlaggingState {
  flaggedItems: FlaggedItem[];
  loading: boolean;
  error: string | null;
}

const initialState: FlaggingState = {
  flaggedItems: [],
  loading: false,
  error: null,
};

// Async thunks for flagging actions
export const flagMilestone = createAsyncThunk(
  'flagging/flagMilestone',
  async (milestoneId: string, { rejectWithValue }) => {
    try {
      const response = await flagMilestoneTemplate(milestoneId);
      return { id: milestoneId, type: 'milestone' as const, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to flag milestone');
    }
  }
);

export const unflagMilestone = createAsyncThunk(
  'flagging/unflagMilestone',
  async (milestoneId: string, { rejectWithValue }) => {
    try {
      const response = await unflagMilestoneTemplate(milestoneId);
      return { id: milestoneId, type: 'milestone' as const, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unflag milestone');
    }
  }
);

export const flagAppType = createAsyncThunk(
  'flagging/flagAppType',
  async (typeId: string, { rejectWithValue }) => {
    try {
      const response = await flagApplicationType(typeId);
      return { id: typeId, type: 'applicationType' as const, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to flag application type');
    }
  }
);

export const unflagAppType = createAsyncThunk(
  'flagging/unflagAppType',
  async (typeId: string, { rejectWithValue }) => {
    try {
      const response = await unflagApplicationType(typeId);
      return { id: typeId, type: 'applicationType' as const, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unflag application type');
    }
  }
);

const flaggingSlice = createSlice({
  name: 'flagging',
  initialState,
  reducers: {
    clearFlaggingErrors: (state) => {
      state.error = null;
    },
    resetFlagging: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Flag milestone
      .addCase(flagMilestone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(flagMilestone.fulfilled, (state, action) => {
        state.loading = false;
        state.flaggedItems.push({
          id: action.payload.id,
          type: 'milestone',
        });
      })
      .addCase(flagMilestone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to flag milestone';
      })
      
      // Unflag milestone
      .addCase(unflagMilestone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unflagMilestone.fulfilled, (state, action) => {
        state.loading = false;
        state.flaggedItems = state.flaggedItems.filter(
          item => !(item.id === action.payload.id && item.type === 'milestone')
        );
      })
      .addCase(unflagMilestone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to unflag milestone';
      })
      
      // Flag application type
      .addCase(flagAppType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(flagAppType.fulfilled, (state, action) => {
        state.loading = false;
        state.flaggedItems.push({
          id: action.payload.id,
          type: 'applicationType',
        });
      })
      .addCase(flagAppType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to flag application type';
      })
      
      // Unflag application type
      .addCase(unflagAppType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unflagAppType.fulfilled, (state, action) => {
        state.loading = false;
        state.flaggedItems = state.flaggedItems.filter(
          item => !(item.id === action.payload.id && item.type === 'applicationType')
        );
      })
      .addCase(unflagAppType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to unflag application type';
      });
  },
});

export const { clearFlaggingErrors, resetFlagging } = flaggingSlice.actions;

export default flaggingSlice.reducer; 
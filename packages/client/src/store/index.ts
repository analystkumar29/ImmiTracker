import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import applicationReducer from './slices/applicationSlice';
import notificationReducer from './slices/notificationSlice';
import flaggingReducer from './slices/flaggingSlice';
import programsReducer from './slices/programsSlice';

// Configuration for persist
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'isAuthenticated']
};

const applicationPersistConfig = {
  key: 'applications',
  storage,
  whitelist: ['applications', 'selectedApplication']
};

const programsPersistConfig = {
  key: 'programs',
  storage,
  whitelist: ['programs']
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedApplicationReducer = persistReducer(applicationPersistConfig, applicationReducer);
const persistedProgramsReducer = persistReducer(programsPersistConfig, programsReducer);

// Create a more comprehensive root reducer that resets state on logout
const appReducer = combineReducers({
  auth: persistedAuthReducer,
  applications: persistedApplicationReducer,
  notification: notificationReducer,
  flagging: flaggingReducer,
  programs: persistedProgramsReducer,
});

// This is our root reducer that will clear all non-auth state when a user logs out
const rootReducer = (state: any, action: any) => {
  // When logout action is dispatched, reset state (except auth which will be handled by its own reducer)
  if (action.type === 'auth/logout') {
    // Keep only auth state, clear everything else
    state = {
      auth: state.auth
    };
    
    // Clear only application-related localStorage items
    // This is more targeted than clearing everything
    localStorage.removeItem('persist:applications');
    localStorage.removeItem('persist:programs');
    localStorage.removeItem('persist:flagging');
    localStorage.removeItem('persist:notification');
  }
  
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types and specific paths for redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, 'auth/setCredentials'],
        ignoredPaths: ['register.timestamp'],
      },
    }),
});

export const persistor = persistStore(store);

// Helper to purge stored state - can be used for debugging or when needed programmatically
export const purgeStoredState = () => {
  persistor.purge();
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
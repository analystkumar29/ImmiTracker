import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import authReducer, {
  setCredentials,
  logout,
  setLoading,
  setError,
  validateToken
} from '../authSlice';

describe('Auth Slice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should return the initial state', () => {
    expect(authReducer(undefined, { type: undefined })).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  test('should handle setCredentials', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      role: 'USER',
    };
    const token = 'fake-token';

    const nextState = authReducer(initialState, setCredentials({ user, token }));

    expect(nextState).toEqual({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  });

  test('should handle logout', () => {
    const loggedInState = {
      user: {
        id: '123',
        email: 'test@example.com',
        role: 'USER',
      },
      token: 'fake-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };

    const nextState = authReducer(loggedInState, logout());

    expect(nextState).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  test('should handle setLoading', () => {
    const nextState = authReducer(initialState, setLoading(true));

    expect(nextState).toEqual({
      ...initialState,
      isLoading: true,
    });
  });

  test('should handle setError', () => {
    const error = 'Authentication failed';
    const nextState = authReducer(initialState, setError(error));

    expect(nextState).toEqual({
      ...initialState,
      error,
    });
  });

  test('should handle validateToken with no token', () => {
    // Mock localStorage.getItem to return null
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn().mockReturnValue(null);

    const nextState = authReducer(initialState, validateToken());

    // Restore original localStorage.getItem
    Storage.prototype.getItem = originalGetItem;

    expect(nextState).toEqual({
      ...initialState,
      user: null,
      token: null,
      isAuthenticated: false,
    });
  });

  test('should handle validateToken with existing token', () => {
    const stateWithToken = {
      ...initialState,
      token: null, // Token is null in state but might be in localStorage
      isAuthenticated: false,
    };

    // Mock localStorage.getItem to return a token
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn().mockReturnValue('fake-token');

    const nextState = authReducer(stateWithToken, validateToken());

    // Restore original localStorage.getItem
    Storage.prototype.getItem = originalGetItem;

    expect(nextState).toEqual({
      ...stateWithToken,
      token: 'fake-token',
      isAuthenticated: true,
    });
  });
}); 
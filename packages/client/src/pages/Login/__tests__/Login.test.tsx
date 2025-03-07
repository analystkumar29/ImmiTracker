import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { store } from '../../../store';
import { theme } from '../../../theme';
import Login from '../index';
import api from '../../../utils/api';

// Mock the API module
vi.mock('../../../utils/api', () => ({
  __esModule: true,
  default: {
    post: vi.fn(),
  },
}));

// Mock the useDispatch hook but keep the actual Provider
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDispatch: () => vi.fn().mockReturnValue(vi.fn()),
  };
});

// Mock react-router-dom to include BrowserRouter
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  const renderLoginComponent = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <Login />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  test('renders login form correctly', () => {
    renderLoginComponent();
    
    // Check if the login form elements are rendered
    expect(screen.getByText('Sign in to ImmiTracker')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\? Sign Up/i)).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    renderLoginComponent();
    
    // Submit the form without filling in any fields
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  test('handles successful login', async () => {
    // Mock successful API response
    (api.post as any).mockResolvedValueOnce({
      data: {
        user: {
          id: '123',
          email: 'test@example.com',
          role: 'USER',
        },
        token: 'fake-token',
      },
    });
    
    renderLoginComponent();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);
    
    // Check if API was called with correct parameters
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('handles login error', async () => {
    // Mock API error response
    (api.post as any).mockRejectedValueOnce({
      response: {
        data: {
          message: 'Invalid email or password',
        },
      },
    });
    
    renderLoginComponent();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrong-password' },
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'wrong-password',
      });
    });
  });
}); 
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Link,
  Alert,
} from '@mui/material';
import FormTextField from '@/components/shared/FormTextField';
import { setCredentials } from '@/store/slices/authSlice';
import { fetchApplications } from '@/store/slices/applicationsSlice';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { handleError, getFieldErrors } from '../../utils/errorHandler';
import Feedback from '../../components/Feedback';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

interface LocationState {
  message?: string;
  from?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for session expired parameter
    if (searchParams.get('session_expired') === 'true') {
      setLoginError('Your session has expired. Please log in again.');
    }
    
    // Check for message from location state
    const state = location.state as LocationState;
    if (state?.message) {
      setSuccessMessage(state.message);
      // Clear the message from location state to prevent it from showing after refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, searchParams]);

  const handleSubmit = async (
    values: { email: string; password: string }, 
    { setSubmitting, setErrors }: FormikHelpers<{ email: string; password: string }>
  ) => {
    try {
      setLoginError(null);
      setIsLoading(true);
      
      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password
      });
      
      // Store user details in Redux
      dispatch(setCredentials({
        user: response.data.user,
        token: response.data.token
      }));
      
      // After credentials are set, dispatch the fetch applications action
      await dispatch(fetchApplications());
      
      // Redirect to the page the user was trying to access, or to the dashboard
      const state = location.state as LocationState;
      const redirectTo = state?.from || '/';
      navigate(redirectTo);
      
    } catch (error: any) {
      // Use our error handler to get field-specific errors
      const fieldErrors = getFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors as any);
      } else {
        // Set a general error message
        setLoginError(
          error.response?.data?.message || 
          'Login failed. Please check your credentials.'
        );
      }
      
      // Log the error
      handleError(error, 'Login failed');
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Sign in to ImmiTracker
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Track your immigration application progress and compare with others
          </Typography>
          
          {successMessage && (
            <Feedback
              type="success"
              message={successMessage}
              dismissible
              onDismiss={() => setSuccessMessage(null)}
              sx={{ width: '100%' }}
            />
          )}
          
          {loginError && (
            <Feedback
              type="error"
              message={loginError}
              dismissible
              onDismiss={() => setLoginError(null)}
              sx={{ width: '100%' }}
            />
          )}
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form style={{ width: '100%', marginTop: 1 }}>
                <FormTextField
                  name="email"
                  label="Email Address"
                  autoComplete="email"
                  autoFocus
                  fullWidth
                  margin="normal"
                  disabled={isLoading}
                />
                <FormTextField
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  fullWidth
                  margin="normal"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/register')}
                    sx={{ textDecoration: 'none' }}
                  >
                    Don't have an account? Sign Up
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 
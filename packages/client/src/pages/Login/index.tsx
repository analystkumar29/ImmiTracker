import { useNavigate } from 'react-router-dom';
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
import { useState } from 'react';
import api from '../../utils/api';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (values: { email: string; password: string }, { setSubmitting, setErrors }: FormikHelpers<{ email: string; password: string }>) => {
    try {
      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password
      });
      
      // Store user details in Redux
      dispatch(setCredentials({
        user: response.data.user,
        token: response.data.token
      }));
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      navigate('/');
    } catch (error: any) {
      setLoginError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
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
          <Typography component="h1" variant="h5">
            Sign in to ImmiTracker
          </Typography>
          
          {loginError && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {loginError}
            </Alert>
          )}
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              handleSubmit(values, { setSubmitting }).finally(() => setSubmitting(false));
            }}
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
                />
                <FormTextField
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  fullWidth
                  margin="normal"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/register')}
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
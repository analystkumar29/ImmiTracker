import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Link,
} from '@mui/material';
import FormTextField from '@/components/shared/FormTextField';
import { setCredentials } from '@/store/slices/authSlice';
import api from '../../utils/api';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (values: any, { setSubmitting, setErrors }: any) => {
    try {
      setRegisterError(null);
      
      const response = await api.post('/auth/register', {
        name: values.name,
        email: values.email,
        password: values.password
      });
      
      // Successfully registered
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (error: any) {
      setRegisterError(error.response?.data?.message || 'Registration failed. Please try again.');
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
            Create your ImmiTracker account
          </Typography>
          <Formik
            initialValues={{
              email: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <Form style={{ width: '100%', marginTop: 1 }}>
              <FormTextField
                name="email"
                label="Email Address"
                autoComplete="email"
                autoFocus
              />
              <FormTextField
                name="password"
                label="Password"
                type="password"
                autoComplete="new-password"
              />
              <FormTextField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                >
                  Already have an account? Sign In
                </Link>
              </Box>
            </Form>
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 
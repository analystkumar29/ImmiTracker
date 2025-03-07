import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import { RootState } from './store';
import { validateToken } from './store/slices/authSlice';
import { fetchApplications } from './store/slices/applicationsSlice';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import ApplicationForm from './pages/Applications/ApplicationForm';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/Dashboard';
import FlaggedItemsPage from './pages/admin/FlaggedItems';
import MilestoneManagement from './pages/admin/MilestoneManagement';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import { Loading } from './components/Feedback';
import NetworkStatusMonitor from './components/NetworkStatusMonitor';

// Wrap each route with ErrorBoundary
const RouteWithErrorBoundary = ({ element }: { element: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<Loading message="Loading..." />}>
      {element}
    </Suspense>
  </ErrorBoundary>
);

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  
  // Show loading indicator while checking authentication
  if (isLoading) {
    return <Loading message="Checking authentication..." />;
  }
  
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" state={{ from: location.pathname }} />
  );
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN';
  
  // Show loading indicator while checking authentication
  if (isLoading) {
    return <Loading message="Checking authentication..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Validate token on app initialization
  useEffect(() => {
    dispatch(validateToken());
  }, [dispatch]);
  
  // Fetch applications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchApplications());
    }
  }, [dispatch, isAuthenticated]);
  
  return (
    <ErrorBoundary>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/login" element={<RouteWithErrorBoundary element={<Login />} />} />
          <Route path="/register" element={<RouteWithErrorBoundary element={<Register />} />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <RouteWithErrorBoundary element={<AdminDashboard />} />
            </AdminRoute>
          } />
          <Route path="/admin/flagged-items" element={
            <AdminRoute>
              <RouteWithErrorBoundary element={<FlaggedItemsPage />} />
            </AdminRoute>
          } />
          <Route path="/admin/milestones" element={
            <AdminRoute>
              <RouteWithErrorBoundary element={<MilestoneManagement />} />
            </AdminRoute>
          } />
          
          {/* User Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<RouteWithErrorBoundary element={<Dashboard />} />} />
            <Route path="applications" element={<RouteWithErrorBoundary element={<Applications />} />} />
            <Route path="applications/new" element={<RouteWithErrorBoundary element={<ApplicationForm />} />} />
            <Route path="applications/:id" element={<RouteWithErrorBoundary element={<ApplicationDetail />} />} />
            <Route path="profile" element={<RouteWithErrorBoundary element={<Profile />} />} />
            <Route path="*" element={<RouteWithErrorBoundary element={<NotFound />} />} />
          </Route>
        </Routes>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              border: '1px solid #007FFF',
              padding: '16px',
              color: '#333',
            },
            success: {
              style: {
                border: '1px solid #4CAF50',
              },
            },
            error: {
              style: {
                border: '1px solid #F44336',
              },
              duration: 5000,
            },
          }}
        />
        
        {/* Network status monitor */}
        <NetworkStatusMonitor />
      </Box>
    </ErrorBoundary>
  );
};

export default App; 
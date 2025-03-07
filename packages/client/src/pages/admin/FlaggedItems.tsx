import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import AdminFlaggedItemsManager from '../../components/AdminFlaggedItemsManager';
import AdminLayout from '../../components/Layout/AdminLayout';

const FlaggedItemsPage: React.FC = () => {
  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Flagged Items Management
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Review and process items that have been flagged by users as irrelevant or incorrect.
          </Typography>
          
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <AdminFlaggedItemsManager />
          </Paper>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default FlaggedItemsPage; 
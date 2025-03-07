import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimelineIcon from '@mui/icons-material/Timeline';
import CategoryIcon from '@mui/icons-material/Category';
import AdminLayout from '../../components/Layout/AdminLayout';

const AdminDashboard: React.FC = () => {
  // In a real implementation, these would be fetched from the server
  const stats = {
    users: 142,
    applications: 327,
    milestones: 1563,
    flaggedItems: 14
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Overview of ImmiTracker system metrics and management tools.
          </Typography>
          
          <Grid container spacing={3} mt={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PersonIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4">{stats.users}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Registered Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <DescriptionIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4">{stats.applications}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Applications
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4">{stats.milestones}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Milestones
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <FlagIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                  <Typography variant="h4">{stats.flaggedItems}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Flagged Items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Grid container spacing={3} mt={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Admin Tools
                </Typography>
                <List>
                  <ListItem 
                    button 
                    component={RouterLink} 
                    to="/admin/flagged-items"
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemIcon>
                      <FlagIcon color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Flagged Items" 
                      secondary="Review and manage user-flagged content" 
                    />
                  </ListItem>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <ListItem 
                    button 
                    component={RouterLink} 
                    to="/admin/milestones"
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemIcon>
                      <TimelineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Milestone Management" 
                      secondary="Normalize and categorize milestones" 
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Recent Activity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This section will display recent admin actions and system activities.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </AdminLayout>
  );
};

export default AdminDashboard; 
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Fab,
  Chip,
  List,
  ListItem,
  ListItemText,
  FormHelperText,
  Autocomplete,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addMonths } from 'date-fns';
import { RootState, AppDispatch } from '../../store';
import { setApplications, setSelectedApplication } from '../../store/slices/applicationSlice';
import MilestoneProgressBar from '../../components/MilestoneProgressBar';
import MobileNavigation from '../../components/MobileNavigation';
import { ImmigrationProgram } from '@/types/program';
import { findProgramForApplication } from '../../utils/programUtils';
import { 
  getDefaultMilestones, 
  getMilestonesForApplication
} from '../../utils/milestoneUtils';
import CustomMilestoneDialog from '../../components/CustomMilestoneDialog';
import { toast } from 'react-hot-toast';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import api from '../../utils/api';

const Applications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { applications } = useSelector((state: RootState) => state.application);
  const [programs, setPrograms] = useState<ImmigrationProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedMilestone, setSelectedMilestone] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [availableMilestones, setAvailableMilestones] = useState<string[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState<boolean>(false);
  const [isCustomMilestoneDialogOpen, setIsCustomMilestoneDialogOpen] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/applications');
      dispatch(setApplications(response.data));
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs');
      setPrograms(response.data);
    } catch (error: any) {
      console.error('Failed to fetch programs:', error);
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    fetchApplications();
    fetchPrograms();
  };

  useEffect(() => {
    fetchApplications();
    fetchPrograms();
  }, [dispatch]);

  const clearAllApplications = async () => {
    if (!window.confirm('Are you sure you want to delete all your applications? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete('/applications/clear-all');
      dispatch(setApplications([]));
      alert(`Successfully deleted ${response.data.count} applications`);
    } catch (error: any) {
      console.error('Failed to clear applications:', error);
      setError(error.message || 'Failed to clear applications');
    } finally {
      setLoading(false);
    }
  };

  // Update the loading state UI to be more informative
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Applications
          </Typography>
          {refreshing && (
            <Button
              variant="contained"
              disabled
              startIcon={<CircularProgress size={20} color="inherit" />}
            >
              Refreshing...
            </Button>
          )}
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6">
            Loading your applications...
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Please wait while we fetch your data
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Applications
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={clearAllApplications}
            >
              Clear All Applications
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/applications/new')}
            >
              New Application
            </Button>
          </Box>
        </Box>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchApplications}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const handleViewDetails = (applicationId: string) => {
    navigate(`/applications/${applicationId}`);
  };

  const handleUpdateDialogOpen = (application: any) => {
    setSelectedApplication(application);
    setUpdateDialogOpen(true);
    setSelectedMilestone('');
    setSelectedDate(null);
    setUpdateNotes('');
    setMilestonesLoading(true);
    
    console.log("Opening update dialog for application:", application.id);
    console.log("Application type:", application.type, "subtype:", application.subType);
    
    // Find the program based on the application type and subtype
    const program = findProgramForApplication(programs, application.type, application.subType);
    console.log("Found program:", program?.programName || "None");
    
    if (program) {
      // Get completed milestone names from status history
      const completedMilestones = new Set<string>(
        application.statusHistory.map((status: any) => status.statusName)
      );
      
      // Get all milestones for this application
      const allMilestones = getMilestonesForApplication(application, program);
      
      // Calculate available milestones by filtering out completed ones
      const availableMilestones = allMilestones.filter(
        (milestone: string) => !completedMilestones.has(milestone)
      );
      
      console.log("Available milestones:", availableMilestones);
      setAvailableMilestones(availableMilestones);
    } else {
      console.warn(`No matching program found for ${application.type}: ${application.subType}`);
      // Fallback to default milestones
      const defaultMilestones = getDefaultMilestones(application.type);
      
      // Filter out completed milestones
      const completedMilestones = new Set<string>(
        application.statusHistory.map((status: any) => status.statusName)
      );
      const available = defaultMilestones.filter(milestone => !completedMilestones.has(milestone));
      
      setAvailableMilestones(available);
    }
    
    setMilestonesLoading(false);
  };

  const handleUpdateDialogClose = () => {
    setUpdateDialogOpen(false);
    setSelectedMilestone('');
    setUpdateNotes('');
  };

  const handleMilestoneSubmit = async () => {
    if (!selectedApplication || !selectedMilestone) {
      setError("Please select a milestone");
      return;
    }

    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await api.post(`/applications/${selectedApplication.id}/status`, {
        statusName: selectedMilestone,
        statusDate: selectedDate.toISOString(),
        notes: updateNotes
      });

      // Refresh applications
      await fetchApplications();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      setError(error.message || 'Failed to update application status');
    } finally {
      setLoading(false);
      handleUpdateDialogClose();
      setSelectedDate(new Date());
    }
  };

  const calculateProgress = (application: any) => {
    const program = programs.find(p => p.programName === application.type);
    if (!program) return 0;
    
    const totalMilestones = program.milestoneUpdates.length;
    const completedMilestones = application.statusHistory.length;
    return Math.round((completedMilestones / totalMilestones) * 100);
  };

  const getEstimatedDecisionDate = (application: any) => {
    const program = programs.find(p => p.programName === application.type);
    if (!program) return 'Processing time varies';

    const processingTime = program.processingTimes.exampleCountries?.[application.country] || 
                          program.processingTimes.inCanada || 
                          'Processing time varies';

    if (processingTime === 'Processing time varies') return processingTime;

    // Convert processing time to days (assuming format like "114 days" or "8 weeks" or "6 months")
    let days = 0;
    const [value, unit] = processingTime.split(' ');
    switch (unit) {
      case 'days':
        days = parseInt(value);
        break;
      case 'weeks':
        days = parseInt(value) * 7;
        break;
      case 'months':
        days = parseInt(value) * 30;
        break;
      default:
        return processingTime;
    }

    const submissionDate = new Date(application.submissionDate);
    const estimatedDate = new Date(submissionDate);
    estimatedDate.setDate(estimatedDate.getDate() + days);
    return estimatedDate.toLocaleDateString();
  };

  const getNextMilestone = (application: any) => {
    const program = programs.find(p => p.programName === application.type);
    if (!program) return null;

    const completedMilestones = new Set(application.statusHistory.map((s: any) => s.statusName));
    return program.milestoneUpdates.find(milestone => !completedMilestones.has(milestone));
  };

  const getNextMilestones = (application: any) => {
    const program = programs.find(p => p.programName === application.type);
    if (!program) return [];

    const completedMilestones = new Set(application.statusHistory.map((s: any) => s.statusName));
    return program.milestoneUpdates.filter(milestone => !completedMilestones.has(milestone));
  };

  // Create milestones array for MilestoneProgressBar
  const createMilestones = (application: any): any[] => {
    if (!application || !application.statusHistory) return [];
    
    // Get the program's milestone updates
    const program = programs.find(p => p.id === application.type);
    if (!program) return [];
    
    // Create milestone objects
    return program.milestoneUpdates.map((milestoneName: string) => {
      const statusUpdate = application.statusHistory.find(
        (status: any) => status.statusName === milestoneName
      );
      
      return {
        name: milestoneName,
        completed: !!statusUpdate,
        date: statusUpdate ? statusUpdate.statusDate : undefined,
        notes: statusUpdate ? statusUpdate.notes : undefined
      };
    });
  };

  const handleAddCustomMilestone = (milestoneName: string) => {
    if (!selectedApplication) return;
    
    // Add the custom milestone to the available milestones
    setAvailableMilestones(prev => [...prev, milestoneName]);
    
    // Select the new milestone automatically
    setSelectedMilestone(milestoneName);
    
    // Show success toast
    toast.success(`Added custom milestone: ${milestoneName}`);
  };

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        {isMobile ? (
          <MobileNavigation 
            title="My Applications"
          />
        ) : (
          <Typography variant="h4" component="h1">
            My Applications
          </Typography>
        )}
        
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {applications.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                onClick={clearAllApplications}
              >
                Clear All Applications
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/applications/new')}
            >
              New Application
            </Button>
          </Box>
        )}
      </Box>

      {applications.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h6">
            You don't have any applications yet
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            Create your first application to start tracking your immigration process
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/applications/new')}
          >
            Create Application
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mx: isMobile ? -1 : 0 }}>
          {applications.map((application: any) => (
            <Grid item xs={12} sm={6} md={4} key={application.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  p: isMobile ? 1 : 2,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: isMobile ? 1 : 2 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {application.type} - {application.subType}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Country: {application.country}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      City: {application.city}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Submitted: {new Date(application.submissionDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Current Status: <Chip size="small" label={application.currentStatus} color="primary" />
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Progress: {calculateProgress(application)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateProgress(application)} 
                      sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => handleUpdateDialogOpen(application)}
                    >
                      Update Status
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained" 
                      onClick={() => handleViewDetails(application.id)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add floating action button for mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => navigate('/applications/new')}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onClose={handleUpdateDialogClose}>
        <DialogTitle>
          Update Application Status
          {selectedApplication && (
            <Typography variant="subtitle2" color="textSecondary">
              {selectedApplication.type}: {selectedApplication.subType}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <Autocomplete
                options={availableMilestones}
                value={selectedMilestone}
                onChange={(_, value) => setSelectedMilestone(value || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Milestone"
                    error={!!error && !selectedMilestone}
                    helperText={!selectedMilestone && error ? error : 'Select an upcoming milestone'}
                  />
                )}
                loading={milestonesLoading}
                loadingText="Loading milestones..."
                noOptionsText={
                  <Box>
                    <Typography>No milestones available</Typography>
                    <Button 
                      variant="text" 
                      size="small"
                      onClick={() => {
                        setUpdateDialogOpen(false);
                        setIsCustomMilestoneDialogOpen(true);
                      }}
                      startIcon={<AddIcon />}
                    >
                      Add Custom Milestone
                    </Button>
                  </Box>
                }
              />
            </FormControl>

            {/* Add button for custom milestone */}
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setUpdateDialogOpen(false);
                  setIsCustomMilestoneDialogOpen(true);
                }}
              >
                Add Custom Milestone
              </Button>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Status Date"
                value={selectedDate}
                maxDate={new Date()} // Prevent future dates
                onChange={(date) => setSelectedDate(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    error: !!error && !selectedDate,
                    helperText: !selectedDate && error ? error : '',
                  }
                }}
              />
            </LocalizationProvider>

            <TextField
              label="Notes (Optional)"
              multiline
              rows={3}
              fullWidth
              margin="normal"
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
            />
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateDialogClose}>Cancel</Button>
          <Button 
            onClick={handleMilestoneSubmit} 
            variant="contained"
            disabled={!selectedMilestone || !selectedDate || loading}
          >
            {loading ? 'Saving...' : 'Save Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Milestone Dialog */}
      <CustomMilestoneDialog
        open={isCustomMilestoneDialogOpen}
        onClose={() => {
          setIsCustomMilestoneDialogOpen(false);
          if (selectedApplication) setUpdateDialogOpen(true);
        }}
        onAddMilestone={handleAddCustomMilestone}
        applicationType={selectedApplication?.type || ''}
        applicationSubtype={selectedApplication?.subType}
      />
    </Box>
  );
};

export default Applications; 
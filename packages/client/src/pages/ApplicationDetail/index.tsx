import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  IconButton,
  Breadcrumbs,
  Link,
  Tooltip,
  SwipeableDrawer,
  Alert,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  ArrowBack as ArrowBackIcon,
  Update as UpdateIcon,
  Home as HomeIcon,
  NavigateBefore as NavigateBeforeIcon,
  Menu as MenuIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { fetchPrograms } from '../../store/slices/programsSlice';
import { setSelectedApplication } from '../../store/slices/applicationsSlice';
import { ImmigrationProgram } from '../../types/program';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, addMonths, parseISO } from 'date-fns';
import axios from 'axios';
import { getResponsiveTimelineStyles, getResponsiveConnectorStyles } from '../../utils/responsiveUtils';
import MilestoneProgressBar from '../../components/MilestoneProgressBar';
import MobileNavigation from '@/components/MobileNavigation';
import { findProgramForApplication } from '../../utils/programUtils';
import { 
  getDefaultMilestones, 
  createMilestoneObjects, 
  calculateExpectedDates as calculateMilestoneDates, 
  getMilestonesForApplication 
} from '../../utils/milestoneUtils';
import api from '../../utils/api';
import UpdateStatusDialog from '../../components/UpdateStatusDialog';
import CustomMilestoneDialog from '../../components/CustomMilestoneDialog';
import { toast } from 'react-hot-toast';

interface StatusUpdate {
  id: string;
  statusName: string;
  statusDate: string;
  notes?: string;
}

interface Application {
  id: string;
  type: string;
  subType: string;
  country: string;
  city: string;
  submissionDate: string;
  currentStatus: string;
  statusHistory: StatusUpdate[];
  createdAt: string;
  updatedAt: string;
}

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  
  console.log('ApplicationDetail component rendering with ID:', id);
  
  // Get the selected application from Redux
  const selectedApplication = useSelector((state: RootState) => state.applications.selectedApplication);
  console.log('Selected application from Redux:', selectedApplication);
  
  // Get programs from Redux store
  const programs = useSelector((state: RootState) => state.programs.programs);
  const programsLoading = useSelector((state: RootState) => state.programs.loading);
  const programsError = useSelector((state: RootState) => state.programs.error);
  
  const [application, setApplication] = useState<Application | null>(null);
  const [program, setProgram] = useState<ImmigrationProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState('');
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateNotes, setUpdateNotes] = useState('');
  const [milestones, setMilestones] = useState<string[] | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [availableMilestones, setAvailableMilestones] = useState<string[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState<boolean>(false);
  const [isCustomMilestoneDialogOpen, setIsCustomMilestoneDialogOpen] = useState(false);

  // Check if ID is valid
  useEffect(() => {
    console.log('ApplicationDetail useEffect for ID check running with ID:', id);
    if (!id) {
      console.error('No application ID provided in URL parameters');
      toast.error('Application ID is missing');
      navigate('/applications');
      return;
    }
    console.log('ApplicationDetail component mounted with ID:', id);
    
    // Log the current URL for debugging
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
  }, [id, navigate]);

  // Add a function to fetch application data
  const fetchApplication = async () => {
    try {
      console.log('Fetching application data for ID:', id);
      const appRes = await api.get(`/applications/${id}`);
      const applicationData = appRes.data;
      
      if (!applicationData) {
        throw new Error('Application data not found');
      }
      
      console.log('Fetched application data:', applicationData);
      setApplication(applicationData);
      
      // Also update the Redux store
      dispatch(setSelectedApplication(applicationData));
      
      return applicationData;
    } catch (error: any) {
      console.error('Error fetching application:', error);
      setError(error.message || 'Failed to fetch application data');
      toast.error('Failed to load application details');
      return null;
    }
  };

  useEffect(() => {
    const fetchApplicationAndProgram = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching application details for ID:', id);
        console.log('Selected application from Redux:', selectedApplication);
        
        let applicationData;
        
        // Try to use the selected application from Redux if available and matches the ID
        if (selectedApplication && selectedApplication.id === id) {
          console.log('Using selected application from Redux');
          applicationData = selectedApplication;
          setApplication(applicationData);
        } else {
          // Otherwise fetch from API
          console.log('Selected application not found in Redux or ID mismatch, fetching from API');
          applicationData = await fetchApplication();
          
          if (!applicationData) {
            throw new Error('Application data not found');
          }
          
          // Store the fetched application in Redux for consistency
          dispatch(setSelectedApplication(applicationData));
        }
        
        // Always make sure programs are loaded
        if (programs.length === 0 && !programsLoading) {
          // Dispatch program fetching
          dispatch(fetchPrograms());
        }
        
        // Find the matching program
        if (applicationData && programs.length > 0) {
          console.log('Finding program for application type:', applicationData.type);
          const matchingProgram = findProgramForApplication(
            programs,
            applicationData.type,
            applicationData.subType
          );
          
          if (matchingProgram) {
            console.log('Found matching program:', matchingProgram);
            setProgram(matchingProgram);
          } else {
            console.warn(`No matching program found for ${applicationData.type}: ${applicationData.subType}. Using fallback.`);
          }
        }
      } catch (error: any) {
        console.error('Error fetching application details:', error);
        setError(error.message || 'Failed to load application details');
        toast.error('Error loading application details: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplicationAndProgram();
    } else {
      setError('No application ID provided');
      setLoading(false);
    }
  }, [id, programs, programsLoading, selectedApplication, dispatch]);

  const handleUpdateMilestone = () => {
    setUpdateDialogOpen(true);
    setMilestonesLoading(true);
    setSelectedMilestone('');
    setSelectedDate(new Date());
    setUpdateNotes('');
    setError(null);
    
    // Get available milestones
    if (application && program) {
      const availableMilestones = getAvailableMilestones();
      setAvailableMilestones(availableMilestones);
      console.log("Available milestones for update:", availableMilestones);
    }
    setMilestonesLoading(false);
  };

  const getAvailableMilestones = () => {
    if (!application || !program) {
      return [];
    }

    // Get completed milestone names from status history
    const completedMilestones = new Set<string>(
      application.statusHistory.map((status: StatusUpdate) => status.statusName)
    );

    // Get all milestones for this application (either from program or defaults)
    const allMilestones = getMilestonesForApplication(application, program);
    
    // Filter out completed milestones
    return allMilestones.filter((milestone: string) => !completedMilestones.has(milestone));
  };

  const handleSubmitMilestone = async () => {
    if (!selectedMilestone || !selectedDate) return;
    
    try {
      await api.post(`/applications/${id}/status`, {
        statusName: selectedMilestone,
        statusDate: selectedDate.toISOString(),
        notes: notes,
      });
      
      // Refresh application data
      const appRes = await api.get(`/applications/${id}`);
      setApplication(appRes.data);
      
      // Close dialog and reset form
      setUpdateDialogOpen(false);
      setSelectedMilestone(null);
      setSelectedDate(new Date());
      setNotes('');
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const calculateProgress = () => {
    if (!application || !program) return 0;
    const completedMilestones = application.statusHistory.length;
    const totalMilestones = program.milestoneUpdates.length;
    return (completedMilestones / totalMilestones) * 100;
  };

  const getExpectedProcessingTime = () => {
    if (!program || !application) return 'Processing time varies';
    
    const countryTime = program.processingTimes.exampleCountries?.[application.country];
    if (countryTime) {
      return countryTime;
    }
    
    return program.processingTimes.inCanada || 'Processing time varies';
  };

  const calculateExpectedDates = (application: any, program: any) => {
    if (!application || !program) return {};
    
    const totalMilestones = program.milestoneUpdates.length;
    if (totalMilestones === 0) return {};
    
    // Use submission date as the starting point
    const submissionDate = new Date(application.submissionDate);
    
    // Parse processing time
    let processingTimeMonths = 6; // Default value
    if (program.processingTimes) {
      // Try to get country-specific time if available
      const countryTime = program.processingTimes.exampleCountries?.[application.country];
      if (countryTime) {
        // Parse "X months" or "X weeks" format
        const timeMatch = countryTime.match(/(\d+)\s+(month|week|day)/i);
        if (timeMatch) {
          const value = parseInt(timeMatch[1], 10);
          const unit = timeMatch[2].toLowerCase();
          
          if (unit === 'month' || unit === 'months') {
            processingTimeMonths = value;
          } else if (unit === 'week' || unit === 'weeks') {
            processingTimeMonths = value / 4; // Approximate
          } else if (unit === 'day' || unit === 'days') {
            processingTimeMonths = value / 30; // Approximate
          }
        }
      } else if (program.processingTimes.inCanada) {
        // Same parsing for inCanada time
        const timeMatch = program.processingTimes.inCanada.match(/(\d+)\s+(month|week|day)/i);
        if (timeMatch) {
          const value = parseInt(timeMatch[1], 10);
          const unit = timeMatch[2].toLowerCase();
          
          if (unit === 'month' || unit === 'months') {
            processingTimeMonths = value;
          } else if (unit === 'week' || unit === 'weeks') {
            processingTimeMonths = value / 4; // Approximate
          } else if (unit === 'day' || unit === 'days') {
            processingTimeMonths = value / 30; // Approximate
          }
        }
      }
    }
    
    // Calculate average time between milestones in days
    const totalProcessingDays = processingTimeMonths * 30; // approximate
    const averageDaysPerMilestone = totalProcessingDays / totalMilestones;
    
    // Get the most recent milestone date if available
    let lastMilestoneDate = submissionDate;
    const statusHistory = application.statusHistory || [];
    if (statusHistory.length > 0) {
      const sortedHistory = [...statusHistory].sort(
        (a, b) => new Date(b.statusDate).getTime() - new Date(a.statusDate).getTime()
      );
      lastMilestoneDate = new Date(sortedHistory[0].statusDate);
    }
    
    // Create a map of milestone names to expected dates
    const expectedDates: Record<string, Date> = {};
    
    // For each upcoming milestone, calculate expected date
    const completedMilestones = new Set(application.statusHistory.map((status: any) => status.statusName));
    
    program.milestoneUpdates.forEach((milestoneName: string, index: number) => {
      if (!completedMilestones.has(milestoneName)) {
        // Calculate days from submission based on milestone position
        const milestonesRemaining = index - statusHistory.length + 1;
        if (milestonesRemaining > 0) {
          const daysToAdd = milestonesRemaining * averageDaysPerMilestone;
          expectedDates[milestoneName] = addDays(lastMilestoneDate, daysToAdd);
        }
      }
    });
    
    return expectedDates;
  };

  // Handle opening the update milestone dialog
  const handleOpenUpdateDialog = () => {
    setUpdateDialogOpen(true);
  };

  // Handle custom milestone dialog
  const handleOpenCustomMilestoneDialog = () => {
    setIsCustomMilestoneDialogOpen(true);
  };

  const handleCloseCustomMilestoneDialog = () => {
    setIsCustomMilestoneDialogOpen(false);
  };

  const handleAddCustomMilestone = async (milestoneName: string) => {
    if (!application) return;

    try {
      setLoading(true);
      
      // Create the custom milestone
      await api.post('/api/milestones/custom', {
        name: milestoneName,
        programType: application.type,
        programSubType: application.subType
      });

      // Add the milestone status update to the application
      await api.post(`/applications/${application.id}/status`, {
        statusName: milestoneName,
        statusDate: new Date().toISOString(),
        notes: 'Custom milestone added'
      });

      // Refresh application data
      fetchApplication();
      
      toast.success('Custom milestone added successfully');
    } catch (error: any) {
      console.error('Failed to add custom milestone:', error);
      setError(error.message || 'Failed to add custom milestone');
    } finally {
      setLoading(false);
    }
  };

  // Better loading UI
  if (loading) {
    return (
      <Box sx={{ p: 3, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Application Details...
        </Typography>
      </Box>
    );
  }
  
  // Better error handling
  if (error) {
    return (
      <Box sx={{ p: 3, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/applications')}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Return to Applications
        </Button>
      </Box>
    );
  }
  
  // Safety check for application data
  if (!application) {
    return (
      <Box sx={{ p: 3, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>
          No application data found. Please go back and try again.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/applications')}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Return to Applications
        </Button>
      </Box>
    );
  }

  // Ensure we have a program object even if one wasn't found
  const displayProgram = program || {
    id: 'fallback',
    programName: application.type,
    category: 'Unknown',
    description: 'Program details unavailable',
    visaOffices: '',
    milestoneUpdates: [],
    processingTimeMonths: 0
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event &&
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {isMobile ? (
        <MobileNavigation 
          title={application?.type || 'Application Details'} 
        />
      ) : (
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link 
            component="button" 
            variant="body1" 
            onClick={() => navigate('/')}
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Link 
            component="button" 
            variant="body1" 
            onClick={() => navigate('/applications')}
            underline="hover"
          >
            Applications
          </Link>
          <Typography color="text.primary">
            {application?.type || 'Details'}
          </Typography>
        </Breadcrumbs>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ mx: isMobile ? -1 : 0 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Country</Typography>
                  <Typography variant="body1">{application.country}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">City</Typography>
                  <Typography variant="body1">{application.city}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Submission Date</Typography>
                  <Typography variant="body1">{new Date(application.submissionDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Current Status</Typography>
                  <Chip label={application.currentStatus} color="primary" size="small" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ mx: isMobile ? -1 : 0 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Processing Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Program Type</Typography>
                  <Typography variant="body1">{displayProgram.programName || application.type}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Expected Processing Time</Typography>
                  <Typography variant="body1">{getExpectedProcessingTime()}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <MilestoneProgressBar 
            progress={calculateProgress()}
            estimatedTimeRemaining={getExpectedProcessingTime()}
            milestones={displayProgram.milestoneUpdates.map(milestone => {
              const statusUpdate = application.statusHistory.find(
                status => status.statusName === milestone
              );
              
              const expectedDates = calculateExpectedDates(application, displayProgram);
              
              return {
                name: milestone,
                completed: !!statusUpdate,
                date: statusUpdate?.statusDate,
                notes: statusUpdate?.notes,
                expectedDate: !statusUpdate && expectedDates[milestone] 
                  ? format(expectedDates[milestone], 'yyyy-MM-dd') 
                  : undefined
              };
            }) || []}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Status Timeline</Typography>
          <Box sx={getResponsiveTimelineStyles(theme, isMobile)}>
            {application.statusHistory.map((status, index) => (
              <TimelineItem key={status.id}>
                <TimelineOppositeContent color="text.secondary">
                  {format(new Date(status.statusDate), 'MMM d, yyyy')}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="primary" />
                  {index < application.statusHistory.length - 1 && (
                    <TimelineConnector sx={getResponsiveConnectorStyles(theme, isMobile)} />
                  )}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body1" fontWeight="medium">
                    {status.statusName}
                  </Typography>
                  {status.notes && (
                    <Typography variant="body2" color="text.secondary">
                      {status.notes}
                    </Typography>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
            
            {getAvailableMilestones().map((milestone, index) => (
              <TimelineItem key={`upcoming-${index}`}>
                <TimelineOppositeContent color="text.secondary">
                  Upcoming
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot variant="outlined" />
                  {index < getAvailableMilestones().length - 1 && (
                    <TimelineConnector sx={getResponsiveConnectorStyles(theme, isMobile, theme.palette.grey[300])} />
                  )}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body1" color="text.secondary">
                    {milestone}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Update Status Dialog */}
      <UpdateStatusDialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        application={application}
        onCustomMilestoneClick={handleOpenCustomMilestoneDialog}
        onStatusUpdated={() => {
          // Refresh application
          fetchApplication();
        }}
      />

      {/* Custom Milestone Dialog */}
      {application && (
        <CustomMilestoneDialog
          open={isCustomMilestoneDialogOpen}
          onClose={handleCloseCustomMilestoneDialog}
          onAddMilestone={handleAddCustomMilestone}
          applicationType={application.type}
          applicationSubtype={application.subType}
        />
      )}
    </Box>
  );
};

export default ApplicationDetail; 
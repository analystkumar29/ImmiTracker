import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  Alert,
  FormHelperText,
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
  UpdateRounded as UpdateIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format, addDays, addMonths, parseISO } from 'date-fns';
import { setApplications } from '../../store/slices/applicationsSlice';
import { fetchPrograms } from '../../store/slices/programsSlice';
import { RootState } from '../../store';
import { getResponsiveTimelineStyles, getResponsiveConnectorStyles } from '../../utils/responsiveUtils';
import MilestoneProgressBar from '../../components/MilestoneProgressBar';
import MobileNavigation from '../../components/MobileNavigation';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../../utils/api';
import { findProgramForApplication } from '../../utils/programUtils';
import { 
  getDefaultMilestones, 
  createMilestoneObjects, 
  calculateExpectedDates as calculateMilestoneDates,
  getMilestonesForApplication 
} from '../../utils/milestoneUtils';
import UpdateStatusDialog from '../../components/UpdateStatusDialog';
import CustomMilestoneDialog from '../../components/CustomMilestoneDialog';

// Define Milestone interface to match the one in MilestoneProgressBar
interface Milestone {
  name: string;
  completed: boolean;
  date?: string;
  notes?: string;
  expectedDate?: string;
}

// Define StatusUpdate interface based on the application's statusHistory
interface StatusUpdate {
  id: string;
  statusName: string;
  statusDate: string;
  notes?: string;
}

// Define Program interface
interface Program {
  id: string;
  programName: string;
  category: string;
  description: string;
  visaOffices: string;
  milestoneUpdates: string[];
  processingTimeMonths: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { applications, loading } = useSelector((state: RootState) => state.applications);
  const programs = useSelector((state: RootState) => state.programs.programs);
  const programsLoading = useSelector((state: RootState) => state.programs.loading);
  const programsError = useSelector((state: RootState) => state.programs.error);
  const [error, setError] = useState<string | null>(null);
  
  // State for the update milestone dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState<boolean>(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [availableMilestones, setAvailableMilestones] = useState<string[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState<boolean>(false);
  const [isCustomMilestoneDialogOpen, setIsCustomMilestoneDialogOpen] = useState(false);
  
  // Add loading and error states for applications
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Always attempt to fetch applications from the API to ensure we have the latest data
      await fetchApplications();
      
      // Load programs if needed
      if (programs.length === 0 && !programsLoading) {
        dispatch(fetchPrograms());
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    }
  };
  
  // Update the fetchApplications function
  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      setApplicationsError(null);
      
      const response = await api.get('/applications');
      
      if (response.data && Array.isArray(response.data)) {
        // Ensure we dispatch the proper action to update the Redux store
        dispatch(setApplications(response.data));
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
      setApplicationsError(error.message || 'Failed to load applications');
      if (error.response && error.response.status === 401) {
        // Handle token expiration
        toast.error('Your session has expired. Please log in again.');
        // Optionally, redirect to login
        // navigate('/login');
      } else {
        toast.error('Failed to load applications. Please try refreshing the page.');
      }
      return [];
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Make sure programs are loaded
  useEffect(() => {
    if (programs.length === 0 && !programsLoading) {
      dispatch(fetchPrograms());
    }
  }, [dispatch, programs.length, programsLoading]);

  // Update useEffect for fetching applications
  useEffect(() => {
    fetchApplications();
    
    // Set up polling for refreshing application data
    const interval = setInterval(() => {
      fetchApplications();
    }, 30000); // 30 second interval
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading || !applications) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (applications.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          No Applications Found
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          You haven't submitted any immigration applications yet.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/applications/new')}
        >
          Create Your First Application
        </Button>
      </Box>
    );
  }
  
  if (applicationsLoading && applications.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (applicationsError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{applicationsError}</Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }} 
          onClick={fetchApplications}
        >
          Try Again
        </Button>
      </Box>
    );
  }
  
  // Sort applications by submission date (newest first)
  const sortedApplications = [...applications].sort(
    (a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
  );
  
  // Primary application is the most recent one
  const primaryApplication = sortedApplications[0];
  
  // Secondary applications are all others
  const secondaryApplications = sortedApplications.slice(1);
  
  // Find the program that matches the primary application
  const primaryProgram = programs.find((p: Program) => p.programName === primaryApplication.type);
  
  // Calculate progress percentage based on completed milestones
  const calculateProgress = (application: any) => {
    const program = programs.find((p: Program) => p.programName === application.type);
    if (!program) return 0;
    
    const completedMilestones = application.statusHistory.length;
    const totalMilestones = program.milestoneUpdates.length;
    
    return Math.round((completedMilestones / totalMilestones) * 100);
  };
  
  // Calculate estimated time remaining
  const getEstimatedTimeRemaining = (application: any) => {
    const program = findProgramForApplication(programs, application.type, application.subType);
    if (!program) return 'Unknown';
    
    const completedMilestones = application.statusHistory.length;
    const totalMilestones = program.milestoneUpdates.length;
    const remainingMilestones = totalMilestones - completedMilestones;
    
    // Assuming each milestone takes approximately the same time
    const averageTimePerMilestone = program.processingTimeMonths / totalMilestones;
    const estimatedMonthsRemaining = Math.round(remainingMilestones * averageTimePerMilestone);
    
    if (estimatedMonthsRemaining <= 0) return 'Almost complete';
    return estimatedMonthsRemaining === 1 
      ? '~1 month remaining' 
      : `~${estimatedMonthsRemaining} months remaining`;
  };

  // Calculate expected dates for all upcoming milestones
  const calculateExpectedDates = (application: any) => {
    const program = findProgramForApplication(programs, application.type, application.subType);
    if (!program) return {};
    
    const submissionDate = new Date(application.submissionDate);
    const processingTimeMonths = program.processingTimeMonths || 6; // Default to 6 months
    const totalProcessingDays = processingTimeMonths * 30; // Approximate
    
    const expectedDates: Record<string, Date> = {};
    const completedMilestones = new Set<string>(
      application.statusHistory.map((status: StatusUpdate) => status.statusName)
    );
    
    // Create milestones with expected dates
    program.milestoneUpdates.forEach((milestoneName: string, index: number) => {
      if (!completedMilestones.has(milestoneName)) {
        // Calculate days from submission based on milestone position
        const milestonesRemaining = index - application.statusHistory.length + 1;
        const daysToAdd = (totalProcessingDays / (program.milestoneUpdates.length + 1)) * milestonesRemaining;
        
        const expectedDate = new Date(submissionDate);
        expectedDate.setDate(expectedDate.getDate() + daysToAdd);
        
        expectedDates[milestoneName] = expectedDate;
      }
    });
    
    return expectedDates;
  };

  // Create milestones array for the MilestoneProgressBar
  const createMilestones = (application: any): Milestone[] => {
    if (!application) return [];

    // Find program for the application
    const program = findProgramForApplication(
      programs,
      application.type,
      application.subType
    );

    // Get completed milestones from status history
    const statusHistory = application.statusHistory || [];
    const completedMilestones = new Set<string>(
      statusHistory.map((status: StatusUpdate) => status.statusName)
    );

    // Get all milestones for this application (either from program or defaults)
    const allMilestones = getMilestonesForApplication(application, program);
    
    // Calculate expected dates for upcoming milestones
    const processingTimeMonths = program?.processingTimeMonths || 6; // Default to 6 months if unknown
    const expectedDates = calculateMilestoneDates(
      application.submissionDate,
      processingTimeMonths,
      allMilestones,
      completedMilestones
    );

    // Create milestone objects
    return createMilestoneObjects(
      allMilestones,
      completedMilestones,
      statusHistory,
      expectedDates
    );
  };
  
  // Get available milestones for the selected application
  const getAvailableMilestones = () => {
    if (!selectedApplication || !programs || programs.length === 0) {
      return [];
    }

    // Find program for the application
    const program = findProgramForApplication(
      programs,
      selectedApplication.type,
      selectedApplication.subType
    );

    if (!program) {
      console.warn(`No matching program found for ${selectedApplication.type}: ${selectedApplication.subType}`);
      // Use default milestones based on application type if no program is found
      return getDefaultMilestones(selectedApplication.type);
    }

    console.log("Program for milestones:", program.programName);
    
    // Get completed milestones from status history
    const statusHistory = selectedApplication.statusHistory || [];
    const completedMilestones = new Set<string>(
      statusHistory.map((status: StatusUpdate) => status.statusName)
    );
    
    // Get all milestones for this application (either from program or defaults)
    const allMilestones = getMilestonesForApplication(selectedApplication, program);
    
    // Return milestones that are not already completed
    return allMilestones.filter((milestone: string) => !completedMilestones.has(milestone));
  };

  // Handle opening the update milestone dialog
  const handleOpenUpdateDialog = (application: any) => {
    setSelectedApplication(application);
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
    if (!selectedApplication) return;

    try {
      // Create the custom milestone
      await api.post('/api/milestones/custom', {
        name: milestoneName,
        programType: selectedApplication.type,
        programSubType: selectedApplication.subType
      });

      // Add the milestone status update to the application
      await api.post(`/applications/${selectedApplication.id}/status`, {
        statusName: milestoneName,
        statusDate: new Date().toISOString(),
        notes: 'Custom milestone added'
      });

      // Refresh applications data
      const applicationsResponse = await api.get('/applications');
      dispatch(setApplications(applicationsResponse.data));

      toast.success('Custom milestone added successfully');
    } catch (error: any) {
      console.error('Failed to add custom milestone:', error);
      toast.error(error.message || 'Failed to add custom milestone');
    }
  };

  // Update the handleViewDetails function to properly set the selected application
  const handleViewDetails = (applicationId: string) => {
    console.log('View details clicked for application:', applicationId);
    
    if (!applicationId) {
      console.error('No application ID provided');
      toast.error('Application ID is missing');
      return;
    }
    
    // Find the application in our local state
    const application = applications.find(app => app.id === applicationId);
    
    // If found, set it as the selected application in Redux before navigating
    if (application) {
      console.log('Setting selected application:', application);
      try {
        dispatch(setSelectedApplication(application));
        
        // Navigate to the application details page
        navigate(`/applications/${applicationId}`);
      } catch (error) {
        console.error('Error setting selected application:', error);
        toast.error('Error navigating to application details');
      }
    } else {
      console.error('Application not found with ID:', applicationId);
      toast.error('Application details not found');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {isMobile ? (
        <MobileNavigation 
          title="Your Immigration Journey"
        />
      ) : (
        <Typography variant="h4" sx={{ mb: 3 }}>
          Your Immigration Journey
        </Typography>
      )}
      
      {/* Primary Application */}
      <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 3 }, mb: 4, mx: { xs: -1, sm: 0 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h5">
              {primaryApplication.type} - {primaryApplication.subType}
            </Typography>
            <Typography color="textSecondary">
              {primaryApplication.country}, {primaryApplication.city}
            </Typography>
          </Box>
          <Box sx={{ mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' }, display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={<UpdateIcon />}
              onClick={() => handleOpenUpdateDialog(primaryApplication)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Update Status
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => handleViewDetails(primaryApplication.id)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              View Details
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <MilestoneProgressBar 
            progress={calculateProgress(primaryApplication)}
            estimatedTimeRemaining={getEstimatedTimeRemaining(primaryApplication)}
            milestones={createMilestones(primaryApplication)}
          />
        </Box>
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          Status Timeline
        </Typography>
        
        <Timeline position={isMobile ? "right" : "alternate"} sx={getResponsiveTimelineStyles(theme, isMobile)}>
          {primaryApplication.statusHistory.map((status: StatusUpdate, index: number) => (
            <TimelineItem key={index}>
              {!isMobile && (
                <TimelineOppositeContent color="text.secondary">
                  {format(new Date(status.statusDate), 'MMM d, yyyy')}
                </TimelineOppositeContent>
              )}
              <TimelineSeparator>
                <TimelineDot color="primary" />
                {index < primaryApplication.statusHistory.length - 1 && (
                  <TimelineConnector sx={getResponsiveConnectorStyles(theme, isMobile)} />
                )}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="body1">
                  {status.statusName}
                </Typography>
                {isMobile && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {format(new Date(status.statusDate), 'MMM d, yyyy')}
                  </Typography>
                )}
                {status.notes && (
                  <Typography variant="body2" color="text.secondary">
                    {status.notes}
                  </Typography>
                )}
              </TimelineContent>
            </TimelineItem>
          ))}
          
          {primaryProgram && primaryApplication.statusHistory.length < primaryProgram.milestoneUpdates.length && (
            <>
              <TimelineConnector />
              <TimelineItem>
                <TimelineOppositeContent color="text.secondary" sx={{ display: isMobile ? 'none' : 'block' }}>
                  Upcoming
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot variant="outlined" />
                  <TimelineConnector sx={getResponsiveConnectorStyles(theme, isMobile, 'text.disabled')} />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body1" color="text.secondary">
                    {primaryProgram.milestoneUpdates[primaryApplication.statusHistory.length]}
                  </Typography>
                  {isMobile && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Upcoming
                    </Typography>
                  )}
                </TimelineContent>
              </TimelineItem>
            </>
          )}
        </Timeline>
      </Paper>

      {/* Secondary Applications (if any) */}
      {secondaryApplications.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
            Your Other Applications
          </Typography>
          <Grid container spacing={3}>
            {secondaryApplications.map((application) => (
              <Grid item xs={12} md={6} key={application.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">
                          {application.type} - {application.subType}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                          {application.country}, {application.city}
                        </Typography>
                      </Box>
                      <Chip 
                        label={application.currentStatus} 
                        size="small"
                        color="primary" 
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {calculateProgress(application)}%
                        </Typography>
                      </Box>
                      <Box sx={{ position: 'relative', pt: 0.5, pb: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={calculateProgress(application)} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              transition: 'transform 1s ease-in-out'
                            }
                          }}
                        />
                        {(() => {
                          const program = programs.find((p: Program) => p.programName === application.type);
                          if (!program) return null;
                          
                          const totalMilestones = program.milestoneUpdates.length;
                          return program.milestoneUpdates.map((milestone: string, index: number) => {
                            const position = ((index + 1) / totalMilestones) * 100;
                            const isCompleted = application.statusHistory.some(
                              (status: StatusUpdate) => status.statusName === milestone
                            );
                            
                            return (
                              <Box
                                key={index}
                                sx={{
                                  position: 'absolute',
                                  left: `${position}%`,
                                  top: '4px',
                                  transform: 'translate(-50%, 0)',
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: isCompleted ? 'success.main' : 'background.paper',
                                  border: isCompleted ? 'none' : `2px solid ${theme.palette.grey[400]}`,
                                  zIndex: 2
                                }}
                              />
                            );
                          });
                        })()}
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<UpdateIcon />}
                        sx={{ flex: 1 }}
                        onClick={() => handleOpenUpdateDialog(application)}
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="contained"
                        sx={{ flex: 1 }}
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
        </>
      )}
      
      {/* Update Status Dialog */}
      <UpdateStatusDialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        application={selectedApplication}
        onCustomMilestoneClick={handleOpenCustomMilestoneDialog}
        onStatusUpdated={() => {
          // Refresh applications
          fetchData();
        }}
      />

      {/* Custom Milestone Dialog */}
      {selectedApplication && (
        <CustomMilestoneDialog
          open={isCustomMilestoneDialogOpen}
          onClose={handleCloseCustomMilestoneDialog}
          onAddMilestone={handleAddCustomMilestone}
          applicationType={selectedApplication.type}
          applicationSubtype={selectedApplication.subType}
        />
      )}
    </Box>
  );
};

export default Dashboard;
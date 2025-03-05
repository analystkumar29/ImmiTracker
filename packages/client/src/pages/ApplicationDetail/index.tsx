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
import { RootState } from '@/store';
import { setSelectedApplication } from '@/store/slices/applicationSlice';
import { ImmigrationProgram } from '@/types/program';
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
  const { selectedApplication } = useSelector(
    (state: RootState) => state.application
  );
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [availableMilestones, setAvailableMilestones] = useState<string[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchApplicationAndProgram = async () => {
      setLoading(true);
      try {
        const appRes = await api.get(`/applications/${id}`);
        setApplication(appRes.data);
        
        // Fetch all programs
        const programsRes = await api.get(`/programs`);
        const allPrograms = programsRes.data;
        
        // Use utility function to find the matching program
        const matchedProgram = findProgramForApplication(
          allPrograms,
          appRes.data.type,
          appRes.data.subType
        );
        
        if (matchedProgram) {
          setProgram(matchedProgram);
        } else {
          console.warn(`No matching program found for ${appRes.data.type}: ${appRes.data.subType}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching application details:', error);
        setError('Failed to load application details');
        setLoading(false);
      }
    };

    if (id) {
      fetchApplicationAndProgram();
    }
  }, [id]);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !application) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error || 'Application not found'}</Typography>
        <Button onClick={() => navigate('/applications')} startIcon={<ArrowBackIcon />}>
          Back to Applications
        </Button>
      </Box>
    );
  }

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
                  <Typography variant="body1">{program?.programName || application.type}</Typography>
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
            milestones={program?.milestoneUpdates.map(milestone => {
              const statusUpdate = application.statusHistory.find(
                status => status.statusName === milestone
              );
              
              const expectedDates = calculateExpectedDates(application, program);
              
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

      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
          )}
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Application: {application?.type} - {application?.subType}
          </Typography>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {milestonesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : availableMilestones.length > 0 ? (
              <>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="milestone-select-label">Select Milestone</InputLabel>
                  <Select
                    labelId="milestone-select-label"
                    value={selectedMilestone}
                    onChange={(e) => setSelectedMilestone(e.target.value)}
                    label="Select Milestone"
                    open={!!availableMilestones.length}
                  >
                    {availableMilestones.map((milestone) => (
                      <MenuItem key={milestone} value={milestone}>
                        {milestone}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Select an upcoming milestone to mark as completed</FormHelperText>
                </FormControl>
                
                <DatePicker
                  label="Status Date"
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  sx={{ mt: 2, width: '100%' }}
                  maxDate={new Date()} // Prevents selecting future dates
                />
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                  label="Notes (Optional)"
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                />
              </>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                All milestones have been completed for this application.
              </Alert>
            )}
          </LocalizationProvider>

          {/* Expected milestone dates information */}
          {application && program && !milestonesLoading && availableMilestones.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon fontSize="small" sx={{ mr: 1 }} color="primary" />
                Expected Milestone Dates
              </Typography>
              
              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {availableMilestones.map((milestone) => {
                  const expectedDates = calculateExpectedDates(application, program);
                  const expectedDate = expectedDates[milestone] 
                    ? format(expectedDates[milestone], 'MMM d, yyyy')
                    : 'Not available';
                    
                  return (
                    <ListItem key={milestone} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={milestone} 
                        secondary={`Expected: ${expectedDate}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitMilestone} 
            variant="contained" 
            disabled={!selectedMilestone || loading || availableMilestones.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationDetail; 
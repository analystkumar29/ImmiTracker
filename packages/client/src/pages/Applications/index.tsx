import React, { useEffect, useState } from 'react';
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
  Container,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
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
import { RootState } from '../../store';
import { setApplications, setSelectedApplication } from '../../store/slices/applicationsSlice';
import { fetchPrograms } from '../../store/slices/programsSlice';
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
import UpdateStatusDialog from '../../components/UpdateStatusDialog';
import { Link } from 'react-router-dom';

const Applications = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const applications = useSelector((state: RootState) => state.applications.applications);
  const applicationsLoading = useSelector((state: RootState) => state.applications.loading);
  const applicationsError = useSelector((state: RootState) => state.applications.error);
  
  const programs = useSelector((state: RootState) => state.programs.programs);
  const programsLoading = useSelector((state: RootState) => state.programs.loading);
  const programsError = useSelector((state: RootState) => state.programs.error);
  
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
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/applications');
      
      if (response.data && Array.isArray(response.data)) {
        dispatch(setApplications(response.data));
        
        // If no applications are returned, don't treat it as an error
        if (response.data.length === 0) {
          console.log('No applications found for user');
        }
      } else {
        throw new Error('Invalid applications data received');
      }
    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
      
      if (error.response && error.response.status === 401) {
        // Token might be expired or invalid
        setError('Your session has expired. Please log in again.');
        toast.error('Your session has expired. Please log in again.');
        // You might want to redirect to login page
        // navigate('/login');
      } else {
        setError(error.message || 'Failed to load applications');
        toast.error('Failed to load applications. Please try refreshing.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPrograms = () => {
    if ((programs.length === 0 && !programsLoading) || programsError) {
      dispatch(fetchPrograms());
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    fetchApplications();
    loadPrograms();
  };

  useEffect(() => {
    fetchApplications();
    loadPrograms();
  }, []);

  useEffect(() => {
    setLoading(applicationsLoading || programsLoading);
  }, [applicationsLoading, programsLoading]);

  useEffect(() => {
    if (applicationsError) {
      setError(applicationsError);
    } else if (programsError) {
      setError(programsError);
    } else {
      setError(null);
    }
  }, [applicationsError, programsError]);

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

  if (loading && applications.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && applications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Applications
        </Typography>
        <Typography paragraph>{error}</Typography>
        <Button 
          variant="contained" 
          onClick={refreshData}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const handleViewDetails = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    
    if (application) {
      dispatch(setSelectedApplication(application));
    }
    
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
    
    const program = findProgramForApplication(programs, application.type, application.subType);
    console.log("Found program:", program?.programName || "None");
    
    if (program) {
      const completedMilestones = new Set<string>(
        application.statusHistory.map((status: any) => status.statusName)
      );
      
      const allMilestones = getMilestonesForApplication(application, program);
      
      const availableMilestones = allMilestones.filter(
        (milestone: string) => !completedMilestones.has(milestone)
      );
      
      console.log("Available milestones:", availableMilestones);
      setAvailableMilestones(availableMilestones);
    } else {
      console.warn(`No matching program found for ${application.type}: ${application.subType}`);
      const defaultMilestones = getDefaultMilestones(application.type);
      
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

      fetchApplications();
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

  const createMilestones = (application: any): any[] => {
    if (!application || !application.statusHistory) return [];
    
    const program = programs.find(p => p.id === application.type);
    if (!program) return [];
    
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

  const handleOpenUpdateDialog = (application: Application) => {
    setSelectedApplication(application);
    setUpdateDialogOpen(true);
  };

  const handleOpenCustomMilestoneDialog = () => {
    setIsCustomMilestoneDialogOpen(true);
  };

  const handleCloseCustomMilestoneDialog = () => {
    setIsCustomMilestoneDialogOpen(false);
  };

  const handleAddCustomMilestone = async (milestoneName: string) => {
    if (!selectedApplication) return;

    try {
      setLoading(true);
      
      await api.post('/api/milestones/custom', {
        name: milestoneName,
        programType: selectedApplication.type,
        programSubType: selectedApplication.subType
      });

      await api.post(`/applications/${selectedApplication.id}/status`, {
        statusName: milestoneName,
        statusDate: new Date().toISOString(),
        notes: 'Custom milestone added'
      });

      fetchApplications();
      
      toast.success('Custom milestone added successfully');
    } catch (error: any) {
      console.error('Failed to add custom milestone:', error);
      toast.error(error.message || 'Failed to add custom milestone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
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
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Subtype</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.type}</TableCell>
                    <TableCell>{application.subType}</TableCell>
                    <TableCell>
                      {application.currentStatus || 'Not started'}
                    </TableCell>
                    <TableCell>
                      {application.updatedAt
                        ? formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenUpdateDialog(application)}
                        sx={{ mr: 1 }}
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        component={Link}
                        to={`/applications/${application.id}`}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

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

        {selectedApplication && (
          <UpdateStatusDialog
            open={updateDialogOpen}
            onClose={() => setUpdateDialogOpen(false)}
            application={selectedApplication}
            onCustomMilestoneClick={handleOpenCustomMilestoneDialog}
            onStatusUpdated={() => {
              fetchApplications();
            }}
          />
        )}

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
    </Container>
  );
};

export default Applications; 
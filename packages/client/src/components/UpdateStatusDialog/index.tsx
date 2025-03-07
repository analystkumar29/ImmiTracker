import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  CircularProgress,
  Typography,
  Box,
  Alert,
  Autocomplete,
  Divider,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import api, { getMilestoneTemplates } from '../../utils/api';
import { setApplications } from '../../store/slices/applicationSlice';
import toast from 'react-hot-toast';
import { handleError } from '../../utils/errorHandler';
import { Feedback } from '../Feedback';

interface StatusUpdate {
  id: string;
  statusName: string;
  statusDate: string;
  notes?: string;
}

interface Application {
  id: string;
  type: string;
  subType?: string;
  currentStatus: string;
  statusHistory: StatusUpdate[];
}

interface Program {
  id: string;
  programName: string;
  programSubType?: string;
  milestoneUpdates: string[];
}

interface MilestoneTemplate {
  id: string;
  name: string;
  description?: string;
  useCount: number;
  isApproved: boolean;
}

interface UpdateStatusDialogProps {
  open: boolean;
  onClose: () => void;
  application: Application | null;
  onCustomMilestoneClick?: () => void;
  onStatusUpdated?: () => void;
}

const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({
  open,
  onClose,
  application,
  onCustomMilestoneClick,
  onStatusUpdated
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMilestones, setAvailableMilestones] = useState<string[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState<boolean>(false);
  const [customMilestones, setCustomMilestones] = useState<MilestoneTemplate[]>([]);

  const dispatch = useDispatch();
  const programs = useSelector((state: RootState) => state.programs.programs);

  useEffect(() => {
    if (open && application) {
      // Reset form fields
      setSelectedMilestone('');
      setSelectedDate(new Date());
      setUpdateNotes('');
      setError(null);
      setMilestonesLoading(true);
      
      // Find the program for this application
      const program = findProgramForApplication(programs, application.type, application.subType);
      
      if (program) {
        const completedMilestones = new Set<string>(
          application.statusHistory.map((status) => status.statusName)
        );
        
        const available = program.milestoneUpdates.filter(
          (milestone) => !completedMilestones.has(milestone)
        );
        
        setAvailableMilestones(available);
        
        // Also fetch custom milestone templates
        fetchCustomMilestones(application.type, application.subType);
        
        if (available.length === 0) {
          setError("All standard milestones have been completed for this application. You can add a custom milestone.");
        }
      } else {
        console.warn("Program not found for application type:", application.type, application.subType);
        setAvailableMilestones([]);
        setError("Program information not found. Cannot update milestones.");
      }
      
      setMilestonesLoading(false);
    }
  }, [open, application, programs]);

  const fetchCustomMilestones = async (type: string, subType?: string) => {
    try {
      const templates = await getMilestoneTemplates(type, subType, true);
      if (templates) {
        setCustomMilestones(templates);
        
        // Add custom milestones to available milestones if they're not already completed
        const completedMilestones = new Set<string>(
          application?.statusHistory.map((status) => status.statusName) || []
        );
        
        const customMilestoneNames = templates
          .map(template => template.name)
          .filter(name => !completedMilestones.has(name));
        
        setAvailableMilestones(prev => [...prev, ...customMilestoneNames]);
      }
    } catch (error) {
      console.error('Error fetching custom milestones:', error);
      // Don't set error state here, as we still want to show standard milestones
    }
  };

  const findProgramForApplication = (programs: Program[], type: string, subType?: string) => {
    return programs.find(
      (p) => p.programName === type && (!subType || p.programSubType === subType)
    );
  };

  const handleSubmit = async () => {
    if (!application || !selectedMilestone) {
      setError("Please select a milestone");
      return;
    }

    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.post(`/applications/${application.id}/status`, {
        statusName: selectedMilestone,
        statusDate: selectedDate.toISOString(),
        notes: updateNotes
      });

      // Refresh applications data
      const applicationsResponse = await api.get('/applications');
      dispatch(setApplications(applicationsResponse.data));
      
      // Call the callback if provided
      if (onStatusUpdated) {
        onStatusUpdated();
      }
      
      // Show success message
      toast.success('Application status updated successfully');
      
      // Close the dialog
      onClose();
    } catch (error: any) {
      handleError(error, 'Failed to update application status');
      setError(error.response?.data?.message || 'Failed to update application status');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCustomMilestone = () => {
    onClose();
    if (onCustomMilestoneClick) {
      onCustomMilestoneClick();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Update Application Status
        {application && (
          <Typography variant="subtitle2" color="text.secondary">
            {application.type}{application.subType ? `: ${application.subType}` : ''}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Feedback
            type="error"
            message={error}
            dismissible
            onDismiss={() => setError(null)}
            sx={{ my: 2 }}
          />
        )}
        
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Autocomplete
              options={availableMilestones}
              value={selectedMilestone}
              onChange={(_, value) => {
                setSelectedMilestone(value || '');
                setError(null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Milestone"
                  error={!!error && !selectedMilestone}
                  helperText={!selectedMilestone && error ? error : 'Select an upcoming milestone to mark as completed'}
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
                    onClick={handleOpenCustomMilestone}
                    startIcon={<AddIcon />}
                  >
                    Add Custom Milestone
                  </Button>
                </Box>
              }
            />
          </FormControl>

          {/* Add button for custom milestone */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenCustomMilestone}
            >
              Add Custom Milestone
            </Button>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Status Date"
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              maxDate={new Date()} // Prevent future dates
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
            rows={4}
            value={updateNotes}
            onChange={(e) => setUpdateNotes(e.target.value)}
            fullWidth
            margin="normal"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || !selectedMilestone || !selectedDate}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateStatusDialog; 
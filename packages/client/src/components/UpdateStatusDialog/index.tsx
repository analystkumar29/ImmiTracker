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
import api, { getMilestoneTemplates, updateApplicationStatus, getAllUniqueMilestoneTemplates } from '../../utils/api';
import { setApplications } from '../../store/slices/applicationSlice';
import toast from 'react-hot-toast';
import { handleError } from '../../utils/errorHandler';
import Feedback from '../Feedback';

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
  const [selectedMilestone, setSelectedMilestone] = useState<{id: string, name: string, description?: string} | string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [updateNotes, setUpdateNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableMilestones, setAvailableMilestones] = useState<Array<{id: string, name: string, description?: string}>>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (open && application) {
      // Reset form fields
      setSelectedMilestone(null);
      setSelectedDate(new Date());
      setUpdateNotes('');
      setError(null);
      
      // Fetch milestone templates
      fetchMilestoneTemplates();
    }
  }, [open, application]);

  const fetchMilestoneTemplates = async () => {
    setMilestonesLoading(true);
    try {
      // Fetch all unique milestone templates regardless of program type
      const templates = await getAllUniqueMilestoneTemplates(true);
      
      if (templates && templates.length > 0 && application) {
        // Filter out milestones that have already been completed
        const completedMilestones = new Set<string>(
          application.statusHistory.map((status) => status.statusName)
        );
        
        const filteredTemplates = templates.filter(
          (template: MilestoneTemplate) => !completedMilestones.has(template.name)
        );
        
        // Map the templates to the format expected by the component
        const templateOptions = filteredTemplates.map((template: MilestoneTemplate) => ({
          id: template.id,
          name: template.name,
          description: template.description
        }));
        
        setAvailableMilestones(templateOptions);
        
        if (templateOptions.length === 0) {
          setError("All milestones have been completed for this application.");
        }
      } else {
        setAvailableMilestones([]);
        if (!templates || templates.length === 0) {
          setError("No milestone templates found. You can add a custom milestone.");
        }
      }
    } catch (error) {
      setError('Failed to load milestone templates');
      handleError(error);
    } finally {
      setMilestonesLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Get the milestone name from either the selected object or the free text input
    const milestoneName = selectedMilestone 
      ? (typeof selectedMilestone === 'string' ? selectedMilestone : selectedMilestone.name)
      : '';
      
    if (!milestoneName) {
      setError('Please select or enter a milestone');
      return;
    }
    
    if (!application) {
      setError('Application data is missing');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const statusUpdate = {
        statusName: milestoneName,
        statusDate: selectedDate.toISOString(),
        notes: updateNotes
      };
      
      await updateApplicationStatus(application.id, statusUpdate);
      
      toast.success('Status updated successfully');
      
      if (onStatusUpdated) {
        onStatusUpdated();
      }
      
      onClose();
    } catch (error) {
      handleError(error, 'Failed to update status');
      setError('Failed to update status. Please try again.');
    } finally {
      setIsSubmitting(false);
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
            sx={{ mb: 2 }}
          />
        )}
        
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Autocomplete
              options={availableMilestones}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
              value={selectedMilestone}
              onChange={(_, value) => {
                setSelectedMilestone(value);
                setError(null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select or Type Milestone"
                  placeholder="Start typing to see suggestions..."
                  error={!!error && !selectedMilestone}
                  helperText={!selectedMilestone && error ? error : 'Select an existing milestone or type to create a new one'}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography variant="body1">{option.name}</Typography>
                    {option.description && (
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    )}
                  </Box>
                </li>
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
              freeSolo
              autoHighlight
              autoComplete
              filterOptions={(options, state) => {
                const inputValue = state.inputValue.trim().toLowerCase();
                if (!inputValue) return options;
                
                return options.filter(option => 
                  option.name.toLowerCase().includes(inputValue)
                );
              }}
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
            placeholder="Add any additional details about this milestone..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={
            isSubmitting || 
            !selectedDate || 
            (selectedMilestone === null || 
             (typeof selectedMilestone === 'string' && selectedMilestone.trim() === ''))
          }
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateStatusDialog; 
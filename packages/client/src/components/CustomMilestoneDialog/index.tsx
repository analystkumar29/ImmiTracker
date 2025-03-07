import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Autocomplete,
  Chip,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Alert
} from '@mui/material';
import api, { getMilestoneTemplates, getAllUniqueMilestoneTemplates } from '../../utils/api';
import { toast } from 'react-hot-toast';
import { handleError } from '../../utils/errorHandler';

// Define our props interface
interface CustomMilestoneDialogProps {
  open: boolean;
  onClose: () => void;
  onAddMilestone: (milestone: string) => void;
  applicationType: string;
  applicationSubtype?: string;
}

interface MilestoneTemplate {
  id: string;
  name: string;
  description?: string;
  useCount: number;
  isApproved: boolean;
}

// Component definition
const CustomMilestoneDialog: React.FC<CustomMilestoneDialogProps> = ({
  open,
  onClose,
  onAddMilestone,
  applicationType,
  applicationSubtype
}) => {
  const [customMilestone, setCustomMilestone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MilestoneTemplate[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch milestone suggestions when dialog opens
  useEffect(() => {
    if (open) {
      fetchSuggestions();
    }
  }, [open, applicationType, applicationSubtype]);

  // Filter suggestions as user types
  useEffect(() => {
    if (suggestions.length > 0) {
      const lowercaseInput = customMilestone.toLowerCase();
      const filtered = suggestions
        .filter(template => template.name.toLowerCase().includes(lowercaseInput))
        .map(template => template.name);
      
      // Add common milestones if they match the input
      const commonMilestones = getCommonMilestones()
        .filter(name => name.toLowerCase().includes(lowercaseInput))
        // Filter out any that are already in the templates
        .filter(name => !suggestions.some(t => t.name.toLowerCase() === name.toLowerCase()));
      
      setFilteredSuggestions([...filtered, ...commonMilestones]);
    }
  }, [customMilestone, suggestions]);

  const getCommonMilestones = () => {
    // Common milestones that apply to most application types
    return [
      "Application Acknowledged",
      "Biometrics Requested",
      "Medical Requested",
      "Background Check Started",
      "Background Check Completed",
      "Initial Review Completed",
      "Interview Scheduled",
      "Interview Completed",
      "Additional Documents Requested",
      "Final Review",
      "Fee Payment Requested",
      "Decision Made"
    ];
  };

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const templates = await getAllUniqueMilestoneTemplates(true);
      
      if (templates && templates.length > 0) {
        // Sort by useCount (most used first)
        const sortedTemplates = [...templates].sort((a, b) => b.useCount - a.useCount);
        setSuggestions(sortedTemplates);
      }
    } catch (error) {
      handleError(error, 'Failed to fetch milestone suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!customMilestone.trim()) {
      setError('Please enter a milestone name');
      return;
    }

    try {
      setLoading(true);
      
      // Create the custom milestone in the database
      await api.post('/milestones/custom', {
        name: customMilestone,
        programType: applicationType,
        programSubType: applicationSubtype
      });
      
      // Add the milestone to the parent component
      onAddMilestone(customMilestone);
      
      // Show success message
      toast.success('Custom milestone added');
      
      // Close the dialog
      onClose();
    } catch (error) {
      handleError(error, 'Failed to add custom milestone');
      setError('Failed to add custom milestone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullScreen={fullScreen}
      aria-labelledby="custom-milestone-dialog-title"
    >
      <DialogTitle id="custom-milestone-dialog-title">
        Add Custom Milestone
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Add a custom milestone for this {applicationSubtype || applicationType} application.
          If multiple users add the same milestone, it may become a permanent option.
        </DialogContentText>
        
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            freeSolo
            options={filteredSuggestions}
            loading={loading}
            value={customMilestone}
            onChange={(_, newValue) => {
              if (typeof newValue === 'string') {
                setCustomMilestone(newValue);
              }
            }}
            onInputChange={(_, newInputValue) => {
              setCustomMilestone(newInputValue);
              setError(null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Milestone Name"
                variant="outlined"
                fullWidth
                error={!!error}
                helperText={error}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>
        
        {suggestions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Popular milestones:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {suggestions
                .sort((a, b) => b.useCount - a.useCount)
                .slice(0, 5)
                .map((suggestion) => (
                <Chip 
                  key={suggestion.id}
                  label={suggestion.name}
                  onClick={() => setCustomMilestone(suggestion.name)}
                  color={suggestion.isApproved ? "primary" : "default"}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
        
        {suggestions.length === 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Common milestones:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {getCommonMilestones().slice(0, 5).map((suggestion) => (
                <Chip 
                  key={suggestion}
                  label={suggestion}
                  onClick={() => setCustomMilestone(suggestion)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mt: 2 }}>
            Custom milestones that are frequently used will automatically become permanent options.
          </Alert>
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
          disabled={loading || !customMilestone.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Milestone'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomMilestoneDialog; 
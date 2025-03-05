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
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

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
  const [milestoneName, setMilestoneName] = useState('');
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
      const lowercaseInput = milestoneName.toLowerCase();
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
  }, [milestoneName, suggestions]);

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
    setLoading(true);
    try {
      // Fetch suggested templates from the server
      const response = await api.get(`/api/milestones/templates/${applicationType}`, {
        params: { subType: applicationSubtype, includeUnapproved: true }
      });
      
      if (response.data) {
        setSuggestions(response.data);
      }
    } catch (error) {
      console.error('Error fetching milestone suggestions:', error);
      setError('Failed to load suggestions');
      
      // Fall back to common milestones
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!milestoneName.trim()) {
      setError('Please enter a milestone name');
      return;
    }

    setLoading(true);
    try {
      // Submit the custom milestone to the server
      await api.post('/api/milestones/custom', {
        name: milestoneName.trim(),
        programType: applicationType,
        programSubType: applicationSubtype
      });
      
      onAddMilestone(milestoneName.trim());
      onClose();
      setMilestoneName('');
      setError(null);
      toast.success(`Added custom milestone: ${milestoneName.trim()}`);
    } catch (error) {
      console.error('Error adding custom milestone:', error);
      setError('Failed to add custom milestone');
      toast.error('Failed to add custom milestone');
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
            value={milestoneName}
            onChange={(_, newValue) => {
              if (typeof newValue === 'string') {
                setMilestoneName(newValue);
              }
            }}
            onInputChange={(_, newInputValue) => {
              setMilestoneName(newInputValue);
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
                  onClick={() => setMilestoneName(suggestion.name)}
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
                  onClick={() => setMilestoneName(suggestion)}
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
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary"
          disabled={!milestoneName.trim() || loading}
          variant="contained"
        >
          {loading ? <CircularProgress size={24} /> : 'Add Milestone'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomMilestoneDialog; 
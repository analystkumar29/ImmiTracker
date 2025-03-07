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
  useTheme
} from '@mui/material';

// Define our props interface
interface CustomMilestoneDialogProps {
  open: boolean;
  onClose: () => void;
  onAddMilestone: (milestone: string) => void;
  applicationType: string;
  applicationSubtype?: string;
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch milestone suggestions when dialog opens
  useEffect(() => {
    if (open) {
      fetchSuggestions();
    }
  }, [open, applicationType, applicationSubtype]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      // Common milestones
      const commonMilestones = [
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
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuggestions(commonMilestones);
    } catch (error) {
      console.error('Error fetching milestone suggestions:', error);
      setError('Failed to load suggestions');
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
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onAddMilestone(milestoneName.trim());
      onClose();
      setMilestoneName('');
      setError(null);
    } catch (error) {
      console.error('Error adding custom milestone:', error);
      setError('Failed to add custom milestone');
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
        </DialogContentText>
        
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            freeSolo
            options={suggestions}
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
              Common milestones:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {suggestions.slice(0, 5).map((suggestion) => (
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
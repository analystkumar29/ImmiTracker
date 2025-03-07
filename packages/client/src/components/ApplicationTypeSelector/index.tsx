import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FlagIcon from '@mui/icons-material/Flag';
import { SelectChangeEvent } from '@mui/material/Select';
import { 
  getApplicationTypesByCategory, 
  createApplicationType
} from '../../utils/api';
import { flagAppType, unflagAppType } from '../../store/slices/flaggingSlice';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';

interface ApplicationType {
  id: string;
  name: string;
  description?: string;
  category: string;
  isDefault: boolean;
  useCount: number;
  flagCount: number;
  isFlaggedByUser?: boolean;
}

interface Props {
  category: string;
  selectedTypeId?: string;
  onChange?: (typeId: string, typeName: string) => void;
  allowCustom?: boolean;
}

const ApplicationTypeSelector: React.FC<Props> = ({
  category,
  selectedTypeId,
  onChange,
  allowCustom = true
}) => {
  const [applicationTypes, setApplicationTypes] = useState<ApplicationType[]>([]);
  const [selectedType, setSelectedType] = useState<string>(selectedTypeId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const { flaggedItems } = useSelector((state: RootState) => state.flagging);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Track which application types have been flagged by the current user
  const isFlagged = (typeId: string) => {
    return flaggedItems.some(item => item.id === typeId && item.type === 'applicationType');
  };
  
  useEffect(() => {
    const fetchApplicationTypes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getApplicationTypesByCategory(category);
        setApplicationTypes(response.data || []);
      } catch (err) {
        setError('Failed to load application types');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplicationTypes();
  }, [category]);
  
  useEffect(() => {
    if (selectedTypeId) {
      setSelectedType(selectedTypeId);
    }
  }, [selectedTypeId]);
  
  const handleChange = (event: SelectChangeEvent) => {
    const typeId = event.target.value;
    setSelectedType(typeId);
    
    if (onChange) {
      const typeName = applicationTypes.find(t => t.id === typeId)?.name || '';
      onChange(typeId, typeName);
    }
  };
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNewTypeName('');
    setNewTypeDescription('');
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleCreateType = async () => {
    if (!newTypeName.trim()) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await createApplicationType({
        name: newTypeName.trim(),
        description: newTypeDescription.trim() || undefined,
        category
      });
      
      const newType = response.data;
      setApplicationTypes(prev => [...prev, newType]);
      setSelectedType(newType.id);
      
      if (onChange) {
        onChange(newType.id, newType.name);
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error creating application type:', err);
      setError('Failed to create new application type');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleFlag = async (typeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user) return;
    
    try {
      if (isFlagged(typeId) || applicationTypes.find(t => t.id === typeId)?.isFlaggedByUser) {
        await dispatch(unflagAppType(typeId));
        
        // Update the type in the list
        setApplicationTypes(prev => prev.map(t => 
          t.id === typeId ? { ...t, flagCount: Math.max(0, t.flagCount - 1), isFlaggedByUser: false } : t
        ));
      } else {
        await dispatch(flagAppType(typeId));
        
        // Update the type in the list
        setApplicationTypes(prev => prev.map(t => 
          t.id === typeId ? { ...t, flagCount: t.flagCount + 1, isFlaggedByUser: true } : t
        ));
      }
    } catch (err) {
      console.error('Error flagging/unflagging application type:', err);
      setError('Failed to update flag status');
    }
  };
  
  if (loading) {
    return <CircularProgress size={24} />;
  }
  
  const sortedTypes = [...applicationTypes].sort((a, b) => {
    // Default types first, then by name
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.name.localeCompare(b.name);
  });
  
  return (
    <Box>
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel id="application-type-label">Application Type</InputLabel>
        <Select
          labelId="application-type-label"
          value={selectedType}
          onChange={handleChange}
          label="Application Type"
          error={!!error}
          renderValue={(selected) => {
            const type = applicationTypes.find(t => t.id === selected);
            return (
              <Box display="flex" alignItems="center">
                {type?.name}
                {type && !type.isDefault && (
                  <Chip
                    size="small"
                    label="Custom"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 1, height: 20 }}
                  />
                )}
              </Box>
            );
          }}
        >
          {sortedTypes.map((type) => (
            <MenuItem key={type.id} value={type.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body1">
                  {type.name}
                  {!type.isDefault && (
                    <Chip
                      size="small"
                      label="Custom"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 1, height: 20 }}
                    />
                  )}
                </Typography>
                {type.description && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {type.description}
                  </Typography>
                )}
              </Box>
              
              {user && (
                <Tooltip title={isFlagged(type.id) || type.isFlaggedByUser ? "Remove flag" : "Flag as irrelevant"}>
                  <IconButton
                    size="small"
                    color={isFlagged(type.id) || type.isFlaggedByUser ? "error" : "default"}
                    onClick={(e) => handleFlag(type.id, e)}
                  >
                    <FlagIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText error>{error}</FormHelperText>}
      </FormControl>
      
      {allowCustom && (
        <Box mt={1}>
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={handleOpenDialog}
            variant="outlined"
          >
            Add Custom Type
          </Button>
        </Box>
      )}
      
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Custom Application Type</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Type Name"
            fullWidth
            variant="outlined"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            variant="outlined"
            value={newTypeDescription}
            onChange={(e) => setNewTypeDescription(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateType} 
            variant="contained" 
            color="primary"
            disabled={submitting || !newTypeName.trim()}
          >
            {submitting ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationTypeSelector; 
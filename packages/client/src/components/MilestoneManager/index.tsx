import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

interface Milestone {
  id: string;
  name: string;
  description?: string;
  programType: string;
  programSubType?: string;
  isDefault: boolean;
  order: number;
}

interface MilestoneTemplate {
  id: string;
  name: string;
  description?: string;
  programType: string;
  programSubType?: string;
  isApproved: boolean;
  useCount: number;
}

interface MilestoneManagerProps {
  programType: string;
  programSubType?: string;
  onMilestonesChange?: (milestones: Milestone[]) => void;
}

const MilestoneManager: React.FC<MilestoneManagerProps> = ({
  programType,
  programSubType,
  onMilestonesChange
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDescription, setNewMilestoneDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MilestoneTemplate | null>(null);
  
  const token = useSelector((state: RootState) => state.auth.token);
  
  // Fetch milestones and templates
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch milestones
        const milestonesUrl = programSubType
          ? `/api/milestones/program/${programType}/subtype/${programSubType}`
          : `/api/milestones/program/${programType}`;
        
        const milestonesResponse = await fetch(milestonesUrl);
        if (!milestonesResponse.ok) {
          throw new Error('Failed to fetch milestones');
        }
        const milestonesData = await milestonesResponse.json();
        setMilestones(milestonesData);
        
        // Fetch templates
        const templatesUrl = programSubType
          ? `/api/milestones/templates/program/${programType}/subtype/${programSubType}?includeUnapproved=true`
          : `/api/milestones/templates/program/${programType}?includeUnapproved=true`;
        
        const templatesResponse = await fetch(templatesUrl);
        if (!templatesResponse.ok) {
          throw new Error('Failed to fetch milestone templates');
        }
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [programType, programSubType]);
  
  // Notify parent component when milestones change
  useEffect(() => {
    if (onMilestonesChange) {
      onMilestonesChange(milestones);
    }
  }, [milestones, onMilestonesChange]);
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNewMilestoneName('');
    setNewMilestoneDescription('');
    setSelectedTemplate(null);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleAddMilestone = async () => {
    if (!newMilestoneName.trim() && !selectedTemplate) {
      return;
    }
    
    try {
      const response = await api.post('/milestones', {
        name: selectedTemplate ? selectedTemplate.name : newMilestoneName,
        description: newMilestoneDescription || undefined,
        programType,
        programSubType: programSubType || undefined
      });
      
      setMilestones([...milestones, response.data]);
      setNewMilestoneName('');
      setNewMilestoneDescription('');
      setSelectedTemplate(null);
      toast.success('Milestone added successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add milestone');
    }
  };
  
  const handleDeleteMilestone = async (id: string) => {
    try {
      await api.delete(`/milestones/${id}`);
      
      setMilestones(milestones.filter(milestone => milestone.id !== id));
      toast.success('Milestone deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete milestone');
    }
  };
  
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(milestones);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property for each milestone
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setMilestones(updatedItems);
    
    // Update order in the backend
    try {
      const response = await api.put(`/milestones/${reorderedItem.id}/order`, {
        order: result.destination.index
      });
      
      if (!response.ok) {
        throw new Error('Failed to update milestone order');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update milestone order');
    }
  };
  
  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const response = await api.get('/milestones', {
        params: { programType, programSubType }
      });
      
      setMilestones(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch milestones');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Manage Milestones</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Milestone
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="milestones">
          {(provided) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ bgcolor: 'background.paper' }}
            >
              {milestones.length === 0 ? (
                <Typography variant="body2" color="text.secondary" p={2} textAlign="center">
                  No milestones found. Add your first milestone!
                </Typography>
              ) : (
                milestones
                  .sort((a, b) => a.order - b.order)
                  .map((milestone, index) => (
                    <Draggable
                      key={milestone.id}
                      draggableId={milestone.id}
                      index={index}
                      isDragDisabled={milestone.isDefault}
                    >
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          divider
                          sx={{
                            bgcolor: milestone.isDefault ? 'action.hover' : 'background.paper',
                            borderRadius: 1,
                            mb: 1
                          }}
                        >
                          <Box {...provided.dragHandleProps} mr={1}>
                            <DragIndicatorIcon color="action" />
                          </Box>
                          <ListItemText
                            primary={milestone.name}
                            secondary={milestone.description}
                          />
                          {milestone.isDefault ? (
                            <Chip
                              label="Default"
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                          ) : (
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleDeleteMilestone(milestone.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      )}
                    </Draggable>
                  ))
              )}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Add Milestone Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Milestone</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <Autocomplete
              options={templates}
              getOptionLabel={(option) => option.name}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    {option.name}
                    {option.isApproved ? (
                      <Chip
                        label="Approved"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    ) : (
                      <Chip
                        label="Custom"
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                </li>
              )}
              value={selectedTemplate}
              onChange={(_, newValue) => {
                setSelectedTemplate(newValue);
                if (newValue) {
                  setNewMilestoneName(newValue.name);
                  setNewMilestoneDescription(newValue.description || '');
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select from existing templates"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              )}
            />
            
            <Divider sx={{ my: 2 }}>
              <Chip label="OR" />
            </Divider>
            
            <TextField
              autoFocus
              margin="dense"
              label="Milestone Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newMilestoneName}
              onChange={(e) => setNewMilestoneName(e.target.value)}
              disabled={!!selectedTemplate}
            />
            <TextField
              margin="dense"
              label="Description (optional)"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              value={newMilestoneDescription}
              onChange={(e) => setNewMilestoneDescription(e.target.value)}
              disabled={!!selectedTemplate}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddMilestone}
            variant="contained"
            disabled={!newMilestoneName && !selectedTemplate}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MilestoneManager; 
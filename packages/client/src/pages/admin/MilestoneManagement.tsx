import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Divider, 
  List, 
  ListItem, 
  ListItemText,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
  getAllUniqueMilestoneTemplates, 
  normalizeMilestones,
  getMilestoneTemplatesByCategory
} from '../../utils/api';
import { MILESTONE_CATEGORIES } from '../../utils/milestoneUtils';
import AdminLayout from 'components/Layout/AdminLayout';
import { toast } from 'react-hot-toast';

const MilestoneManagement = () => {
  const [loading, setLoading] = useState(false);
  const [normalizing, setNormalizing] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [categorizedMilestones, setCategorizedMilestones] = useState<Record<string, any[]>>({});
  const [openMergeDialog, setOpenMergeDialog] = useState(false);
  const [normalizationStats, setNormalizationStats] = useState<any>(null);

  useEffect(() => {
    fetchMilestones();
    fetchCategorizedMilestones();
  }, []);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const data = await getAllUniqueMilestoneTemplates(true);
      setMilestones(data);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast.error('Failed to fetch milestones');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorizedMilestones = async () => {
    try {
      const data = await getMilestoneTemplatesByCategory();
      setCategorizedMilestones(data);
    } catch (error) {
      console.error('Error fetching categorized milestones:', error);
    }
  };

  const handleNormalize = async (merge = false) => {
    if (merge) {
      setOpenMergeDialog(true);
      return;
    }

    setNormalizing(true);
    try {
      const result = await normalizeMilestones(false);
      setNormalizationStats(result);
      
      // Refresh milestone data
      await fetchMilestones();
      await fetchCategorizedMilestones();
      
      toast.success('Milestones normalized successfully');
    } catch (error) {
      console.error('Error normalizing milestones:', error);
      toast.error('Failed to normalize milestones');
    } finally {
      setNormalizing(false);
    }
  };

  const handleConfirmMerge = async () => {
    setOpenMergeDialog(false);
    setNormalizing(true);
    
    try {
      const result = await normalizeMilestones(true);
      setNormalizationStats(result);
      
      // Refresh milestone data
      await fetchMilestones();
      await fetchCategorizedMilestones();
      
      toast.success('Milestones normalized and merged successfully');
    } catch (error) {
      console.error('Error merging milestones:', error);
      toast.error('Failed to merge milestones');
    } finally {
      setNormalizing(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      [MILESTONE_CATEGORIES.APPLICATION]: 'Application',
      [MILESTONE_CATEGORIES.BIOMETRICS]: 'Biometrics',
      [MILESTONE_CATEGORIES.MEDICAL]: 'Medical',
      [MILESTONE_CATEGORIES.DOCUMENT]: 'Documents',
      [MILESTONE_CATEGORIES.DECISION]: 'Decision',
      [MILESTONE_CATEGORIES.BACKGROUND_CHECK]: 'Background Check',
      [MILESTONE_CATEGORIES.OTHER]: 'Other'
    };
    
    return labels[category] || 'Uncategorized';
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Milestone Management
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Milestone Normalization
          </Typography>
          <Typography variant="body1" paragraph>
            Normalize milestone names to standardize terminology and categorize milestones.
            This helps with data analysis and improves the user experience.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => handleNormalize(false)}
              disabled={normalizing}
            >
              {normalizing ? <CircularProgress size={24} /> : 'Normalize Milestones'}
            </Button>
            
            <Button 
              variant="outlined" 
              color="warning"
              onClick={() => handleNormalize(true)}
              disabled={normalizing}
            >
              Normalize & Merge Duplicates
            </Button>
          </Box>
          
          {normalizationStats && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Updated {normalizationStats.updatedCount} milestone templates
              </Typography>
              <Typography variant="body2">
                Found {normalizationStats.duplicateGroups} groups of duplicate milestones
              </Typography>
              {normalizationStats.mergedGroups > 0 && (
                <Typography variant="body2">
                  Merged {normalizationStats.mergedGroups} groups of duplicate milestones
                </Typography>
              )}
            </Alert>
          )}
        </Paper>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Milestones by Category
          </Typography>
          
          {Object.keys(categorizedMilestones).length === 0 ? (
            <Typography variant="body1">No categorized milestones found.</Typography>
          ) : (
            Object.entries(categorizedMilestones).map(([category, milestones]) => (
              <Accordion key={category} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    {getCategoryLabel(category)} ({milestones.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {milestones.map((milestone) => (
                      <ListItem key={milestone.id}>
                        <ListItemText 
                          primary={milestone.name} 
                          secondary={`Used ${milestone.useCount} times`}
                        />
                        {milestone.isApproved && (
                          <Chip label="Approved" color="success" size="small" />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            All Milestone Templates
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {milestones.map((milestone) => (
                <React.Fragment key={milestone.id}>
                  <ListItem>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <ListItemText 
                          primary={milestone.name} 
                          secondary={`Normalized: ${milestone.normalizedName || 'Not normalized'}`}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="textSecondary">
                          Program: {milestone.programType}
                          {milestone.programSubType && ` / ${milestone.programSubType}`}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {milestone.isApproved && (
                            <Chip label="Approved" color="success" size="small" />
                          )}
                          {milestone.isDeprecated && (
                            <Chip label="Deprecated" color="error" size="small" />
                          )}
                          {milestone.category && (
                            <Chip label={getCategoryLabel(milestone.category)} size="small" />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>
      
      {/* Confirmation Dialog for Merging */}
      <Dialog
        open={openMergeDialog}
        onClose={() => setOpenMergeDialog(false)}
      >
        <DialogTitle>Confirm Milestone Merge</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will merge duplicate milestones into canonical versions. This action cannot be undone.
            All status history entries will be updated to point to the canonical milestones.
            Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMergeDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmMerge} color="warning">
            Merge Duplicates
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default MilestoneManagement; 
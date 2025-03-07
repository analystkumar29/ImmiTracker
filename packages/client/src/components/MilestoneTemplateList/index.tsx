import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, List, ListItem, Typography, IconButton, Tooltip, Alert, CircularProgress, Badge, ListItemText } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';
import { getMilestoneTemplates } from '../../utils/api';
import { flagMilestone, unflagMilestone } from '../../store/slices/flaggingSlice';
import { RootState } from '../../store';
import { AppDispatch } from '../../store';
import FlagMilestoneEducation from '../FlagMilestoneEducation';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import { keyframes } from '@mui/system';
import PeopleIcon from '@mui/icons-material/People';

interface Template {
  id: string;
  name: string;
  description?: string;
  programType: string;
  programSubType?: string;
  isApproved: boolean;
  isDefault: boolean;
  useCount: number;
  flagCount: number;
  isFlaggedByUser?: boolean;
}

interface Props {
  programType: string;
  programSubType?: string;
  onSelectTemplate?: (template: Template) => void;
  includeUnapproved?: boolean;
  canEdit?: boolean;
  selectedTemplates?: string[];
}

// Define pulsing animation for the flag icon
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
`;

const MilestoneTemplateList: React.FC<Props> = ({ 
  programType, 
  programSubType, 
  onSelectTemplate,
  includeUnapproved = false,
  canEdit = false,
  selectedTemplates = []
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEducation, setShowEducation] = useState(true);
  
  const dispatch = useDispatch<AppDispatch>();
  const { flaggedItems } = useSelector((state: RootState) => state.flagging);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Track which templates have been flagged by the current user
  const isFlagged = (templateId: string) => {
    return flaggedItems.some(item => item.id === templateId && item.type === 'milestone');
  };
  
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getMilestoneTemplates(programType, programSubType, includeUnapproved);
        setTemplates(response.data || []);
      } catch (err) {
        setError('Failed to load milestone templates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [programType, programSubType, includeUnapproved]);
  
  const handleFlag = async (templateId: string) => {
    if (!user) return;
    
    try {
      if (isFlagged(templateId) || templates.find(t => t.id === templateId)?.isFlaggedByUser) {
        await dispatch(unflagMilestone(templateId));
        
        // Update the template in the list
        setTemplates(prev => prev.map(t => 
          t.id === templateId ? { ...t, flagCount: Math.max(0, t.flagCount - 1), isFlaggedByUser: false } : t
        ));
      } else {
        await dispatch(flagMilestone(templateId));
        
        // Update the template in the list
        setTemplates(prev => prev.map(t => 
          t.id === templateId ? { ...t, flagCount: t.flagCount + 1, isFlaggedByUser: true } : t
        ));
      }
    } catch (err) {
      console.error('Error flagging/unflagging template:', err);
      setError('Failed to update flag status');
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  
  if (templates.length === 0) {
    return <Typography>No milestone templates found for this program type.</Typography>;
  }
  
  return (
    <Box>
      {user && showEducation && (
        <FlagMilestoneEducation 
          initialOpen={true} 
          onClose={() => setShowEducation(false)} 
        />
      )}
      
      <Typography variant="h6" mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <span>Milestone Templates</span>
        {user && (
          <Tooltip title="Help us improve! Flag irrelevant milestones">
            <Badge badgeContent="NEW" color="secondary" sx={{ mr: 2 }}>
              <FlagIcon color="action" fontSize="small" />
            </Badge>
          </Tooltip>
        )}
      </Typography>
      
      <List>
        {templates.map((template) => {
          const isSelected = selectedTemplates.includes(template.id);
          const isFlagged = user ? user.flaggedMilestones.includes(template.id) : false;
          
          return (
            <ListItem
              key={template.id}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 1,
                bgcolor: isSelected ? 'action.selected' : 'background.paper',
              }}
              secondaryAction={
                <>
                  {user && (
                    <Badge
                      badgeContent={<NewReleasesIcon fontSize="small" />}
                      color="secondary"
                      invisible={!showEducation}
                      sx={{ mr: 1 }}
                    >
                      <Tooltip title={isFlagged ? "Unflag this milestone" : "Flag as irrelevant"}>
                        <IconButton
                          edge="end"
                          aria-label={isFlagged ? "unflag milestone" : "flag milestone"}
                          onClick={() => handleFlag(template.id)}
                          color={isFlagged ? "error" : "default"}
                          sx={{
                            animation: isFlagged ? 'none' : `${pulse} 2s infinite ease-in-out`,
                            '&:hover': {
                              animation: 'none'
                            }
                          }}
                        >
                          <FlagIcon />
                        </IconButton>
                      </Tooltip>
                    </Badge>
                  )}
                  {onSelectTemplate && (
                    <Button
                      variant={isSelected ? "outlined" : "contained"}
                      size="small"
                      onClick={() => onSelectTemplate(template)}
                      sx={{ ml: 1 }}
                    >
                      {isSelected ? "Remove" : "Add"}
                    </Button>
                  )}
                </>
              }
            >
              <ListItemText
                primary={template.name}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {template.description || "No description available"}
                    </Typography>
                    <Box sx={{ display: 'flex', mt: 1 }}>
                      <Tooltip title="Number of applications using this milestone">
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <PeopleIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {template.useCount || 0}
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Number of times this milestone has been flagged">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FlagIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {template.flagCount || 0}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default MilestoneTemplateList; 
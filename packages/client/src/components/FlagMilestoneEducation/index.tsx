import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FlagIcon from '@mui/icons-material/Flag';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AutorenewIcon from '@mui/icons-material/Autorenew';

interface FlagMilestoneEducationProps {
  onClose: () => void;
}

const FlagMilestoneEducation: React.FC<FlagMilestoneEducationProps> = ({ onClose }) => {
  return (
    <Fade in={true}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          my: 2, 
          border: '1px solid #e0f7fa', 
          borderRadius: 2,
          position: 'relative',
          background: 'linear-gradient(to right, #e0f7fa, #f5f5f5)'
        }}
      >
        <IconButton 
          onClick={onClose} 
          size="small" 
          sx={{ position: 'absolute', top: 8, right: 8 }}
          aria-label="close education panel"
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InfoIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="primary">
            New Feature: Flag Milestone Templates
          </Typography>
        </Box>

        <Typography variant="body1" paragraph>
          You can now flag milestone templates that may not be relevant to your immigration journey.
          Your input helps us improve the milestone tracking experience for all users.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
          Why flag a milestone?
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="The milestone is not applicable to your specific case" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="The milestone wording is confusing or inaccurate" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="The milestone is redundant with another milestone" />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
          How to flag a milestone:
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, pl: 2 }}>
          <FlagIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Look for the flag icon next to each milestone template
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, pl: 2 }}>
          <Tooltip title="Flag this milestone">
            <FlagIcon color="error" sx={{ mr: 1 }} />
          </Tooltip>
          <Typography variant="body2">
            Click the flag to mark it as not relevant (turns red when flagged)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
          <AutorenewIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Click again to unflag if you change your mind
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LibraryBooksIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Our team reviews all flagged milestones to improve the system
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            onClick={onClose}
          >
            Got it!
          </Button>
        </Box>
      </Paper>
    </Fade>
  );
};

export default FlagMilestoneEducation; 
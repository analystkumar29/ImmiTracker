import React from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  useMediaQuery,
  Tooltip,
  Paper,
  Badge,
  Divider,
  useThemeProps,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import { format } from 'date-fns';

interface Milestone {
  name: string;
  completed: boolean;
  date?: string;
  notes?: string;
  expectedDate?: string;
}

interface MilestoneProgressBarProps {
  milestones: Milestone[];
  progress: number;
  estimatedTimeRemaining?: string;
}

const MilestoneProgressBar: React.FC<MilestoneProgressBarProps> = ({
  milestones,
  progress,
  estimatedTimeRemaining
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Calculate positions for milestone markers
  const calculatePosition = (index: number) => {
    const totalMilestones = milestones.length;
    if (totalMilestones <= 1) return 0;
    return (index / (totalMilestones - 1)) * 100;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // For debugging
  React.useEffect(() => {
    console.log("MilestoneProgressBar received milestones:", milestones);
  }, [milestones]);

  if (milestones.length === 0) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          background: theme.palette.background.paper,
        }}
      >
        <Typography variant="body1" color="text.secondary" align="center">
          No milestone information available for this application.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        background: theme.palette.background.paper,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header with progress percentage and time remaining */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6" fontWeight="bold">
          Application Progress: {Math.round(progress)}%
        </Typography>
        {estimatedTimeRemaining && (
          <Typography 
            variant="body1" 
            color="primary" 
            fontWeight="medium"
            sx={{ 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText',
              px: 2,
              py: 0.5,
              borderRadius: 10
            }}
          >
            {estimatedTimeRemaining}
          </Typography>
        )}
      </Box>
      
      {/* Main progress bar container */}
      <Box sx={{ 
        position: 'relative', 
        height: isMobile ? 180 : 140,  // Increased height for mobile
        mt: 4,
        mb: 2
      }}>
        {/* Background track */}
        <Box sx={{ 
          position: 'absolute',
          top: isMobile ? 40 : 30,
          left: 0,
          right: 0,
          height: 8,
          bgcolor: theme.palette.grey[200],
          borderRadius: 4,
          zIndex: 1
        }} />
        
        {/* Filled progress */}
        <Box sx={{ 
          position: 'absolute',
          top: isMobile ? 40 : 30,
          left: 0,
          width: `${progress}%`,
          height: 8,
          bgcolor: theme.palette.primary.main,
          borderRadius: 4,
          transition: 'width 1s ease-in-out',
          zIndex: 2
        }} />
        
        {/* Milestone markers */}
        {milestones.map((milestone, index) => (
          <Tooltip 
            key={index}
            title={
              <Box>
                <Typography variant="body2" fontWeight="bold">{milestone.name}</Typography>
                {milestone.completed && milestone.date && (
                  <Typography variant="caption" display="block" color="success.light">
                    Completed: {formatDate(milestone.date)}
                  </Typography>
                )}
                {!milestone.completed && milestone.expectedDate && (
                  <Typography variant="caption" display="block" color="info.light">
                    Expected: {formatDate(milestone.expectedDate)}
                  </Typography>
                )}
                {milestone.notes && (
                  <Typography variant="caption" display="block">
                    Notes: {milestone.notes}
                  </Typography>
                )}
              </Box>
            }
            arrow
            placement="top"
          >
            <Box sx={{ 
              position: 'absolute',
              top: isMobile ? 30 : 20,
              left: `${calculatePosition(index)}%`,
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 3,
              cursor: 'pointer'
            }}>
              {/* Milestone icon */}
              {milestone.completed ? (
                <CheckCircleIcon 
                  color="success" 
                  sx={{ 
                    fontSize: 28,
                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
                  }} 
                />
              ) : (
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    milestone.expectedDate ? (
                      <CalendarTodayIcon
                        color="info"
                        sx={{
                          fontSize: 12,
                          background: theme.palette.background.paper,
                          borderRadius: '50%',
                          padding: '1px'
                        }}
                      />
                    ) : null
                  }
                >
                  <RadioButtonUncheckedIcon 
                    color="disabled" 
                    sx={{ 
                      fontSize: 28,
                      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                    }} 
                  />
                </Badge>
              )}
              
              {/* Milestone label */}
              <Typography 
                variant="caption" 
                sx={{ 
                  mt: 1,
                  maxWidth: isMobile ? 70 : 100,
                  textAlign: 'center',
                  fontWeight: milestone.completed ? 'bold' : 'normal',
                  color: milestone.completed ? 'text.primary' : 'text.secondary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transform: isMobile ? 
                    `rotate(${index % 2 === 0 ? -45 : 45}deg) translateY(${index % 2 === 0 ? 10 : 10}px)` : 
                    'none',
                  // Better label visibility
                  padding: '2px 4px',
                  bgcolor: 'background.paper',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: milestone.completed ? 'success.light' : 'grey.300',
                }}
              >
                {milestone.name}
              </Typography>
              
              {/* Date display */}
              <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {milestone.completed && milestone.date && !isMobile && (
                  <Typography 
                    variant="caption" 
                    color="success.main"
                    sx={{ 
                      fontSize: '0.65rem',
                      fontWeight: 'bold', 
                      p: '2px 4px',
                      bgcolor: 'success.light',
                      color: 'success.contrastText',
                      borderRadius: '4px',
                    }}
                  >
                    {formatDate(milestone.date)}
                  </Typography>
                )}
                
                {!milestone.completed && milestone.expectedDate && !isMobile && (
                  <Typography 
                    variant="caption" 
                    color="info.main"
                    sx={{ 
                      fontSize: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      p: '2px 4px',
                      bgcolor: 'info.light',
                      color: 'info.contrastText',
                      borderRadius: '4px',
                    }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 10 }} />
                    {formatDate(milestone.expectedDate)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Tooltip>
        ))}
      </Box>
      
      {/* Legend */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: 1,
        flexWrap: 'wrap',
        gap: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 18, mr: 0.5 }} />
          <Typography variant="caption">Completed</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RadioButtonUncheckedIcon color="disabled" sx={{ fontSize: 18, mr: 0.5 }} />
          <Typography variant="caption">Upcoming</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarTodayIcon color="info" sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption">Expected Date</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon color="primary" sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption">Hover for details</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default MilestoneProgressBar; 
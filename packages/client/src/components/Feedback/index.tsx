import React from 'react';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  CircularProgress, 
  Collapse, 
  IconButton, 
  Paper, 
  Typography 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackProps {
  type?: FeedbackType;
  title?: string;
  message?: string | React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  sx?: Record<string, any>;
}

const Feedback: React.FC<FeedbackProps> = ({
  type = 'info',
  title,
  message,
  isLoading = false,
  loadingMessage = 'Loading...',
  showIcon = true,
  dismissible = false,
  onDismiss,
  className,
  sx = {}
}) => {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  // If there's no message and not loading, don't render anything
  if (!message && !isLoading) {
    return null;
  }

  // Render loading state
  if (isLoading) {
    return (
      <Paper 
        elevation={0} 
        className={className}
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: 'background.default',
          ...sx 
        }}
      >
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography variant="body1">{loadingMessage}</Typography>
      </Paper>
    );
  }

  // Get the appropriate icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Collapse in={open}>
      <Alert
        severity={type}
        className={className}
        icon={showIcon ? getIcon() : false}
        action={
          dismissible ? (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          ) : undefined
        }
        sx={{
          mb: 2,
          ...sx
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {typeof message === 'string' ? (
          <Typography variant="body2">{message}</Typography>
        ) : (
          message
        )}
      </Alert>
    </Collapse>
  );
};

// Loading component for convenience
export const Loading: React.FC<{ message?: string; size?: number | string }> = ({ 
  message = 'Loading...', 
  size = 40 
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
    <CircularProgress size={size} />
    {message && (
      <Typography variant="body1" sx={{ mt: 2 }}>
        {message}
      </Typography>
    )}
  </Box>
);

export default Feedback; 
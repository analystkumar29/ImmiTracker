import { Theme } from '@mui/material';

/**
 * Returns responsive styling for timelines that should be vertical on mobile and horizontal on desktop
 * 
 * @param theme MUI theme object
 * @param isMobile Boolean indicating if the current viewport is mobile size
 * @returns Object with styling for responsive timelines
 */
export const getResponsiveTimelineStyles = (theme: Theme, isMobile: boolean) => {
  return {
    [theme.breakpoints.down('sm')]: {
      // Vertical timeline styling for mobile
      '.MuiTimelineItem-root': {
        minHeight: 70,
        position: 'relative',
      },
      '.MuiTimelineContent-root': {
        padding: '0 16px 16px 16px',
      },
      '.MuiTimelineOppositeContent-root': {
        display: 'none',
        flex: 0.2,
      },
      '.MuiTimelineSeparator-root': {
        position: 'relative',
        marginLeft: '8px',
      },
      '.MuiTimelineDot-root': {
        margin: '0 8px',
        boxShadow: theme.shadows[2],
      },
      '.MuiTimelineConnector-root': {
        width: '2px',
      },
    },
    [theme.breakpoints.up('md')]: {
      // Horizontal timeline styling for desktop
      display: isMobile ? 'block' : 'flex',
      flexDirection: 'row',
      overflowX: isMobile ? 'visible' : 'auto',
      padding: isMobile ? theme.spacing(0) : theme.spacing(2, 0),
      '.MuiTimelineItem-root': {
        minWidth: isMobile ? 'auto' : 250,
        width: isMobile ? '100%' : 'auto',
        flexDirection: isMobile ? 'column' : 'row',
      },
      '.MuiTimelineSeparator-root': {
        minHeight: isMobile ? 'auto' : '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
      },
      '.MuiTimelineConnector-root': {
        minHeight: isMobile ? 20 : 0,
        height: isMobile ? 'auto' : 4,
        width: isMobile ? 2 : '100%',
      },
      '.MuiTimelineDot-root': {
        margin: isMobile ? '8px 0' : '0 8px',
      },
    }
  };
};

/**
 * Returns responsive styling for timeline connectors
 * 
 * @param theme MUI theme object
 * @param isMobile Boolean indicating if the current viewport is mobile size
 * @param color Optional color for the connector
 * @returns Object with styling for responsive timeline connectors
 */
export const getResponsiveConnectorStyles = (theme: Theme, isMobile: boolean, color?: string) => {
  return {
    ...(color && { bgcolor: color }),
    [theme.breakpoints.down('sm')]: {
      width: '2px',
      minHeight: '24px',
    },
    [theme.breakpoints.up('md')]: {
      width: isMobile ? 2 : '100%',
      height: isMobile ? 'auto' : 4,
      minWidth: isMobile ? 'auto' : '24px',
    }
  };
}; 
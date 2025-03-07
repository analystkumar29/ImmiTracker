import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SignalWifiStatusbar4BarIcon from '@mui/icons-material/SignalWifiStatusbar4Bar';

interface NetworkStatusMonitorProps {
  offlineMessage?: string;
  onlineMessage?: string;
  showOnlineStatus?: boolean;
  autoHideDuration?: number;
}

const NetworkStatusMonitor: React.FC<NetworkStatusMonitorProps> = ({
  offlineMessage = 'You are currently offline. Some features may be unavailable.',
  onlineMessage = 'Your connection has been restored.',
  showOnlineStatus = true,
  autoHideDuration = 6000,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState<boolean>(false);
  const [showOnlineMessage, setShowOnlineMessage] = useState<boolean>(false);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    // Function to handle online status change
    const handleOnline = () => {
      setIsOnline(true);
      // Only show the online message if the user was previously offline
      if (wasOffline && showOnlineStatus) {
        setShowOnlineMessage(true);
      }
      setWasOffline(false);
    };

    // Function to handle offline status change
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      setWasOffline(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
      setWasOffline(true);
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, showOnlineStatus]);

  // Handle closing the offline message
  const handleCloseOfflineMessage = () => {
    setShowOfflineMessage(false);
  };

  // Handle closing the online message
  const handleCloseOnlineMessage = () => {
    setShowOnlineMessage(false);
  };

  return (
    <>
      {/* Offline message */}
      <Snackbar
        open={showOfflineMessage && !isOnline}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 90, sm: 16 } }} // Adjust for mobile navigation
      >
        <Alert
          severity="warning"
          icon={<WifiOffIcon />}
          onClose={handleCloseOfflineMessage}
          sx={{
            width: '100%',
            boxShadow: 3,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            },
          }}
        >
          <AlertTitle>Offline</AlertTitle>
          {offlineMessage}
        </Alert>
      </Snackbar>

      {/* Online message */}
      <Snackbar
        open={showOnlineMessage && isOnline}
        autoHideDuration={autoHideDuration}
        onClose={handleCloseOnlineMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 90, sm: 16 } }} // Adjust for mobile navigation
      >
        <Alert
          severity="success"
          icon={<SignalWifiStatusbar4BarIcon />}
          onClose={handleCloseOnlineMessage}
          sx={{
            width: '100%',
            boxShadow: 3,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            },
          }}
        >
          <AlertTitle>Connected</AlertTitle>
          {onlineMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NetworkStatusMonitor; 
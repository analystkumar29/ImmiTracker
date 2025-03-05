import React from 'react';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';

interface MobileNavigationProps {
  title: string;
  titleVariant?: 'h4' | 'h5' | 'h6';
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  title,
  titleVariant = 'h5',
}) => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        width: '100%',
        mb: 2,
        position: 'relative',
      }}
    >
      <Typography 
        variant={titleVariant} 
        component="h1" 
        sx={{ 
          flexGrow: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

export default MobileNavigation; 
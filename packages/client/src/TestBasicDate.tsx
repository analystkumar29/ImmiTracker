import React, { useState } from 'react';
import { Box, Typography, Button, Container, Paper, TextField } from '@mui/material';

// Test component with HTML date input instead of MUI DatePicker
const TestBasicDate = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Basic Date Input Test
        </Typography>
        
        <Box sx={{ my: 2 }}>
          <TextField
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => alert('Selected date: ' + selectedDate)}
          >
            Show Selected Date
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TestBasicDate; 
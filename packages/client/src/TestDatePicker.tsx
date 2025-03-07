import React, { useState } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Test component with just a date picker
const TestDatePicker = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Date Picker Test
        </Typography>
        
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Test Date"
            value={selectedDate}
            onChange={(newValue) => {
              setSelectedDate(newValue);
            }}
          />
        </LocalizationProvider>
        
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => alert('Selected date: ' + selectedDate?.toLocaleDateString())}
          >
            Show Selected Date
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TestDatePicker; 
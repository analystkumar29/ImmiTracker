import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { vi } from 'vitest';
import { theme } from '../../../theme';
import MilestoneProgressBar from '../index';

describe('MilestoneProgressBar Component', () => {
  const mockMilestones = [
    {
      name: 'Application Submitted',
      completed: true,
      date: '2023-01-01',
      notes: 'Application submitted online',
    },
    {
      name: 'Biometrics Requested',
      completed: true,
      date: '2023-01-15',
      notes: 'Received email requesting biometrics',
    },
    {
      name: 'Biometrics Completed',
      completed: false,
      expectedDate: '2023-02-01',
    },
    {
      name: 'Medical Exam Required',
      completed: false,
      expectedDate: '2023-03-01',
    },
    {
      name: 'Decision Made',
      completed: false,
      expectedDate: '2023-04-01',
    },
  ];

  const renderMilestoneProgressBar = (
    milestones = mockMilestones,
    progress = 40,
    estimatedTimeRemaining = '~3 months remaining'
  ) => {
    return render(
      <ThemeProvider theme={theme}>
        <MilestoneProgressBar
          milestones={milestones}
          progress={progress}
          estimatedTimeRemaining={estimatedTimeRemaining}
        />
      </ThemeProvider>
    );
  };

  test('renders progress bar with correct progress percentage', () => {
    renderMilestoneProgressBar();
    
    // Check if the progress percentage is displayed
    expect(screen.getByText(/Application Progress: 40%/i)).toBeInTheDocument();
  });

  test('renders estimated time remaining', () => {
    renderMilestoneProgressBar();
    
    // Check if the estimated time remaining is displayed
    expect(screen.getByText(/~3 months remaining/i)).toBeInTheDocument();
  });

  test('renders all milestones', () => {
    renderMilestoneProgressBar();
    
    // Check if all milestone names are displayed
    mockMilestones.forEach(milestone => {
      expect(screen.getByText(milestone.name)).toBeInTheDocument();
    });
  });

  test('displays message when no milestones are available', () => {
    renderMilestoneProgressBar([]);
    
    // Check if the no milestones message is displayed
    expect(screen.getByText(/No milestone information available for this application/i)).toBeInTheDocument();
  });
}); 
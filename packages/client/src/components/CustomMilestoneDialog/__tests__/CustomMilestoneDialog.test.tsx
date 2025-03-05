import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomMilestoneDialog from '../index';

describe('CustomMilestoneDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnAddMilestone = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders correctly when open', () => {
    render(
      <CustomMilestoneDialog
        open={true}
        onClose={mockOnClose}
        onAddMilestone={mockOnAddMilestone}
        applicationType="Work Permit"
      />
    );
    
    expect(screen.getByText('Add Custom Milestone')).toBeInTheDocument();
    expect(screen.getByText('Add a custom milestone for this Work Permit application.')).toBeInTheDocument();
    expect(screen.getByLabelText('Milestone Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Milestone' })).toBeInTheDocument();
  });
  
  test('does not render when closed', () => {
    render(
      <CustomMilestoneDialog
        open={false}
        onClose={mockOnClose}
        onAddMilestone={mockOnAddMilestone}
        applicationType="Work Permit"
      />
    );
    
    expect(screen.queryByText('Add Custom Milestone')).not.toBeInTheDocument();
  });
  
  test('calls onClose when cancel button is clicked', () => {
    render(
      <CustomMilestoneDialog
        open={true}
        onClose={mockOnClose}
        onAddMilestone={mockOnAddMilestone}
        applicationType="Work Permit"
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  test('calls onAddMilestone with the milestone name when Add Milestone button is clicked', async () => {
    render(
      <CustomMilestoneDialog
        open={true}
        onClose={mockOnClose}
        onAddMilestone={mockOnAddMilestone}
        applicationType="Work Permit"
      />
    );
    
    fireEvent.change(screen.getByLabelText('Milestone Name'), { target: { value: 'Test Milestone' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Milestone' }));
    
    await waitFor(() => {
      expect(mockOnAddMilestone).toHaveBeenCalledWith('Test Milestone');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
  
  test('displays an error message when trying to add an empty milestone', async () => {
    render(
      <CustomMilestoneDialog
        open={true}
        onClose={mockOnClose}
        onAddMilestone={mockOnAddMilestone}
        applicationType="Work Permit"
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Milestone' }));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a milestone name')).toBeInTheDocument();
      expect(mockOnAddMilestone).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
  
  test('loads suggestions when opened', async () => {
    render(
      <CustomMilestoneDialog
        open={true}
        onClose={mockOnClose}
        onAddMilestone={mockOnAddMilestone}
        applicationType="Work Permit"
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Common milestones:')).toBeInTheDocument();
      expect(screen.getByText('Application Acknowledged')).toBeInTheDocument();
    });
  });
}); 
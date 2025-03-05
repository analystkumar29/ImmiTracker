import { MilestoneService } from '../services/milestone.service';

const milestoneService = new MilestoneService();

/**
 * Scheduled task to check for and promote popular custom milestones
 * This function should be called periodically (e.g., once per day)
 */
export const checkAndPromotePopularMilestones = async () => {
  try {
    console.log('Running scheduled task: Check and promote popular milestones');
    
    // Get popular milestones above the threshold
    const popularMilestones = await milestoneService.getPopularCustomMilestones();
    
    if (popularMilestones.length === 0) {
      console.log('No popular milestones found to promote');
      return;
    }
    
    console.log(`Found ${popularMilestones.length} popular milestones to promote`);
    
    // Promote popular milestones
    const results = await milestoneService.promotePopularMilestones();
    
    console.log('Milestone promotion results:', results);
    return results;
  } catch (error) {
    console.error('Error in scheduled task to promote milestones:', error);
    throw error;
  }
};

/**
 * Scheduled task to check for duplicate milestones
 * This function should be called periodically (e.g., once per week)
 */
export const checkForDuplicateMilestones = async () => {
  try {
    console.log('Running scheduled task: Check for duplicate milestones');
    
    // Get duplicate milestones
    const duplicates = await milestoneService.checkForDuplicateMilestones();
    
    if (duplicates.length === 0) {
      console.log('No duplicate milestones found');
      return;
    }
    
    console.log(`Found ${duplicates.length} duplicate milestones`);
    
    // Log the duplicates
    duplicates.forEach((dup, index) => {
      console.log(`Duplicate ${index + 1}:`);
      console.log(`  Original: ${dup.original.name} (${dup.original.programType})`);
      console.log(`  Duplicate: ${dup.duplicate.name} (${dup.duplicate.programType})`);
    });
    
    return duplicates;
  } catch (error) {
    console.error('Error in scheduled task to check for duplicate milestones:', error);
    throw error;
  }
};

// List of all scheduled tasks
export const scheduledTasks = {
  checkAndPromotePopularMilestones,
  checkForDuplicateMilestones
}; 
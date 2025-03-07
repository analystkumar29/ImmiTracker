import { MilestoneService } from '../services/milestone.service';
import { ApplicationTypeService } from '../services/applicationType.service';

const milestoneService = new MilestoneService();
const applicationTypeService = new ApplicationTypeService();

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

/**
 * Scheduled task to process highly flagged milestones
 * This function should be called periodically (e.g., once per day)
 */
export const processHighlyFlaggedMilestones = async () => {
  try {
    console.log('Running scheduled task: Process highly flagged milestones');
    
    const results = await milestoneService.processHighlyFlaggedMilestones();
    
    if (results.length === 0) {
      console.log('No highly flagged milestones to process');
      return;
    }
    
    console.log(`Processed ${results.length} highly flagged milestones`);
    console.log('Flagged milestone processing results:', results);
    
    return results;
  } catch (error) {
    console.error('Error in scheduled task to process flagged milestones:', error);
    throw error;
  }
};

/**
 * Scheduled task to promote popular application types
 * This function should be called periodically (e.g., once per day)
 */
export const promotePopularApplicationTypes = async () => {
  try {
    console.log('Running scheduled task: Promote popular application types');
    
    const results = await applicationTypeService.promotePopularApplicationTypes();
    
    if (results.length === 0) {
      console.log('No popular application types to promote');
      return;
    }
    
    console.log(`Promoted ${results.length} popular application types`);
    console.log('Application type promotion results:', results);
    
    return results;
  } catch (error) {
    console.error('Error in scheduled task to promote application types:', error);
    throw error;
  }
};

/**
 * Scheduled task to process highly flagged application types
 * This function should be called periodically (e.g., once per day)
 */
export const processHighlyFlaggedApplicationTypes = async () => {
  try {
    console.log('Running scheduled task: Process highly flagged application types');
    
    const results = await applicationTypeService.processHighlyFlaggedApplicationTypes();
    
    if (results.length === 0) {
      console.log('No highly flagged application types to process');
      return;
    }
    
    console.log(`Processed ${results.length} highly flagged application types`);
    console.log('Flagged application type processing results:', results);
    
    return results;
  } catch (error) {
    console.error('Error in scheduled task to process flagged application types:', error);
    throw error;
  }
};

// List of all scheduled tasks
export const scheduledTasks = {
  checkAndPromotePopularMilestones,
  checkForDuplicateMilestones,
  processHighlyFlaggedMilestones,
  promotePopularApplicationTypes,
  processHighlyFlaggedApplicationTypes
}; 
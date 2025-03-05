/**
 * Utility functions for milestone data handling
 */
import { format } from 'date-fns';

interface Milestone {
  name: string;
  completed: boolean;
  date?: string;
  notes?: string;
  expectedDate?: string;
}

interface StatusUpdate {
  id: string;
  statusName: string;
  statusDate: string;
  notes?: string;
}

/**
 * Get default milestones for an application type
 * This serves as a fallback when specific subtype milestones aren't available
 * 
 * @param applicationType The application type (e.g., "Temporary Residence")
 * @returns Array of default milestone names
 */
export const getDefaultMilestones = (applicationType: string): string[] => {
  // Basic milestone set for all application types
  const basicMilestones = [
    "Application Submitted",
    "Application Acknowledged", 
    "Biometrics Completed",
    "Medical Exam Completed",
    "Decision Made"
  ];

  // Add more specific milestones based on application type
  switch (applicationType) {
    case "Temporary Residence":
      return [
        ...basicMilestones,
        "Visa Issued"
      ];
    
    case "Economic Immigration":
      return [
        "Profile Created",
        "Invitation to Apply",
        ...basicMilestones,
        "COPR Issued",
        "Landing in Canada"
      ];
    
    case "Family Sponsorship":
      return [
        "Sponsorship Application Submitted",
        "Sponsorship Approved",
        ...basicMilestones,
        "COPR Issued",
        "Landing in Canada"
      ];
    
    default:
      return basicMilestones;
  }
};

/**
 * Create milestone objects from a list of milestone names
 * 
 * @param milestoneNames Array of milestone names
 * @param completedMilestones Set of completed milestone names
 * @param statusHistory Array of status updates
 * @param expectedDates Map of milestone names to expected dates
 * @returns Array of Milestone objects
 */
export const createMilestoneObjects = (
  milestoneNames: string[],
  completedMilestones: Set<string>,
  statusHistory: StatusUpdate[] = [],
  expectedDates: Record<string, string> = {}
): Milestone[] => {
  return milestoneNames.map(name => {
    const completed = completedMilestones.has(name);
    const statusUpdate = statusHistory.find(status => status.statusName === name);
    
    return {
      name,
      completed,
      date: statusUpdate?.statusDate,
      notes: statusUpdate?.notes,
      expectedDate: !completed ? expectedDates[name] : undefined
    };
  });
};

/**
 * Calculate expected dates for milestones based on submission date and processing time
 * 
 * @param submissionDate The application submission date
 * @param processingTimeMonths Total estimated processing time in months
 * @param milestones Array of milestone names
 * @param completedMilestones Set of completed milestone names
 * @returns Map of milestone names to expected dates
 */
export const calculateExpectedDates = (
  submissionDate: string,
  processingTimeMonths: number,
  milestones: string[],
  completedMilestones: Set<string>
): Record<string, string> => {
  const expectedDates: Record<string, string> = {};
  
  // Get incomplete milestones
  const incompleteMilestones = milestones.filter(name => !completedMilestones.has(name));
  
  if (incompleteMilestones.length === 0) {
    return expectedDates;
  }
  
  // Parse the submission date
  const submissionDateObj = new Date(submissionDate);
  
  // Calculate time interval between milestones (in days)
  const totalProcessingDays = processingTimeMonths * 30; // Approximate
  const daysPerMilestone = totalProcessingDays / (incompleteMilestones.length + 1);
  
  // Calculate expected date for each incomplete milestone
  incompleteMilestones.forEach((milestoneName, index) => {
    const daysToAdd = daysPerMilestone * (index + 1);
    const expectedDate = new Date(submissionDateObj);
    expectedDate.setDate(expectedDate.getDate() + daysToAdd);
    
    // Format date as YYYY-MM-DD
    expectedDates[milestoneName] = format(expectedDate, 'yyyy-MM-dd');
  });
  
  return expectedDates;
};

/**
 * Merge custom milestones with default milestones, maintaining order
 * 
 * @param defaultMilestones Array of default milestone names
 * @param customMilestones Array of custom milestone names
 * @returns Merged array of milestone names
 */
export const mergeMilestones = (
  defaultMilestones: string[],
  customMilestones: string[] = []
): string[] => {
  // Create a set of default milestones for quick lookup
  const defaultSet = new Set(defaultMilestones);
  
  // Filter out custom milestones that already exist in defaults
  const uniqueCustomMilestones = customMilestones.filter(name => !defaultSet.has(name));
  
  // Merge arrays, putting custom milestones at the end
  return [...defaultMilestones, ...uniqueCustomMilestones];
};

/**
 * Get milestones for an application, handling cases with or without program data
 * 
 * @param application The application object
 * @param program The program object (optional)
 * @returns Array of milestone names
 */
export const getMilestonesForApplication = (application: any, program?: any): string[] => {
  if (program && program.milestoneUpdates && program.milestoneUpdates.length > 0) {
    // Use program-specific milestones if available
    return program.milestoneUpdates;
  }
  
  // Fallback to default milestones based on application type
  return getDefaultMilestones(application.type);
}; 
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
  isCustom?: boolean;
  category?: string;
  normalizedName?: string;
}

interface StatusUpdate {
  id: string;
  statusName: string;
  statusDate: string;
  notes?: string;
  milestoneId?: string;
}

// Milestone categories
export const MILESTONE_CATEGORIES = {
  APPLICATION: 'application',
  BIOMETRICS: 'biometrics',
  MEDICAL: 'medical',
  DOCUMENT: 'document',
  DECISION: 'decision',
  BACKGROUND_CHECK: 'background_check',
  OTHER: 'other'
};

/**
 * Normalizes a milestone name by removing program type references and standardizing terminology
 * @param name The original milestone name
 * @returns Normalized milestone name
 */
export const normalizeMilestoneName = (name: string): string => {
  // Remove program type in parentheses
  const baseName = name.replace(/\s*\([^)]*\)\s*/g, '').trim();
  
  // Standardize common variations
  return baseName
    .toLowerCase()
    .replace(/completion|completed|complete/g, 'completed')
    .replace(/required|requested|requirement/g, 'required')
    .replace(/submission|submitted|submit/g, 'submitted')
    .replace(/instruction|instructions/g, 'instruction')
    .replace(/received|receipt/g, 'received')
    .replace(/passed|passing/g, 'passed')
    .replace(/assessment|assessed|assessing/g, 'assessment')
    .replace(/\s+/g, '_'); // Replace spaces with underscores
};

/**
 * Determines if two milestone names are semantically similar
 * @param name1 First milestone name
 * @param name2 Second milestone name
 * @returns Boolean indicating if the names are similar
 */
export const areSimilarMilestoneNames = (name1: string, name2: string): boolean => {
  return normalizeMilestoneName(name1) === normalizeMilestoneName(name2);
};

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
 * Get completed milestone names from status history
 * 
 * @param statusHistory Array of status updates
 * @returns Set of completed milestone names
 */
export const getCompletedMilestones = (statusHistory: StatusUpdate[]): Set<string> => {
  return new Set(statusHistory.map(status => status.statusName));
};

/**
 * Calculate expected dates for milestones based on submission date and processing time
 * 
 * @param submissionDate Date of application submission
 * @param processingTime Processing time as a string (e.g., "6 months", "4 weeks")
 * @param milestones List of milestone names
 * @returns Object mapping milestone names to expected dates
 */
export const calculateExpectedDates = (
  submissionDate: string | Date,
  processingTime?: string,
  milestones: string[] = []
): Record<string, string> => {
  if (!processingTime || !submissionDate || milestones.length === 0) {
    return {};
  }
  
  // Parse the processing time
  const match = processingTime.match(/(\d+)[\s-]*(\w+)/);
  if (!match) return {};
  
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  // Convert to days
  let totalDays = 0;
  if (unit.includes('day')) {
    totalDays = amount;
  } else if (unit.includes('week')) {
    totalDays = amount * 7;
  } else if (unit.includes('month')) {
    totalDays = amount * 30;
  } else if (unit.includes('year')) {
    totalDays = amount * 365;
  }
  
  if (totalDays === 0) return {};
  
  // Calculate expected dates
  const submissionDateTime = new Date(submissionDate).getTime();
  const expectedDates: Record<string, string> = {};
  
  milestones.forEach((milestone, index) => {
    // Skip first milestone (usually submission)
    if (index === 0) return;
    
    // Calculate days based on position in the milestone list
    const milestoneDays = Math.floor(totalDays * (index / milestones.length));
    const expectedDate = new Date(submissionDateTime + milestoneDays * 24 * 60 * 60 * 1000);
    
    expectedDates[milestone] = format(expectedDate, 'yyyy-MM-dd');
  });
  
  return expectedDates;
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
      expectedDate: !completed ? expectedDates[name] : undefined,
      isCustom: statusUpdate?.milestoneId ? true : false
    };
  });
};

/**
 * Get milestones specific to an application
 * 
 * @param application Application object
 * @param programs List of programs
 * @returns Array of milestone names for the application
 */
export const getMilestonesForApplication = (application: any, programs: any[]): string[] => {
  if (!application || !programs || !programs.length) {
    return [];
  }
  
  // Find the program based on application type
  const program = programs.find(p => p.id === application.type);
  
  if (!program) {
    console.warn(`Program not found for application type: ${application.type}`);
    return [];
  }
  
  // Get default milestones from the program
  const defaultMilestones = program.milestoneUpdates || [];
  
  // Get custom milestones from status history
  const customMilestones = application.statusHistory
    ? application.statusHistory
        .filter((status: any) => status.milestoneId && !defaultMilestones.includes(status.statusName))
        .map((status: any) => status.statusName)
    : [];
  
  // Merge and return unique milestones
  return mergeMilestones(defaultMilestones, customMilestones);
};

/**
 * Merge custom milestones with default milestones, maintaining order and removing duplicates
 * 
 * @param defaultMilestones Array of default milestone names
 * @param customMilestones Array of custom milestone names
 * @returns Merged array of milestone names
 */
export const mergeMilestones = (
  defaultMilestones: string[],
  customMilestones: string[] = []
): string[] => {
  // Create a set of normalized default milestones for quick lookup
  const normalizedDefaultSet = new Set(defaultMilestones.map(normalizeMilestoneName));
  
  // Filter out custom milestones that are similar to defaults
  const uniqueCustomMilestones = customMilestones.filter(
    name => !defaultMilestones.some(defaultName => 
      areSimilarMilestoneNames(name, defaultName)
    )
  );
  
  // Merge arrays, putting custom milestones at the end
  return [...defaultMilestones, ...uniqueCustomMilestones];
}; 
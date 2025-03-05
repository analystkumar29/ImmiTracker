/**
 * Utility functions to map application types/subtypes to program IDs
 */

/**
 * Maps an application type and subtype to a program ID in the immigrationPrograms data
 * @param type The application type (e.g., "Temporary Residence")
 * @param subType The application subtype (e.g., "Study Permit (from inside Canada)")
 * @returns The program ID or undefined if no mapping found
 */
export const mapToImmigrationProgramId = (type: string, subType: string): string | undefined => {
  // Extract the base program from the subtype
  const baseProgram = extractBaseProgramName(subType);
  
  // Map the type and base program to a program ID
  if (type === 'Temporary Residence') {
    switch (baseProgram) {
      case 'Visitor Visa':
      case 'Visitor Extension':
      case 'Super Visa':
        return 'visitor_visa';
      case 'Study Permit':
        return 'study_permit';
      case 'Work Permit':
      case 'SAWP':
      case 'IEC':
        return 'work_permit';
      default:
        return undefined;
    }
  } else if (type === 'Economic Immigration') {
    if (baseProgram.includes('Express Entry') || 
        baseProgram.includes('Skilled Workers') || 
        baseProgram.includes('Canadian Experience') || 
        baseProgram.includes('Skilled Trades')) {
      return 'express_entry';
    } else if (baseProgram.includes('Provincial') || baseProgram.includes('PNP')) {
      return 'pnp';
    }
  } else if (type === 'Family Sponsorship') {
    return 'family_sponsorship';
  }
  
  return undefined;
};

/**
 * Extracts the base program name from a subtype string
 * @param subType The application subtype (e.g., "Study Permit (from inside Canada)")
 * @returns The base program name (e.g., "Study Permit")
 */
export const extractBaseProgramName = (subType: string): string => {
  // Extract the base program name before any parentheses or hyphens
  const baseMatch = subType.match(/^([^(-]+)/);
  return baseMatch ? baseMatch[1].trim() : subType;
}; 
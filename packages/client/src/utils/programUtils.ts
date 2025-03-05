/**
 * Utility functions for program data handling
 */

/**
 * Find the program matching an application by type (and optionally subtype)
 * @param programs Array of available immigration programs
 * @param applicationType The application type (e.g., "Temporary Residence")
 * @param applicationSubtype Optional application subtype (e.g., "Study Permit (from inside Canada)")
 * @returns The matching program or undefined if not found
 */
export const findProgramForApplication = (programs: any[], applicationType: string, applicationSubtype?: string) => {
  if (!programs || programs.length === 0) {
    return undefined;
  }
  
  console.log("Finding program for:", applicationType, applicationSubtype);
  
  // First try: exact match on programName and type
  let program = programs.find(p => 
    p.programName === applicationType ||
    (applicationSubtype && p.programName === applicationSubtype)
  );
  
  if (program) {
    console.log("Found exact match on programName:", program.programName);
    return program;
  }
  
  // Second try: check if the application type matches a program category
  // and the subtype contains a program name
  if (applicationSubtype) {
    // Extract base program name from subtype (before any parentheses)
    const baseProgramName = applicationSubtype.split('(')[0].trim();
    
    program = programs.find(p => 
      p.category === applicationType && 
      (p.programName.includes(baseProgramName) || baseProgramName.includes(p.programName))
    );
    
    if (program) {
      console.log("Found match by category and subtype:", program.programName);
      return program;
    }
  }
  
  // Third try: check if any program name is a substring of the application type or subtype
  program = programs.find(p => 
    applicationType.includes(p.programName) || 
    (applicationSubtype && applicationSubtype.includes(p.programName))
  );
  
  if (program) {
    console.log("Found match by substring:", program.programName);
    return program;
  }
  
  // Final attempt: use available programs with the same category
  const sameCategory = programs.filter(p => p.category === applicationType);
  if (sameCategory.length > 0) {
    // Return the first one as a fallback
    console.log("Using fallback from same category:", sameCategory[0].programName);
    return sameCategory[0];
  }
  
  console.log("No matching program found");
  return undefined;
}; 
import { prisma } from '../index';

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
 * Extracts the program type from a milestone name if present
 * @param name Milestone name
 * @returns Program type or undefined if not found
 */
export const extractProgramType = (name: string): string | undefined => {
  const match = name.match(/\(([^)]+)\)/);
  return match ? match[1] : undefined;
};

/**
 * Finds all duplicate milestones in the database
 * @returns Array of duplicate milestone groups
 */
export const findDuplicateMilestones = async () => {
  // Get all milestone templates
  const allMilestones = await prisma.milestoneTemplate.findMany();
  
  // Group by normalized name
  const groupedByNormalizedName: Record<string, typeof allMilestones> = {};
  
  allMilestones.forEach(milestone => {
    const normalizedName = normalizeMilestoneName(milestone.name);
    if (!groupedByNormalizedName[normalizedName]) {
      groupedByNormalizedName[normalizedName] = [];
    }
    groupedByNormalizedName[normalizedName].push(milestone);
  });
  
  // Filter to only groups with more than one milestone
  const duplicateGroups = Object.entries(groupedByNormalizedName)
    .filter(([_, milestones]) => milestones.length > 1)
    .map(([normalizedName, milestones]) => ({
      normalizedName,
      milestones
    }));
  
  return duplicateGroups;
};

/**
 * Creates a canonical milestone template for a group of duplicates
 * @param normalizedName The normalized name
 * @param duplicates Array of duplicate milestones
 * @returns The created canonical milestone
 */
export const createCanonicalMilestone = async (
  normalizedName: string,
  duplicates: any[]
) => {
  // Choose the most common display name or the first one
  const nameFrequency: Record<string, number> = {};
  duplicates.forEach(dup => {
    nameFrequency[dup.name] = (nameFrequency[dup.name] || 0) + 1;
  });
  
  const mostCommonName = Object.entries(nameFrequency)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  // Create a canonical milestone template
  const canonical = await prisma.milestoneTemplate.create({
    data: {
      name: mostCommonName,
      normalizedName,
      description: duplicates[0].description || `Standardized milestone for ${normalizedName}`,
      isApproved: true,
      useCount: duplicates.reduce((sum, dup) => sum + (dup.useCount || 0), 0),
      // Combine program types from all duplicates
      programType: [...new Set(duplicates.map(d => d.programType))].join(','),
      programSubType: [...new Set(duplicates.map(d => d.programSubType).filter(Boolean))].join(',')
    }
  });
  
  return canonical;
};

/**
 * Merges duplicate milestones into canonical versions
 * @returns Summary of merge operations
 */
export const mergeDuplicateMilestones = async () => {
  const duplicateGroups = await findDuplicateMilestones();
  const results = [];
  
  for (const group of duplicateGroups) {
    // Create a canonical milestone for this group
    const canonical = await createCanonicalMilestone(
      group.normalizedName,
      group.milestones
    );
    
    // Update all status history entries to point to the canonical milestone
    for (const duplicate of group.milestones) {
      if (duplicate.id !== canonical.id) {
        // Update status history references
        await prisma.statusHistory.updateMany({
          where: { milestoneId: duplicate.id },
          data: { milestoneId: canonical.id }
        });
        
        // Optionally, mark the duplicate as deprecated or delete it
        await prisma.milestoneTemplate.update({
          where: { id: duplicate.id },
          data: { 
            isDeprecated: true,
            canonicalId: canonical.id
          }
        });
      }
    }
    
    results.push({
      normalizedName: group.normalizedName,
      canonicalId: canonical.id,
      mergedCount: group.milestones.length - 1
    });
  }
  
  return results;
}; 
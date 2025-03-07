import { PrismaClient } from '@prisma/client';
import { normalizeString } from '../utils/stringUtils';
import { 
  normalizeMilestoneName, 
  areSimilarMilestoneNames, 
  findDuplicateMilestones,
  mergeDuplicateMilestones
} from '../utils/milestoneNormalizer';

const prisma = new PrismaClient();

// Threshold for auto-approving milestone templates
const MILESTONE_APPROVAL_THRESHOLD = 3;
const FLAG_THRESHOLD = 3;  // New constant for flagging threshold

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
 * Service for handling milestone operations
 */
export class MilestoneService {
  /**
   * Get all milestones for a specific program type and subtype
   */
  async getMilestones(programType: string, programSubType?: string) {
    const milestones = await prisma.milestone.findMany({
      where: {
        programType,
        ...(programSubType ? { programSubType } : {}),
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    return milestones;
  }

  /**
   * Get milestone templates for a specific program type and subtype
   */
  async getMilestoneTemplates(programType: string, programSubType?: string, includeUnapproved = false) {
    const templates = await prisma.milestoneTemplate.findMany({
      where: {
        programType,
        ...(programSubType ? { programSubType } : {}),
        ...(includeUnapproved ? {} : { isApproved: true }),
      },
      orderBy: {
        useCount: 'desc',
      },
    });
    
    return templates;
  }

  /**
   * Categorize a milestone based on its name
   * @param milestoneName The milestone name to categorize
   * @returns The category of the milestone
   */
  categorizeMilestone(milestoneName: string): string {
    const normalizedName = normalizeMilestoneName(milestoneName);
    
    if (normalizedName.includes('application') || normalizedName.includes('submit') || 
        normalizedName.includes('aor') || normalizedName.includes('ita')) {
      return MILESTONE_CATEGORIES.APPLICATION;
    }
    
    if (normalizedName.includes('biometric')) {
      return MILESTONE_CATEGORIES.BIOMETRICS;
    }
    
    if (normalizedName.includes('medical') || normalizedName.includes('exam')) {
      return MILESTONE_CATEGORIES.MEDICAL;
    }
    
    if (normalizedName.includes('document')) {
      return MILESTONE_CATEGORIES.DOCUMENT;
    }
    
    if (normalizedName.includes('decision') || normalizedName.includes('approved') || 
        normalizedName.includes('rejected') || normalizedName.includes('copr')) {
      return MILESTONE_CATEGORIES.DECISION;
    }
    
    if (normalizedName.includes('background') || normalizedName.includes('check')) {
      return MILESTONE_CATEGORIES.BACKGROUND_CHECK;
    }
    
    return MILESTONE_CATEGORIES.OTHER;
  }

  /**
   * Find and handle duplicate milestones
   * @returns Summary of duplicate milestone handling
   */
  async handleDuplicateMilestones() {
    const duplicateGroups = await findDuplicateMilestones();
    console.log(`Found ${duplicateGroups.length} duplicate milestone groups`);
    
    // Log details of duplicates
    duplicateGroups.forEach((group, index) => {
      console.log(`Duplicate group ${index + 1}: ${group.normalizedName}`);
      group.milestones.forEach(milestone => {
        console.log(`  - ${milestone.name} (${milestone.programType}${milestone.programSubType ? ', ' + milestone.programSubType : ''})`);
      });
    });
    
    return duplicateGroups;
  }

  /**
   * Merge duplicate milestones
   * @returns Summary of merge operations
   */
  async mergeDuplicates() {
    return await mergeDuplicateMilestones();
  }

  /**
   * Update milestone templates with normalized names and categories
   */
  async updateMilestoneNormalization() {
    const templates = await prisma.milestoneTemplate.findMany();
    let updatedCount = 0;
    
    for (const template of templates) {
      const normalizedName = normalizeMilestoneName(template.name);
      const category = this.categorizeMilestone(template.name);
      
      // Only update if the normalized name or category has changed
      if (template.normalizedName !== normalizedName || template.category !== category) {
        await prisma.milestoneTemplate.update({
          where: { id: template.id },
          data: { 
            normalizedName,
            category
          }
        });
        updatedCount++;
      }
    }
    
    return { updatedCount };
  }

  /**
   * Get milestone templates grouped by category
   */
  async getMilestoneTemplatesByCategory(programType?: string, programSubType?: string) {
    const templates = await prisma.milestoneTemplate.findMany({
      where: {
        isApproved: true,
        isDeprecated: false,
        ...(programType ? { programType } : {}),
        ...(programSubType ? { programSubType } : {})
      },
      orderBy: [
        { category: 'asc' },
        { displayOrder: 'asc' },
        { useCount: 'desc' }
      ]
    });
    
    // Group by category
    const groupedTemplates: Record<string, any[]> = {};
    
    for (const template of templates) {
      const category = template.category || MILESTONE_CATEGORIES.OTHER;
      if (!groupedTemplates[category]) {
        groupedTemplates[category] = [];
      }
      groupedTemplates[category].push(template);
    }
    
    return groupedTemplates;
  }

  /**
   * Create a new milestone template with proper normalization
   */
  async createMilestoneTemplate(data: {
    name: string;
    description?: string;
    programType: string;
    programSubType?: string;
    userId?: string;
  }) {
    // Add normalization and categorization
    const normalizedName = normalizeMilestoneName(data.name);
    const category = this.categorizeMilestone(data.name);
    
    // Check for existing similar templates
    const similarTemplates = await prisma.milestoneTemplate.findMany({
      where: {
        normalizedName,
        isDeprecated: false
      }
    });
    
    // If similar templates exist, increment their use count instead of creating a new one
    if (similarTemplates.length > 0) {
      const mostUsedTemplate = similarTemplates.reduce((prev, current) => 
        (prev.useCount > current.useCount) ? prev : current
      );
      
      await prisma.milestoneTemplate.update({
        where: { id: mostUsedTemplate.id },
        data: { useCount: { increment: 1 } }
      });
      
      return mostUsedTemplate;
    }
    
    // Otherwise create a new template
    return await prisma.milestoneTemplate.create({
      data: {
        name: data.name,
        normalizedName,
        category,
        description: data.description,
        programType: data.programType,
        programSubType: data.programSubType,
        useCount: 1,
        isApproved: false,
        createdBy: data.userId ? { connect: { id: data.userId } } : undefined
      }
    });
  }

  /**
   * Approve a milestone template
   */
  async approveMilestoneTemplate(templateId: string) {
    return prisma.milestoneTemplate.update({
      where: { id: templateId },
      data: { isApproved: true },
    });
  }

  /**
   * Check for duplicate milestone names across all programs
   */
  async checkForDuplicateMilestones() {
    // Get all milestones
    const milestones = await prisma.milestone.findMany({
      include: {
        template: true
      }
    });

    const normalizedMilestones = new Map();
    const duplicates = [];

    // Find duplicates based on normalized name
    for (const milestone of milestones) {
      const normalizedName = normalizeString(milestone.name);
      
      if (normalizedMilestones.has(normalizedName)) {
        duplicates.push({
          original: normalizedMilestones.get(normalizedName),
          duplicate: milestone
        });
      } else {
        normalizedMilestones.set(normalizedName, milestone);
      }
    }

    return duplicates;
  }

  /**
   * Create default milestones for a program type from the immigration programs data
   */
  async createDefaultMilestones(programType: string, milestoneNames: string[]) {
    // Delete existing default milestones for this program type
    await prisma.milestone.deleteMany({
      where: {
        programType,
        isDefault: true,
      },
    });
    
    // Create new default milestones
    const milestones = await Promise.all(
      milestoneNames.map(async (name, index) => {
        // Create or get template
        const template = await this.createMilestoneTemplate({
          name,
          programType,
          // Templates created from seed data are approved by default
        });
        
        // Create milestone
        return prisma.milestone.create({
          data: {
            name,
            programType,
            isDefault: true,
            order: index,
            templateId: template.id,
          },
        });
      })
    );
    
    return milestones;
  }

  /**
   * Add a custom milestone for a specific application
   */
  async addCustomMilestone(data: {
    name: string;
    description?: string;
    programType: string;
    programSubType?: string;
    userId?: string;
  }) {
    // First check if a milestone with this exact name already exists for this program
    const existingMilestone = await prisma.milestone.findFirst({
      where: {
        name: data.name,
        programType: data.programType,
        programSubType: data.programSubType,
      }
    });

    // If it exists, simply return it
    if (existingMilestone) {
      return existingMilestone;
    }

    // Create or get template
    const template = await this.createMilestoneTemplate(data);
    
    // Check if template is now approved (due to frequent use)
    // If so, we should create a default milestone instead of a custom one
    const shouldBeDefault = template.isApproved;
    
    // Get the highest order for the program type
    const highestOrder = await prisma.milestone.findFirst({
      where: {
        programType: data.programType,
        programSubType: data.programSubType,
      },
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    });
    
    // Create milestone
    const milestone = await prisma.milestone.create({
      data: {
        name: data.name,
        description: data.description,
        programType: data.programType,
        programSubType: data.programSubType,
        isDefault: shouldBeDefault,
        order: highestOrder ? highestOrder.order + 1 : 0,
        templateId: template.id,
      },
    });
    
    return milestone;
  }

  /**
   * Update milestone order
   */
  async updateMilestoneOrder(milestoneId: string, newOrder: number) {
    return prisma.milestone.update({
      where: { id: milestoneId },
      data: { order: newOrder },
    });
  }

  /**
   * Delete a custom milestone
   */
  async deleteMilestone(milestoneId: string) {
    // Check if the milestone is a default one
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });
    
    if (!milestone || milestone.isDefault) {
      throw new Error('Cannot delete a default milestone');
    }
    
    return prisma.milestone.delete({
      where: { id: milestoneId },
    });
  }

  /**
   * Get popular custom milestones that could be promoted to default status
   */
  async getPopularCustomMilestones(threshold = MILESTONE_APPROVAL_THRESHOLD) {
    const popularTemplates = await prisma.milestoneTemplate.findMany({
      where: {
        useCount: { gte: threshold },
        isApproved: false
      },
      orderBy: {
        useCount: 'desc'
      }
    });

    return popularTemplates;
  }

  /**
   * Promote popular custom milestones to default status
   */
  async promotePopularMilestones(threshold = MILESTONE_APPROVAL_THRESHOLD) {
    const popularTemplates = await this.getPopularCustomMilestones(threshold);
    
    const results = [];
    
    for (const template of popularTemplates) {
      // Update the template to approved status
      await prisma.milestoneTemplate.update({
        where: { id: template.id },
        data: { isApproved: true }
      });
      
      // Update any milestones using this template to default status
      const updatedMilestones = await prisma.milestone.updateMany({
        where: { templateId: template.id },
        data: { isDefault: true }
      });
      
      results.push({
        template: template.name,
        milestonesUpdated: updatedMilestones.count
      });
    }
    
    return results;
  }

  /**
   * Flag a milestone template as irrelevant or incorrect
   */
  async flagMilestoneTemplate(templateId: string, userId: string) {
    // Check if the user has already flagged this template
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        flaggedMilestones: {
          where: { id: templateId }
        }
      }
    });
    
    if (user?.flaggedMilestones.length) {
      throw new Error('You have already flagged this milestone template');
    }
    
    // Update the flag count and add user to flagged relation
    const updatedTemplate = await prisma.milestoneTemplate.update({
      where: { id: templateId },
      data: {
        flagCount: { increment: 1 },
        flaggedBy: {
          connect: { id: userId }
        }
      }
    });
    
    // Check if flag threshold is exceeded
    if (updatedTemplate.flagCount >= FLAG_THRESHOLD) {
      // Mark as not approved if flag threshold is exceeded
      await prisma.milestoneTemplate.update({
        where: { id: templateId },
        data: { isApproved: false }
      });
      
      // Also update related milestones to not be default
      await prisma.milestone.updateMany({
        where: { templateId },
        data: { isDefault: false }
      });
      
      console.log(`Milestone template "${updatedTemplate.name}" has been flagged ${updatedTemplate.flagCount} times and is now unapproved.`);
    }
    
    return updatedTemplate;
  }

  /**
   * Remove a flag from a milestone template
   */
  async unflagMilestoneTemplate(templateId: string, userId: string) {
    // Check if the user has flagged this template
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        flaggedMilestones: {
          where: { id: templateId }
        }
      }
    });
    
    if (!user?.flaggedMilestones.length) {
      throw new Error('You have not flagged this milestone template');
    }
    
    // Update the flag count and remove user from flagged relation
    return prisma.milestoneTemplate.update({
      where: { id: templateId },
      data: {
        flagCount: { decrement: 1 },
        flaggedBy: {
          disconnect: { id: userId }
        }
      }
    });
  }

  /**
   * Process highly flagged milestone templates
   */
  async processHighlyFlaggedMilestones() {
    const flaggedTemplates = await prisma.milestoneTemplate.findMany({
      where: {
        flagCount: { gte: FLAG_THRESHOLD },
        isApproved: true
      }
    });
    
    const results = [];
    
    for (const template of flaggedTemplates) {
      await prisma.milestoneTemplate.update({
        where: { id: template.id },
        data: { isApproved: false }
      });
      
      // Also update related milestones to not be default
      await prisma.milestone.updateMany({
        where: { templateId: template.id },
        data: { isDefault: false }
      });
      
      results.push({
        templateName: template.name,
        programType: template.programType,
        programSubType: template.programSubType
      });
      
      console.log(`Processed flagged milestone template "${template.name}": now unapproved.`);
    }
    
    return results;
  }

  /**
   * Get all unique milestone templates regardless of program type
   */
  async getAllUniqueMilestoneTemplates(includeUnapproved = false) {
    const templates = await prisma.milestoneTemplate.findMany({
      where: {
        ...(includeUnapproved ? {} : { isApproved: true }),
      },
      orderBy: {
        useCount: 'desc',
      },
    });
    
    // Create a map to track unique milestone names
    const uniqueTemplates = new Map();
    
    // Process each template to normalize and deduplicate
    templates.forEach(template => {
      // Remove program type information in parentheses
      const cleanedName = template.name.replace(/\s*\([^)]*\)\s*/g, '').trim();
      
      // Create a normalized version for comparison
      const normalizedName = normalizeString(cleanedName);
      
      // Create a cleaned template with the program type info removed
      const cleanedTemplate = {
        ...template,
        name: cleanedName,
        normalizedName: normalizedName
      };
      
      if (!uniqueTemplates.has(normalizedName)) {
        uniqueTemplates.set(normalizedName, cleanedTemplate);
      } else {
        // If we already have this template, keep the one with higher useCount
        const existing = uniqueTemplates.get(normalizedName);
        if (template.useCount > existing.useCount) {
          uniqueTemplates.set(normalizedName, cleanedTemplate);
        }
      }
    });
    
    // Sort by useCount to prioritize most commonly used milestones
    return Array.from(uniqueTemplates.values())
      .sort((a, b) => b.useCount - a.useCount);
  }
} 
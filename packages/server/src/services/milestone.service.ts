import { PrismaClient } from '@prisma/client';
import { normalizeString } from '../utils/stringUtils';

const prisma = new PrismaClient();

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
   * Create a new milestone template
   */
  async createMilestoneTemplate(data: {
    name: string;
    description?: string;
    programType: string;
    programSubType?: string;
    userId?: string;
  }) {
    const normalizedName = normalizeString(data.name);
    
    // Check if a similar template already exists
    const existingTemplate = await prisma.milestoneTemplate.findFirst({
      where: {
        normalizedName,
        programType: data.programType,
        programSubType: data.programSubType,
      },
    });
    
    if (existingTemplate) {
      // Increment the use count of the existing template
      await prisma.milestoneTemplate.update({
        where: { id: existingTemplate.id },
        data: { useCount: { increment: 1 } },
      });
      
      return existingTemplate;
    }
    
    // Create a new template
    const newTemplate = await prisma.milestoneTemplate.create({
      data: {
        name: data.name,
        normalizedName,
        description: data.description,
        programType: data.programType,
        programSubType: data.programSubType,
        createdById: data.userId,
        // New templates created by users are not approved by default
        isApproved: false,
      },
    });
    
    return newTemplate;
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
    // Create or get template
    const template = await this.createMilestoneTemplate(data);
    
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
        isDefault: false,
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
} 
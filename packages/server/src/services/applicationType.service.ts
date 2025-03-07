import { PrismaClient } from '@prisma/client';
import { normalizeString } from '../utils/stringUtils';

const prisma = new PrismaClient();

// Constants
const APP_TYPE_APPROVAL_THRESHOLD = 3;
const APP_TYPE_FLAG_THRESHOLD = 3;

export class ApplicationTypeService {
  /**
   * Get all application types
   */
  async getAllApplicationTypes(includeNonDefault = false) {
    return prisma.applicationType.findMany({
      where: includeNonDefault ? {} : { isDefault: true },
      orderBy: { name: 'asc' }
    });
  }
  
  /**
   * Get application types by category
   */
  async getApplicationTypesByCategory(category: string) {
    return prisma.applicationType.findMany({
      where: {
        category,
        isDefault: true
      },
      orderBy: { name: 'asc' }
    });
  }
  
  /**
   * Create or update an application type
   */
  async createApplicationType(data: {
    name: string;
    description?: string;
    category: string;
    userId?: string;
  }) {
    const normalizedName = normalizeString(data.name);
    
    // Check if a similar app type already exists
    const existingType = await prisma.applicationType.findFirst({
      where: {
        normalizedName,
        category: data.category
      }
    });
    
    if (existingType) {
      // Increment the use count of the existing type
      const updatedType = await prisma.applicationType.update({
        where: { id: existingType.id },
        data: {
          useCount: { increment: 1 },
          isDefault: existingType.useCount + 1 >= APP_TYPE_APPROVAL_THRESHOLD
            ? true
            : existingType.isDefault
        }
      });
      
      console.log(`Application type "${updatedType.name}" use count incremented to ${updatedType.useCount}.`);
      
      if (updatedType.isDefault && !existingType.isDefault) {
        console.log(`Application type "${updatedType.name}" promoted to default status.`);
      }
      
      return updatedType;
    }
    
    // Create a new application type
    const newAppType = await prisma.applicationType.create({
      data: {
        name: data.name,
        description: data.description,
        normalizedName,
        category: data.category,
        isDefault: false, // New types are not default
        useCount: 1,
        ...(data.userId ? { 
          createdBy: { 
            connect: { id: data.userId } 
          } 
        } : {})
      }
    });
    
    console.log(`New application type created: "${newAppType.name}" in category "${newAppType.category}"`);
    
    return newAppType;
  }
  
  /**
   * Flag an application type as irrelevant or incorrect
   */
  async flagApplicationType(typeId: string, userId: string) {
    // Check if the user has already flagged this type
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        flaggedAppTypes: {
          where: { id: typeId }
        }
      }
    });
    
    if (user?.flaggedAppTypes.length) {
      throw new Error('You have already flagged this application type');
    }
    
    // Update the flag count and add user to flagged relation
    const updatedType = await prisma.applicationType.update({
      where: { id: typeId },
      data: {
        flagCount: { increment: 1 },
        flaggedBy: {
          connect: { id: userId }
        }
      }
    });
    
    // Check if flag threshold is exceeded
    if (updatedType.flagCount >= APP_TYPE_FLAG_THRESHOLD) {
      // Check if there are applications using this type
      const applicationCount = await prisma.application.count({
        where: { appTypeId: typeId }
      });
      
      if (applicationCount === 0) {
        await prisma.applicationType.update({
          where: { id: typeId },
          data: { isDefault: false }
        });
        console.log(`Application type "${updatedType.name}" has been flagged ${updatedType.flagCount} times and is now non-default.`);
      } else {
        console.log(`Application type "${updatedType.name}" has been flagged ${updatedType.flagCount} times but remains default as it has ${applicationCount} applications.`);
      }
    }
    
    return updatedType;
  }
  
  /**
   * Remove a flag from an application type
   */
  async unflagApplicationType(typeId: string, userId: string) {
    // Check if the user has flagged this type
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        flaggedAppTypes: {
          where: { id: typeId }
        }
      }
    });
    
    if (!user?.flaggedAppTypes.length) {
      throw new Error('You have not flagged this application type');
    }
    
    // Update the flag count and remove user from flagged relation
    return prisma.applicationType.update({
      where: { id: typeId },
      data: {
        flagCount: { decrement: 1 },
        flaggedBy: {
          disconnect: { id: userId }
        }
      }
    });
  }
  
  /**
   * Promote popular application types to default status
   */
  async promotePopularApplicationTypes(threshold = APP_TYPE_APPROVAL_THRESHOLD) {
    const popularTypes = await prisma.applicationType.findMany({
      where: {
        useCount: { gte: threshold },
        isDefault: false
      }
    });
    
    const results = [];
    
    for (const type of popularTypes) {
      await prisma.applicationType.update({
        where: { id: type.id },
        data: { isDefault: true }
      });
      
      results.push({
        type: type.name,
        category: type.category
      });

      console.log(`Popular application type "${type.name}" promoted to default status.`);
    }
    
    return results;
  }
  
  /**
   * Process flagged application types
   */
  async processHighlyFlaggedApplicationTypes() {
    const flaggedTypes = await prisma.applicationType.findMany({
      where: {
        flagCount: { gte: APP_TYPE_FLAG_THRESHOLD },
        isDefault: true
      }
    });
    
    const results = [];
    
    for (const type of flaggedTypes) {
      // Only disable types that are not actively used
      const applicationCount = await prisma.application.count({
        where: { appTypeId: type.id }
      });
      
      if (applicationCount === 0) {
        await prisma.applicationType.update({
          where: { id: type.id },
          data: { isDefault: false }
        });
        
        results.push({
          type: type.name,
          category: type.category
        });

        console.log(`Processed flagged application type "${type.name}": now non-default.`);
      } else {
        console.log(`Flagged application type "${type.name}" remains default as it has ${applicationCount} applications.`);
      }
    }
    
    return results;
  }
} 
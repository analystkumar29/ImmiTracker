import { Request, Response, NextFunction } from 'express';
import { MilestoneService } from '../services/milestone.service';
import { AppError } from '../middleware/errorHandler';
import { immigrationPrograms } from '../data/immigrationPrograms';

const milestoneService = new MilestoneService();

/**
 * Get all milestones for a specific program type
 */
export const getMilestones = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { programType, subType } = req.params;
    
    if (!programType) {
      return next(new AppError('Program type is required', 400));
    }
    
    const milestones = await milestoneService.getMilestones(programType, subType);
    res.json(milestones);
  } catch (error) {
    next(error);
  }
};

/**
 * Get milestone templates for a specific program type
 */
export const getMilestoneTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get programType from either path parameter or query parameter
    const pathProgramType = req.params.programType;
    const queryProgramType = req.query.programType as string;
    const programType = pathProgramType || queryProgramType;
    
    // Get subType from query parameter
    const subType = req.query.subType as string || req.query.programSubType as string;
    const includeUnapproved = req.query.includeUnapproved === 'true';
    
    if (!programType) {
      return next(new AppError('Program type is required', 400));
    }
    
    const templates = await milestoneService.getMilestoneTemplates(
      programType,
      subType,
      includeUnapproved
    );
    
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a custom milestone
 */
export const createCustomMilestone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, programType, programSubType } = req.body;
    const userId = req.user?.id;
    
    if (!name || !programType) {
      return next(new AppError('Name and program type are required', 400));
    }
    
    const milestone = await milestoneService.addCustomMilestone({
      name,
      description,
      programType,
      programSubType,
      userId,
    });
    
    res.status(201).json(milestone);
  } catch (error) {
    next(error);
  }
};

/**
 * Update milestone order
 */
export const updateMilestoneOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { milestoneId } = req.params;
    const { order } = req.body;
    
    if (!milestoneId || typeof order !== 'number') {
      return next(new AppError('Milestone ID and order are required', 400));
    }
    
    const milestone = await milestoneService.updateMilestoneOrder(milestoneId, order);
    res.json(milestone);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a custom milestone
 */
export const deleteMilestone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { milestoneId } = req.params;
    
    if (!milestoneId) {
      return next(new AppError('Milestone ID is required', 400));
    }
    
    await milestoneService.deleteMilestone(milestoneId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a milestone template (admin only)
 */
export const approveMilestoneTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { templateId } = req.params;
    
    if (!templateId) {
      return next(new AppError('Template ID is required', 400));
    }
    
    const template = await milestoneService.approveMilestoneTemplate(templateId);
    res.json(template);
  } catch (error) {
    next(error);
  }
};

/**
 * Initialize default milestones from immigration programs data
 */
export const initializeDefaultMilestones = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const results = [];
    
    for (const program of immigrationPrograms) {
      const milestones = await milestoneService.createDefaultMilestones(
        program.id,
        program.milestoneUpdates
      );
      
      results.push({
        programId: program.id,
        milestonesCreated: milestones.length,
      });
    }
    
    res.json({
      message: 'Default milestones initialized successfully',
      results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check for duplicate milestones across programs
 */
export const checkDuplicateMilestones = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const duplicates = await milestoneService.checkForDuplicateMilestones();
    
    res.status(200).json({
      count: duplicates.length,
      duplicates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get popular custom milestones that could be promoted to defaults
 */
export const getPopularMilestones = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : undefined;
    const popularMilestones = await milestoneService.getPopularCustomMilestones(threshold);
    
    res.status(200).json(popularMilestones);
  } catch (error) {
    next(error);
  }
};

/**
 * Promote popular custom milestones to default status
 */
export const promotePopularMilestones = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const threshold = req.body.threshold ? parseInt(req.body.threshold as string) : undefined;
    const results = await milestoneService.promotePopularMilestones(threshold);
    
    res.status(200).json({
      message: 'Popular milestones promoted successfully',
      results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Flag a milestone template as irrelevant or incorrect
 */
export const flagMilestoneTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { templateId } = req.params;
    const userId = req.user?.id;
    
    if (!templateId) {
      return next(new AppError('Template ID is required', 400));
    }
    
    if (!userId) {
      return next(new AppError('User must be authenticated', 401));
    }
    
    const template = await milestoneService.flagMilestoneTemplate(templateId, userId);
    res.json(template);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a flag from a milestone template
 */
export const unflagMilestoneTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { templateId } = req.params;
    const userId = req.user?.id;
    
    if (!templateId) {
      return next(new AppError('Template ID is required', 400));
    }
    
    if (!userId) {
      return next(new AppError('User must be authenticated', 401));
    }
    
    const template = await milestoneService.unflagMilestoneTemplate(templateId, userId);
    res.json(template);
  } catch (error) {
    next(error);
  }
};

/**
 * Process highly flagged milestone templates (admin only)
 */
export const processHighlyFlaggedMilestones = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const results = await milestoneService.processHighlyFlaggedMilestones();
    
    res.status(200).json({
      message: 'Flagged milestones processed successfully',
      results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all unique milestone templates regardless of program type
 */
export const getAllUniqueMilestoneTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const includeUnapproved = req.query.includeUnapproved === 'true';
    
    const milestoneService = new MilestoneService();
    const templates = await milestoneService.getAllUniqueMilestoneTemplates(includeUnapproved);
    
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

/**
 * Get milestone templates grouped by category
 */
export const getMilestoneTemplatesByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { programType, programSubType } = req.query;
    
    const groupedTemplates = await milestoneService.getMilestoneTemplatesByCategory(
      programType as string,
      programSubType as string
    );
    
    res.json(groupedTemplates);
  } catch (error) {
    next(error);
  }
};

/**
 * Run milestone normalization process
 * Admin only endpoint
 */
export const normalizeMilestones = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Update milestone templates with normalized names and categories
    const updateResult = await milestoneService.updateMilestoneNormalization();
    
    // Find duplicate milestones
    const duplicateGroups = await milestoneService.handleDuplicateMilestones();
    
    // Merge duplicates if requested
    let mergeResults = null;
    if (req.query.merge === 'true') {
      mergeResults = await milestoneService.mergeDuplicates();
    }
    
    res.json({
      success: true,
      updatedCount: updateResult.updatedCount,
      duplicateGroups: duplicateGroups.length,
      mergedGroups: mergeResults ? mergeResults.length : 0
    });
  } catch (error) {
    next(error);
  }
}; 
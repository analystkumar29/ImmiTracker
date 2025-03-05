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
    const { programType, subType } = req.params;
    const { includeUnapproved } = req.query;
    
    if (!programType) {
      return next(new AppError('Program type is required', 400));
    }
    
    const templates = await milestoneService.getMilestoneTemplates(
      programType,
      subType,
      includeUnapproved === 'true'
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
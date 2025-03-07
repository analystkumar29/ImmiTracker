import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { ApplicationTypeService } from '../services/applicationType.service';
import { AppError } from '../middleware/errorHandler';

const applicationTypeService = new ApplicationTypeService();

export const getAllApplicationTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const includeNonDefault = req.query.includeNonDefault === 'true';
    const applicationTypes = await applicationTypeService.getAllApplicationTypes(includeNonDefault);
    res.status(200).json({
      status: 'success',
      data: applicationTypes
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationTypesByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return next(new AppError('Category is required', 400));
    }
    
    const applicationTypes = await applicationTypeService.getApplicationTypesByCategory(category);
    res.status(200).json({
      status: 'success',
      data: applicationTypes
    });
  } catch (error) {
    next(error);
  }
};

export const createApplicationType = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, category } = req.body;
    
    if (!name || !category) {
      return next(new AppError('Name and category are required', 400));
    }
    
    const applicationType = await applicationTypeService.createApplicationType({
      name,
      description,
      category,
      userId: req.user?.id
    });
    
    res.status(201).json({
      status: 'success',
      data: applicationType
    });
  } catch (error) {
    next(error);
  }
};

export const flagApplicationType = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { typeId } = req.params;
    
    if (!typeId) {
      return next(new AppError('Application type ID is required', 400));
    }
    
    if (!req.user?.id) {
      return next(new AppError('User must be authenticated', 401));
    }
    
    const applicationType = await applicationTypeService.flagApplicationType(
      typeId,
      req.user.id
    );
    
    res.status(200).json({
      status: 'success',
      data: applicationType
    });
  } catch (error) {
    next(error);
  }
};

export const unflagApplicationType = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { typeId } = req.params;
    
    if (!typeId) {
      return next(new AppError('Application type ID is required', 400));
    }
    
    if (!req.user?.id) {
      return next(new AppError('User must be authenticated', 401));
    }
    
    const applicationType = await applicationTypeService.unflagApplicationType(
      typeId,
      req.user.id
    );
    
    res.status(200).json({
      status: 'success',
      data: applicationType
    });
  } catch (error) {
    next(error);
  }
};

export const promotePopularApplicationTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : undefined;
    const result = await applicationTypeService.promotePopularApplicationTypes(threshold);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const processHighlyFlaggedApplicationTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await applicationTypeService.processHighlyFlaggedApplicationTypes();
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}; 
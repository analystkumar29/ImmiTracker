import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express';
import { AppError } from './errorHandler';

export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Check if user exists and has admin role
  if (req.user.role !== UserRole.ADMIN) {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }
  
  next();
}; 
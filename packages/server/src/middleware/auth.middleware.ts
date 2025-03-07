import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { prisma } from '../index';
import { AuthenticatedRequest } from '../types/express';

interface JwtPayload {
  userId: string;
}

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token and attaches the user to the request object
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Not authorized, no token provided', 401));
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    
    // Get user from the database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
    
    if (!user) {
      return next(new AppError('Not authorized, user not found', 401));
    }
    
    // Attach the user to the request object
    (req as AuthenticatedRequest).user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return next(new AppError('Not authorized, token failed', 401));
  }
};

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return next(new AppError('Not authorized, please log in', 401));
    }
    
    if (!roles.includes(authReq.user.role)) {
      return next(new AppError('Not authorized, insufficient permissions', 403));
    }
    
    next();
  };
}; 
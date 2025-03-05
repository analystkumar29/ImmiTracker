import { Request, Response, NextFunction } from 'express';
import { immigrationPrograms } from '../data/immigrationPrograms';
import { AppError } from '../middleware/errorHandler';
import { mapToImmigrationProgramId } from '../utils/programMapper';

export const getAllPrograms = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Optional filtering by category
    const { category } = req.query;
    let programs = immigrationPrograms;

    if (category) {
      programs = programs.filter(
        (program) => program.category.toLowerCase() === category.toString().toLowerCase()
      );
    }

    res.json(programs);
  } catch (error) {
    next(error);
  }
};

export const getProgramById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const program = immigrationPrograms.find((p) => p.id === id);

    if (!program) {
      return next(new AppError('Program not found', 404));
    }

    res.json(program);
  } catch (error) {
    next(error);
  }
};

export const getProgramByTypeAndSubtype = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, subtype } = req.query;
    
    if (!type) {
      return next(new AppError('Type is required', 400));
    }
    
    // If subtype is provided, try to find a specific program using our mapper
    if (subtype) {
      const programId = mapToImmigrationProgramId(type.toString(), subtype.toString());
      
      if (programId) {
        const program = immigrationPrograms.find((p) => p.id === programId);
        if (program) {
          return res.json(program);
        }
      }
    }
    
    // Fallback: find programs by category/type
    const matchingPrograms = immigrationPrograms.filter(
      (program) => program.category === type
    );
    
    if (matchingPrograms.length === 0) {
      return next(new AppError('No matching programs found', 404));
    }
    
    // If only one program found, return it, otherwise return the array
    if (matchingPrograms.length === 1) {
      return res.json(matchingPrograms[0]);
    }
    
    res.json(matchingPrograms);
  } catch (error) {
    next(error);
  }
}; 
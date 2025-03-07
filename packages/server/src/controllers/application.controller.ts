import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types/express';
import { MilestoneService } from '../services/milestone.service';

const milestoneService = new MilestoneService();

export const createApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, subType, country, city, submissionDate } = req.body;
    const userId = (req as AuthenticatedRequest).user.id;

    // Validate required fields
    if (!type || !subType || !country || !city || !submissionDate) {
      return next(new AppError('Missing required fields', 400));
    }

    // Set initial status
    const initialStatus = 'Submitted';

    const application = await prisma.application.create({
      data: {
        type,
        subType,
        country,
        city,
        submissionDate: new Date(submissionDate),
        userId,
        currentStatus: initialStatus,
        statusHistory: {
          create: {
            statusName: initialStatus,
            statusDate: new Date(),
          },
        },
      },
      include: {
        statusHistory: true,
      },
    });

    // Add default milestones from the database
    // First, get all default milestones for this program type and subtype
    const defaultMilestones = await prisma.milestone.findMany({
      where: {
        programType: type,
        OR: [
          { programSubType: subType },
          { programSubType: null },
        ],
        isDefault: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    // If any default milestones were found, update the application with these milestones
    if (defaultMilestones.length > 0) {
      console.log(`Adding ${defaultMilestones.length} default milestones to application ${application.id}`);
      
      // Create status history entries for each default milestone
      // (Setting them as not completed initially)
      for (const milestone of defaultMilestones) {
        await prisma.statusHistory.create({
          data: {
            applicationId: application.id,
            statusName: milestone.name,
            statusDate: new Date(),
            milestoneId: milestone.id, 
            notes: `Default milestone: ${milestone.name}`,
          },
        });
      }
      
      // Reload the application with the updated status history
      const updatedApplication = await prisma.application.findUnique({
        where: {
          id: application.id,
        },
        include: {
          statusHistory: true,
        },
      });
      
      if (updatedApplication) {
        res.status(201).json(updatedApplication);
        return;
      }
    }

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    const applications = await prisma.application.findMany({
      where: {
        userId,
      },
      include: {
        statusHistory: {
          orderBy: {
            statusDate: 'desc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

export const getApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    const application = await prisma.application.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        statusHistory: {
          orderBy: {
            statusDate: 'desc',
          },
        },
      },
    });

    if (!application) {
      return next(new AppError('Application not found', 404));
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const { type, subType, country, city, submissionDate, currentStatus } = req.body;

    // Check if application exists and belongs to user
    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingApplication) {
      return next(new AppError('Application not found', 404));
    }

    // Update application
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        type,
        subType,
        country,
        city,
        submissionDate: new Date(submissionDate),
        currentStatus,
        statusHistory: {
          create: {
            statusName: currentStatus,
            statusDate: new Date(),
          },
        },
      },
      include: {
        statusHistory: {
          orderBy: {
            statusDate: 'desc',
          },
        },
      },
    });

    res.json(updatedApplication);
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    // Check if application exists and belongs to user
    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingApplication) {
      return next(new AppError('Application not found', 404));
    }

    // Delete application
    await prisma.application.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    const { statusName, statusDate, notes } = req.body;

    // Check if application exists and belongs to user
    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingApplication) {
      return next(new AppError('Application not found', 404));
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        currentStatus: statusName,
        statusHistory: {
          create: {
            statusName,
            statusDate: new Date(statusDate),
            notes,
          },
        },
      },
      include: {
        statusHistory: {
          orderBy: {
            statusDate: 'desc',
          },
        },
      },
    });

    res.json(updatedApplication);
  } catch (error) {
    next(error);
  }
};

export const deleteAllApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;

    // Delete all status history entries for the user's applications first
    await prisma.statusHistory.deleteMany({
      where: {
        application: {
          userId,
        },
      },
    });

    // Then delete all applications for the user
    const result = await prisma.application.deleteMany({
      where: {
        userId,
      },
    });

    res.status(200).json({ 
      message: `Successfully deleted ${result.count} applications`,
      count: result.count
    });
  } catch (error) {
    next(error);
  }
}; 
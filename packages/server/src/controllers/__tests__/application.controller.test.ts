import { Response } from 'express';
import { createApplication, getApplications, getApplication, updateApplication, deleteApplication } from '../application.controller';
import { prisma } from '../../index';
import { AuthenticatedRequest } from '../../types/express';

// Mock the prisma instance
jest.mock('../../index', () => ({
  prisma: {
    application: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    statusHistory: {
      create: jest.fn(),
    },
    milestone: {
      findMany: jest.fn(),
    },
  },
}));

describe('Application Controller', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        role: 'USER',
      },
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('createApplication', () => {
    test('should create a new application successfully', async () => {
      // Mock request body
      mockRequest.body = {
        type: 'Visitor Visa',
        subType: 'Tourist',
        country: 'Canada',
        city: 'Toronto',
        submissionDate: '2023-01-01',
      };

      // Mock application creation
      const mockApplication = {
        id: 'app-id',
        userId: 'user-id',
        type: 'Visitor Visa',
        subType: 'Tourist',
        country: 'Canada',
        city: 'Toronto',
        submissionDate: new Date('2023-01-01'),
        currentStatus: 'Submitted',
        createdAt: new Date(),
        updatedAt: new Date(),
        statusHistory: [
          {
            id: 'status-id',
            applicationId: 'app-id',
            statusName: 'Submitted',
            statusDate: new Date(),
            notes: null,
            createdAt: new Date(),
          },
        ],
      };

      (prisma.application.create as jest.Mock).mockResolvedValueOnce(mockApplication);
      (prisma.milestone.findMany as jest.Mock).mockResolvedValueOnce([]);

      await createApplication(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(prisma.application.create).toHaveBeenCalledWith({
        data: {
          type: 'Visitor Visa',
          subType: 'Tourist',
          country: 'Canada',
          city: 'Toronto',
          submissionDate: expect.any(Date),
          userId: 'user-id',
          currentStatus: 'Submitted',
          statusHistory: {
            create: {
              statusName: 'Submitted',
              statusDate: expect.any(Date),
            },
          },
        },
        include: {
          statusHistory: true,
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockApplication);
    });

    test('should return 400 if required fields are missing', async () => {
      // Mock request body with missing fields
      mockRequest.body = {
        type: 'Visitor Visa',
        // Missing other required fields
      };

      await createApplication(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].message).toBe('Missing required fields');
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });
  });

  describe('getApplications', () => {
    test('should get all applications for the user', async () => {
      // Mock applications
      const mockApplications = [
        {
          id: 'app-id-1',
          userId: 'user-id',
          type: 'Visitor Visa',
          subType: 'Tourist',
          country: 'Canada',
          city: 'Toronto',
          submissionDate: new Date('2023-01-01'),
          currentStatus: 'Submitted',
          createdAt: new Date(),
          updatedAt: new Date(),
          statusHistory: [],
        },
        {
          id: 'app-id-2',
          userId: 'user-id',
          type: 'Study Permit',
          subType: 'University',
          country: 'Canada',
          city: 'Vancouver',
          submissionDate: new Date('2023-02-01'),
          currentStatus: 'Submitted',
          createdAt: new Date(),
          updatedAt: new Date(),
          statusHistory: [],
        },
      ];

      (prisma.application.findMany as jest.Mock).mockResolvedValueOnce(mockApplications);

      await getApplications(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(prisma.application.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
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
      expect(mockResponse.json).toHaveBeenCalledWith(mockApplications);
    });
  });

  describe('getApplication', () => {
    test('should get a specific application by ID', async () => {
      // Mock request params
      mockRequest.params = {
        id: 'app-id',
      };

      // Mock application
      const mockApplication = {
        id: 'app-id',
        userId: 'user-id',
        type: 'Visitor Visa',
        subType: 'Tourist',
        country: 'Canada',
        city: 'Toronto',
        submissionDate: new Date('2023-01-01'),
        currentStatus: 'Submitted',
        createdAt: new Date(),
        updatedAt: new Date(),
        statusHistory: [],
      };

      (prisma.application.findFirst as jest.Mock).mockResolvedValueOnce(mockApplication);

      await getApplication(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(prisma.application.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'app-id',
          userId: 'user-id',
        },
        include: {
          statusHistory: {
            orderBy: {
              statusDate: 'desc',
            },
          },
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockApplication);
    });

    test('should return 404 if application is not found', async () => {
      // Mock request params
      mockRequest.params = {
        id: 'non-existent-app-id',
      };

      // Mock application not found
      (prisma.application.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await getApplication(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(prisma.application.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'non-existent-app-id',
          userId: 'user-id',
        },
        include: {
          statusHistory: {
            orderBy: {
              statusDate: 'desc',
            },
          },
        },
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].message).toBe('Application not found');
      expect(mockNext.mock.calls[0][0].statusCode).toBe(404);
    });
  });
}); 
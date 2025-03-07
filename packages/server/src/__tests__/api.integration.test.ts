import request from 'supertest';
import express from 'express';
import { config } from 'dotenv';
import authRoutes from '../routes/auth.routes';
import applicationRoutes from '../routes/application.routes';
import programRoutes from '../routes/program.routes';
import { errorHandler } from '../middleware/errorHandler';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Load environment variables
config();

// Mock the prisma instance
jest.mock('../index', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    application: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    statusHistory: {
      create: jest.fn(),
    },
    milestone: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));

describe('API Integration Tests', () => {
  let app: express.Application;
  let mockToken: string;

  beforeAll(() => {
    // Create Express app
    app = express();
    app.use(express.json());

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/applications', applicationRoutes);
    app.use('/api/programs', programRoutes);

    // Error handling middleware
    app.use(errorHandler);

    // Create a mock token
    mockToken = 'mock-token';
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Endpoints', () => {
    test('POST /api/auth/register should register a new user', async () => {
      // Mock user creation
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@example.com',
        role: 'USER',
      });

      // Mock bcrypt hash
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed-password');

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });

    test('POST /api/auth/login should login a user', async () => {
      // Mock user retrieval
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: 'USER',
      });

      // Mock bcrypt compare
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });
  });

  describe('Application Endpoints', () => {
    test('GET /api/applications should get all applications for the user', async () => {
      // Mock JWT verify
      (jwt.verify as jest.Mock).mockReturnValueOnce({ userId: 'user-id' });

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
      ];

      // Mock user retrieval
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@example.com',
        role: 'USER',
      });

      // Mock applications retrieval
      (prisma.application.findMany as jest.Mock).mockResolvedValueOnce(mockApplications);

      const response = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe('app-id-1');
    });

    test('POST /api/applications should create a new application', async () => {
      // Mock JWT verify
      (jwt.verify as jest.Mock).mockReturnValueOnce({ userId: 'user-id' });

      // Mock user retrieval
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@example.com',
        role: 'USER',
      });

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

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          type: 'Visitor Visa',
          subType: 'Tourist',
          country: 'Canada',
          city: 'Toronto',
          submissionDate: '2023-01-01',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('Visitor Visa');
      expect(response.body.subType).toBe('Tourist');
    });
  });
}); 
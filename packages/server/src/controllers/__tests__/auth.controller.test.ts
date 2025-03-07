import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { register, login } from '../auth.controller';
import { prisma } from '../../index';

// Mock the prisma instance
jest.mock('../../index', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('register', () => {
    test('should register a new user successfully', async () => {
      // Mock request body
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock user creation
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@example.com',
        role: 'USER',
      });

      // Mock bcrypt hash
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed-password');

      // Mock JWT sign
      (jwt.sign as jest.Mock).mockReturnValueOnce('fake-token');

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed-password',
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'USER',
        },
        token: 'fake-token',
      });
    });

    test('should return 400 if email is already in use', async () => {
      // Mock request body
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'password123',
      };

      // Mock existing user
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'existing-user-id',
        email: 'existing@example.com',
      });

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'existing@example.com' },
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].message).toBe('Email already in use');
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });
  });

  describe('login', () => {
    test('should login a user successfully', async () => {
      // Mock request body
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock user retrieval
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: 'USER',
      });

      // Mock bcrypt compare
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      // Mock JWT sign
      (jwt.sign as jest.Mock).mockReturnValueOnce('fake-token');

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      // Assertions
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed-password'
      );
      expect(jwt.sign).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'USER',
        },
        token: 'fake-token',
      });
    });

    test('should return 401 if user does not exist', async () => {
      // Mock request body
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      // Mock user retrieval (user not found)
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      // Assertions
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].message).toBe(
        'Invalid email or password'
      );
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });

    test('should return 401 if password is incorrect', async () => {
      // Mock request body
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      // Mock user retrieval
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: 'USER',
      });

      // Mock bcrypt compare (password does not match)
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      // Assertions
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong-password',
        'hashed-password'
      );
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext.mock.calls[0][0].message).toBe(
        'Invalid email or password'
      );
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });
  });
}); 
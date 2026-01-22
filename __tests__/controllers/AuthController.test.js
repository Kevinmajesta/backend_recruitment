const { me, login, register, logout } = require('../../controllers/AuthController');
const prisma = require('../../prisma/client/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Mock modules
jest.mock('../../prisma/client/index', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  company: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: {},
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
    
    validationResult.mockReturnValue({
      isEmpty: jest.fn(() => true),
      array: jest.fn(() => []),
    });
  });

  describe('me', () => {
    it('should return user data successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'ADMIN',
        companyId: 'company1',
        createdAt: new Date(),
        updatedAt: new Date(),
        company: {
          name: 'Test Company',
        },
      };

      req.user = { id: '1' };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await me(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should return 404 if user not found', async () => {
      req.user = { id: '1' };
      prisma.user.findUnique.mockResolvedValue(null);

      await me(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });

    it('should handle errors', async () => {
      req.user = { id: '1' };
      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await me(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        fullName: 'Test User',
        role: 'ADMIN',
        companyId: 'company1',
      };

      req.body = { email: 'test@example.com', password: 'password123' };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');

      await login(req, res);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: expect.any(Object),
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successfully',
        data: {
          token: 'mock-token',
          user: expect.not.objectContaining({ password: expect.anything() }),
        },
      });
    });

    it('should return 404 if user not found', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      prisma.user.findUnique.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });

    it('should return 401 if password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        fullName: 'Test User',
        role: 'ADMIN',
        companyId: 'company1',
      };

      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid password',
      });
    });

    it('should handle errors', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('register', () => {
    it('should register company and admin successfully', async () => {
      const mockCompany = {
        id: 'company1',
        name: 'Test Company',
        email: 'test@example.com',
        phone: '1234567890',
        address: '-',
      };

      const mockUser = {
        id: 'user1',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
        companyId: 'company1',
      };

      req.body = {
        companyName: 'Test Company',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        phone: '1234567890',
      };

      bcrypt.hash.mockResolvedValue('hashedPassword');
      prisma.$transaction.mockResolvedValue({ company: mockCompany, user: mockUser });

      await register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Company and Admin registered successfully',
        data: {
          userId: 'user1',
          companyId: 'company1',
          role: 'ADMIN',
        },
      });
    });

    it('should handle errors during registration', async () => {
      req.body = {
        companyName: 'Test Company',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        phone: '1234567890',
      };

      bcrypt.hash.mockResolvedValue('hashedPassword');
      prisma.$transaction.mockRejectedValue(new Error('Database error'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successfully',
      });
    });

    it('should handle errors', async () => {
      res.status.mockImplementationOnce(() => {
        throw new Error('Error');
      });

      await logout(req, res);

      expect(res.status).toHaveBeenCalled();
    });
  });
});

const { createUser, getUsers, getUserById, deleteUser } = require('../../controllers/UserController');
const prisma = require('../../prisma/client/index');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Mock modules
jest.mock('../../prisma/client/index', () => ({
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('bcryptjs');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

describe('UserController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {
        id: 'admin1',
        companyId: 'company1',
        role: 'ADMIN',
      },
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

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockUser = {
        id: 'user1',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'HR',
        companyId: 'company1',
      };

      req.body = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'HR',
      };

      bcrypt.hash.mockResolvedValue('hashedPassword');
      prisma.user.create.mockResolvedValue(mockUser);

      await createUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'hashedPassword',
          role: 'HR',
          companyId: 'company1',
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.not.objectContaining({ password: expect.anything() }),
      });
    });

    it('should handle validation errors', async () => {
      validationResult.mockReturnValueOnce({
        isEmpty: jest.fn(() => false),
        array: jest.fn(() => [{ msg: 'Email is required' }]),
      });

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: 'Email is required' }],
      });
    });

    it('should handle errors', async () => {
      req.body = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'HR',
      };

      bcrypt.hash.mockResolvedValue('hashedPassword');
      prisma.user.create.mockRejectedValue(new Error('Database error'));

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('getUsers', () => {
    it('should get all users successfully', async () => {
      const mockUsers = [
        {
          id: 'user1',
          fullName: 'User 1',
          email: 'user1@example.com',
          role: 'HR',
          createdAt: new Date(),
        },
        {
          id: 'user2',
          fullName: 'User 2',
          email: 'user2@example.com',
          role: 'RECRUITER',
          createdAt: new Date(),
        },
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      await getUsers(req, res);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company1' },
        select: { id: true, fullName: true, email: true, role: true, createdAt: true },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
      });
    });

    it('should handle errors', async () => {
      prisma.user.findMany.mockRejectedValue(new Error('Database error'));

      await getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('getUserById', () => {
    it('should get user by id successfully', async () => {
      const mockUser = {
        id: 'user1',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'HR',
        companyId: 'company1',
      };

      req.params.id = 'user1';
      prisma.user.findFirst.mockResolvedValue(mockUser);

      await getUserById(req, res);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user1', companyId: 'company1' },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.not.objectContaining({ password: expect.anything() }),
      });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 'nonexistent';
      prisma.user.findFirst.mockResolvedValue(null);

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });

    it('should handle errors', async () => {
      req.params.id = 'user1';
      prisma.user.findFirst.mockRejectedValue(new Error('Database error'));

      await getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockUser = {
        id: 'user1',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'HR',
        companyId: 'company1',
      };

      req.params.id = 'user1';
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.user.delete.mockResolvedValue(mockUser);

      await deleteUser(req, res);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user1', companyId: 'company1' },
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user1' },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User deleted successfully',
      });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 'nonexistent';
      prisma.user.findFirst.mockResolvedValue(null);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });

    it('should handle errors', async () => {
      const mockUser = {
        id: 'user1',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'HR',
        companyId: 'company1',
      };

      req.params.id = 'user1';
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.user.delete.mockRejectedValue(new Error('Database error'));

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });
});

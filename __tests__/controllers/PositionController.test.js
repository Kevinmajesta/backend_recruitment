const {
  createPosition,
  getPositions,
  getPositionById,
  updatePosition,
  deletePosition,
} = require('../../controllers/PositionController');
const prisma = require('../../prisma/client/index');
const { validationResult } = require('express-validator');

// Mock modules
jest.mock('../../prisma/client/index', () => ({
  position: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

describe('PositionController', () => {
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

  describe('createPosition', () => {
    it('should create position successfully', async () => {
      const mockPosition = {
        id: 'position1',
        title: 'Software Engineer',
        location: 'Jakarta',
        type: 'FULLTIME',
        description: 'Great opportunity',
        salary: '10000000',
        companyId: 'company1',
        createdBy: 'admin1',
      };

      req.body = {
        title: 'Software Engineer',
        location: 'Jakarta',
        type: 'FULLTIME',
        description: 'Great opportunity',
        salary: '10000000',
      };

      prisma.position.create.mockResolvedValue(mockPosition);

      await createPosition(req, res);

      expect(prisma.position.create).toHaveBeenCalledWith({
        data: {
          title: 'Software Engineer',
          location: 'Jakarta',
          type: 'FULLTIME',
          description: 'Great opportunity',
          salary: '10000000',
          companyId: 'company1',
          createdBy: 'admin1',
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosition,
      });
    });

    it('should handle validation errors', async () => {
      validationResult.mockReturnValueOnce({
        isEmpty: jest.fn(() => false),
        array: jest.fn(() => [{ msg: 'Title is required' }]),
      });

      await createPosition(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: 'Title is required' }],
      });
    });

    it('should handle errors', async () => {
      req.body = {
        title: 'Software Engineer',
        location: 'Jakarta',
        type: 'FULLTIME',
        description: 'Great opportunity',
        salary: '10000000',
      };

      prisma.position.create.mockRejectedValue(new Error('Database error'));

      await createPosition(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('getPositions', () => {
    it('should get all positions successfully', async () => {
      const mockPositions = [
        {
          id: 'position1',
          title: 'Software Engineer',
          location: 'Jakarta',
          type: 'FULLTIME',
          companyId: 'company1',
        },
        {
          id: 'position2',
          title: 'Product Manager',
          location: 'Bandung',
          type: 'CONTRACT',
          companyId: 'company1',
        },
      ];

      prisma.position.findMany.mockResolvedValue(mockPositions);

      await getPositions(req, res);

      expect(prisma.position.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company1' },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPositions,
      });
    });

    it('should handle errors', async () => {
      prisma.position.findMany.mockRejectedValue(new Error('Database error'));

      await getPositions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('getPositionById', () => {
    it('should get position by id successfully', async () => {
      const mockPosition = {
        id: 'position1',
        title: 'Software Engineer',
        location: 'Jakarta',
        type: 'FULLTIME',
        description: 'Great opportunity',
        salary: '10000000',
        companyId: 'company1',
      };

      req.params.id = 'position1';
      prisma.position.findFirst.mockResolvedValue(mockPosition);

      await getPositionById(req, res);

      expect(prisma.position.findFirst).toHaveBeenCalledWith({
        where: { id: 'position1', companyId: 'company1' },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosition,
      });
    });

    it('should return 404 if position not found', async () => {
      req.params.id = 'nonexistent';
      prisma.position.findFirst.mockResolvedValue(null);

      await getPositionById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Position not found',
      });
    });

    it('should handle errors', async () => {
      req.params.id = 'position1';
      prisma.position.findFirst.mockRejectedValue(new Error('Database error'));

      await getPositionById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('updatePosition', () => {
    it('should update position successfully', async () => {
      const mockPosition = {
        id: 'position1',
        title: 'Software Engineer',
        location: 'Jakarta',
        type: 'FULLTIME',
        companyId: 'company1',
      };

      const updatedPosition = {
        ...mockPosition,
        title: 'Senior Software Engineer',
      };

      req.params.id = 'position1';
      req.body = { title: 'Senior Software Engineer' };
      prisma.position.findFirst.mockResolvedValue(mockPosition);
      prisma.position.update.mockResolvedValue(updatedPosition);

      await updatePosition(req, res);

      expect(prisma.position.findFirst).toHaveBeenCalledWith({
        where: { id: 'position1', companyId: 'company1' },
      });
      expect(prisma.position.update).toHaveBeenCalledWith({
        where: { id: 'position1' },
        data: { title: 'Senior Software Engineer' },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedPosition,
      });
    });

    it('should return 404 if position not found', async () => {
      req.params.id = 'nonexistent';
      req.body = { title: 'Senior Software Engineer' };
      prisma.position.findFirst.mockResolvedValue(null);

      await updatePosition(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Position not found',
      });
    });

    it('should handle errors', async () => {
      const mockPosition = {
        id: 'position1',
        title: 'Software Engineer',
        companyId: 'company1',
      };

      req.params.id = 'position1';
      req.body = { title: 'Senior Software Engineer' };
      prisma.position.findFirst.mockResolvedValue(mockPosition);
      prisma.position.update.mockRejectedValue(new Error('Database error'));

      await updatePosition(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('deletePosition', () => {
    it('should delete position successfully', async () => {
      const mockPosition = {
        id: 'position1',
        title: 'Software Engineer',
        companyId: 'company1',
      };

      req.params.id = 'position1';
      prisma.position.findFirst.mockResolvedValue(mockPosition);
      prisma.position.delete.mockResolvedValue(mockPosition);

      await deletePosition(req, res);

      expect(prisma.position.findFirst).toHaveBeenCalledWith({
        where: { id: 'position1', companyId: 'company1' },
      });
      expect(prisma.position.delete).toHaveBeenCalledWith({
        where: { id: 'position1' },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Position deleted successfully',
      });
    });

    it('should return 404 if position not found', async () => {
      req.params.id = 'nonexistent';
      prisma.position.findFirst.mockResolvedValue(null);

      await deletePosition(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Position not found',
      });
    });

    it('should handle errors', async () => {
      const mockPosition = {
        id: 'position1',
        title: 'Software Engineer',
        companyId: 'company1',
      };

      req.params.id = 'position1';
      prisma.position.findFirst.mockResolvedValue(mockPosition);
      prisma.position.delete.mockRejectedValue(new Error('Database error'));

      await deletePosition(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });
});

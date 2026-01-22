const {
  apply,
  getApplicants,
  getApplicantById,
  updateStatus,
  updateNotes,
  deleteApplicant,
} = require('../../controllers/ApplicantController');
const prisma = require('../../prisma/client/index');
const { validationResult } = require('express-validator');

// Mock modules
jest.mock('../../prisma/client/index', () => ({
  applicant: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

describe('ApplicantController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
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

  describe('apply', () => {
    it('should create applicant successfully', async () => {
      const mockApplicant = {
        id: 'applicant1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        resume: 'resume.pdf',
        positionId: 'position1',
        status: 'APPLIED',
      };

      req.body = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        resume: 'resume.pdf',
        positionId: 'position1',
      };

      prisma.applicant.create.mockResolvedValue(mockApplicant);

      await apply(req, res);

      expect(prisma.applicant.create).toHaveBeenCalledWith({
        data: req.body,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockApplicant,
      });
    });

    it('should handle validation errors', async () => {
      validationResult.mockReturnValueOnce({
        isEmpty: jest.fn(() => false),
        array: jest.fn(() => [{ msg: 'Email is required' }]),
      });

      await apply(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: 'Email is required' }],
      });
    });

    it('should handle errors', async () => {
      req.body = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        resume: 'resume.pdf',
        positionId: 'position1',
      };

      prisma.applicant.create.mockRejectedValue(new Error('Database error'));

      await apply(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('getApplicants', () => {
    it('should get all applicants successfully', async () => {
      const mockApplicants = [
        {
          id: 'applicant1',
          fullName: 'John Doe',
          email: 'john@example.com',
          positionId: 'position1',
          position: { title: 'Software Engineer' },
        },
        {
          id: 'applicant2',
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          positionId: 'position1',
          position: { title: 'Software Engineer' },
        },
      ];

      req.query.positionId = 'position1';
      prisma.applicant.findMany.mockResolvedValue(mockApplicants);

      await getApplicants(req, res);

      expect(prisma.applicant.findMany).toHaveBeenCalledWith({
        where: {
          positionId: 'position1',
          position: { companyId: 'company1' },
        },
        include: { position: { select: { title: true } } },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockApplicants,
      });
    });

    it('should handle errors', async () => {
      req.query.positionId = 'position1';
      prisma.applicant.findMany.mockRejectedValue(new Error('Database error'));

      await getApplicants(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('getApplicantById', () => {
    it('should get applicant by id successfully', async () => {
      const mockApplicant = {
        id: 'applicant1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        resume: 'resume.pdf',
        positionId: 'position1',
        position: {
          id: 'position1',
          title: 'Software Engineer',
          companyId: 'company1',
        },
      };

      req.params.id = 'applicant1';
      prisma.applicant.findFirst.mockResolvedValue(mockApplicant);

      await getApplicantById(req, res);

      expect(prisma.applicant.findFirst).toHaveBeenCalledWith({
        where: { id: 'applicant1', position: { companyId: 'company1' } },
        include: { position: true },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockApplicant,
      });
    });

    it('should return 404 if applicant not found', async () => {
      req.params.id = 'nonexistent';
      prisma.applicant.findFirst.mockResolvedValue(null);

      await getApplicantById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Applicant not found',
      });
    });

    it('should handle errors', async () => {
      req.params.id = 'applicant1';
      prisma.applicant.findFirst.mockRejectedValue(new Error('Database error'));

      await getApplicantById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('updateStatus', () => {
    it('should update applicant status successfully', async () => {
      req.params.id = 'applicant1';
      req.body.status = 'INTERVIEWED';
      prisma.applicant.updateMany.mockResolvedValue({ count: 1 });

      await updateStatus(req, res);

      expect(prisma.applicant.updateMany).toHaveBeenCalledWith({
        where: { id: 'applicant1', position: { companyId: 'company1' } },
        data: { status: 'INTERVIEWED' },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Status updated',
      });
    });

    it('should return 404 if applicant not found', async () => {
      req.params.id = 'nonexistent';
      req.body.status = 'INTERVIEWED';
      prisma.applicant.updateMany.mockResolvedValue({ count: 0 });

      await updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Applicant not found',
      });
    });

    it('should handle errors', async () => {
      req.params.id = 'applicant1';
      req.body.status = 'INTERVIEWED';
      prisma.applicant.updateMany.mockRejectedValue(new Error('Database error'));

      await updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('updateNotes', () => {
    it('should update applicant notes successfully', async () => {
      req.params.id = 'applicant1';
      req.body.notes = 'Good candidate';
      prisma.applicant.updateMany.mockResolvedValue({ count: 1 });

      await updateNotes(req, res);

      expect(prisma.applicant.updateMany).toHaveBeenCalledWith({
        where: { id: 'applicant1', position: { companyId: 'company1' } },
        data: { notes: 'Good candidate' },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notes updated',
      });
    });

    it('should return 404 if applicant not found', async () => {
      req.params.id = 'nonexistent';
      req.body.notes = 'Good candidate';
      prisma.applicant.updateMany.mockResolvedValue({ count: 0 });

      await updateNotes(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Applicant not found',
      });
    });

    it('should handle errors', async () => {
      req.params.id = 'applicant1';
      req.body.notes = 'Good candidate';
      prisma.applicant.updateMany.mockRejectedValue(new Error('Database error'));

      await updateNotes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('deleteApplicant', () => {
    it('should delete applicant successfully', async () => {
      const mockApplicant = {
        id: 'applicant1',
        fullName: 'John Doe',
        position: { companyId: 'company1' },
      };

      req.params.id = 'applicant1';
      prisma.applicant.findFirst.mockResolvedValue(mockApplicant);
      prisma.applicant.delete.mockResolvedValue(mockApplicant);

      await deleteApplicant(req, res);

      expect(prisma.applicant.findFirst).toHaveBeenCalledWith({
        where: { id: 'applicant1', position: { companyId: 'company1' } },
      });
      expect(prisma.applicant.delete).toHaveBeenCalledWith({
        where: { id: 'applicant1' },
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Applicant deleted',
      });
    });

    it('should return 404 if applicant not found', async () => {
      req.params.id = 'nonexistent';
      prisma.applicant.findFirst.mockResolvedValue(null);

      await deleteApplicant(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Applicant not found',
      });
    });

    it('should handle errors', async () => {
      const mockApplicant = {
        id: 'applicant1',
        fullName: 'John Doe',
        position: { companyId: 'company1' },
      };

      req.params.id = 'applicant1';
      prisma.applicant.findFirst.mockResolvedValue(mockApplicant);
      prisma.applicant.delete.mockRejectedValue(new Error('Database error'));

      await deleteApplicant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });
});

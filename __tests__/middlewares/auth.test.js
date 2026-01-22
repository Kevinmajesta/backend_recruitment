const verifyToken = require('../../middlewares/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should verify token and call next', () => {
    const mockDecoded = {
      id: 'user1',
      companyId: 'company1',
      role: 'ADMIN',
    };

    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, mockDecoded);
    });

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'valid-token',
      process.env.JWT_SECRET,
      expect.any(Function)
    );
    expect(req.user).toEqual(mockDecoded);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no token provided', () => {
    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthenticated.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    req.headers.authorization = 'Bearer invalid-token';
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle authorization header without Bearer prefix', () => {
    req.headers.authorization = 'token-without-bearer';

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unauthenticated.',
    });
    expect(next).not.toHaveBeenCalled();
  });
});

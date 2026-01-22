const authorize = require('../../middlewares/rbac');

describe('RBAC Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next if user has required role', () => {
    req.user.role = 'ADMIN';
    const middleware = authorize(['ADMIN', 'HR']);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 403 if user does not have required role', () => {
    req.user.role = 'RECRUITER';
    const middleware = authorize(['ADMIN', 'HR']);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden: You do not have enough permissions',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow access if roles array is empty', () => {
    req.user.role = 'RECRUITER';
    const middleware = authorize([]);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden: You do not have enough permissions',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle ADMIN role', () => {
    req.user.role = 'ADMIN';
    const middleware = authorize(['ADMIN']);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should handle HR role', () => {
    req.user.role = 'HR';
    const middleware = authorize(['HR']);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should handle RECRUITER role', () => {
    req.user.role = 'RECRUITER';
    const middleware = authorize(['RECRUITER']);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should handle multiple roles', () => {
    req.user.role = 'HR';
    const middleware = authorize(['ADMIN', 'HR', 'RECRUITER']);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

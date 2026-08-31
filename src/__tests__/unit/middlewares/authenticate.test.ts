import { Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../../../middlewares/authenticate';
import { signToken } from '../../../utils/jwt';

const mockRes = () => ({} as Response);
const mockNext = jest.fn() as NextFunction;

const buildReq = (authHeader?: string): Request =>
  ({
    headers: { authorization: authHeader },
  } as unknown as Request);

describe('authenticateJWT middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe llamar next() y adjuntar req.user con token válido', () => {
    const payload = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      email: 'test@example.com',
    };
    const token = signToken(payload);
    const req = buildReq(`Bearer ${token}`);
    const next = jest.fn();

    authenticateJWT(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeDefined();
    expect(req.user?.sub).toBe(payload.sub);
    expect(req.user?.username).toBe(payload.username);
  });

  it('debe llamar next(error) sin token', () => {
    const req = buildReq(undefined);
    const next = jest.fn();

    authenticateJWT(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  it('debe llamar next(error) con token inválido', () => {
    const req = buildReq('Bearer token.invalido.xyz');
    const next = jest.fn();

    authenticateJWT(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  it('debe llamar next(error) con cabecera sin prefijo Bearer', () => {
    const req = buildReq('Basic abc123');
    const next = jest.fn();

    authenticateJWT(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../middlewares/errorHandler';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
} from '../../../utils/errors';
import { ZodError, z } from 'zod';

const mockReq = () =>
  ({
    method: 'GET',
    path: '/test',
  } as Request);

const mockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('errorHandler middleware', () => {
  it('debe manejar AppError correctamente', () => {
    const req = mockReq();
    const res = mockRes();
    const err = new AppError('Error genérico', 400);

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Error genérico' }),
    );
  });

  it('debe manejar AuthenticationError con 401', () => {
    const req = mockReq();
    const res = mockRes();
    const err = new AuthenticationError();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('debe manejar NotFoundError con 404', () => {
    const req = mockReq();
    const res = mockRes();
    const err = new NotFoundError('Producto');

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Producto no encontrado' }),
    );
  });

  it('debe manejar ZodError con 422 y lista de errores', () => {
    const req = mockReq();
    const res = mockRes();

    let zodErr: ZodError | null = null;
    try {
      z.object({ email: z.string().email() }).parse({ email: 'no-es-email' });
    } catch (e) {
      zodErr = e as ZodError;
    }

    errorHandler(zodErr!, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(422);
    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.success).toBe(false);
    expect(Array.isArray(jsonCall.errors)).toBe(true);
  });

  it('debe responder 500 para errores no controlados', () => {
    const req = mockReq();
    const res = mockRes();
    const err = new Error('Error inesperado');

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
  });

  it('debe incluir lista de errores en ValidationError', () => {
    const req = mockReq();
    const res = mockRes();
    const errors = [{ field: 'email', message: 'Email inválido' }];
    const err = new ValidationError('Error de validación', errors);

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(422);
    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.errors).toEqual(errors);
  });
});

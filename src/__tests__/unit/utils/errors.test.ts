import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError,
} from '../../../utils/errors';

describe('Custom Errors', () => {
  describe('AppError', () => {
    it('debe crear un error con statusCode y mensaje', () => {
      const err = new AppError('Error de prueba', 400);
      expect(err.message).toBe('Error de prueba');
      expect(err.statusCode).toBe(400);
      expect(err.isOperational).toBe(true);
      expect(err).toBeInstanceOf(Error);
    });

    it('debe aceptar errors adicionales', () => {
      const errors = [{ field: 'email', message: 'Inválido' }];
      const err = new AppError('Error', 422, errors);
      expect(err.errors).toEqual(errors);
    });
  });

  describe('ValidationError', () => {
    it('debe tener statusCode 422', () => {
      const err = new ValidationError();
      expect(err.statusCode).toBe(422);
      expect(err.name).toBe('ValidationError');
    });
  });

  describe('AuthenticationError', () => {
    it('debe tener statusCode 401', () => {
      const err = new AuthenticationError();
      expect(err.statusCode).toBe(401);
      expect(err.name).toBe('AuthenticationError');
    });

    it('debe aceptar mensaje personalizado', () => {
      const err = new AuthenticationError('Token expirado');
      expect(err.message).toBe('Token expirado');
    });
  });

  describe('AuthorizationError', () => {
    it('debe tener statusCode 403', () => {
      const err = new AuthorizationError();
      expect(err.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('debe tener statusCode 404', () => {
      const err = new NotFoundError('Usuario');
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('Usuario no encontrado');
    });

    it('debe usar "Recurso" como default', () => {
      const err = new NotFoundError();
      expect(err.message).toBe('Recurso no encontrado');
    });
  });

  describe('ConflictError', () => {
    it('debe tener statusCode 409', () => {
      const err = new ConflictError();
      expect(err.statusCode).toBe(409);
    });
  });

  describe('BusinessRuleError', () => {
    it('debe tener statusCode 400', () => {
      const err = new BusinessRuleError('Regla de negocio violada');
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Regla de negocio violada');
    });
  });
});

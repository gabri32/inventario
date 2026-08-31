import { signToken, verifyToken, extractTokenFromHeader } from '../../../utils/jwt';
import { AuthenticationError } from '../../../utils/errors';

describe('JWT Utilities', () => {
  const payload = {
    sub: '550e8400-e29b-41d4-a716-446655440000',
    username: 'testuser',
    email: 'test@example.com',
  };

  describe('signToken', () => {
    it('debe generar un token JWT válido', () => {
      const token = signToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('debe verificar y decodificar un token válido', () => {
      const token = signToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.username).toBe(payload.username);
      expect(decoded.email).toBe(payload.email);
    });

    it('debe lanzar AuthenticationError con token inválido', () => {
      expect(() => verifyToken('token.invalido.aqui')).toThrow(AuthenticationError);
    });

    it('debe lanzar AuthenticationError con token malformado', () => {
      expect(() => verifyToken('totalmente-invalido')).toThrow(AuthenticationError);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('debe extraer token de cabecera Bearer válida', () => {
      const token = signToken(payload);
      const extracted = extractTokenFromHeader(`Bearer ${token}`);
      expect(extracted).toBe(token);
    });

    it('debe lanzar error si no hay cabecera', () => {
      expect(() => extractTokenFromHeader(undefined)).toThrow(AuthenticationError);
    });

    it('debe lanzar error si no es Bearer', () => {
      expect(() => extractTokenFromHeader('Basic abc123')).toThrow(AuthenticationError);
    });

    it('debe lanzar error si Bearer no tiene token', () => {
      expect(() => extractTokenFromHeader('Bearer ')).toThrow(AuthenticationError);
    });
  });
});

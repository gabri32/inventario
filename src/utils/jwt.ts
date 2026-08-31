import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticationError } from './errors';

export interface JwtPayload {
  sub: string; // id_usuario
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const signToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.jwt.secret) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('El token ha expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Token inválido');
    }
    throw new AuthenticationError('Error al verificar el token');
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Token no proporcionado');
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AuthenticationError('Token no proporcionado');
  }
  return token;
};

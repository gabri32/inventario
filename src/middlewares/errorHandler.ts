import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize';
import { AppError, ValidationError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown[];
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  logger.error(`[${req.method}] ${req.path} - ${err.message}`, err);

  let statusCode = 500;
  let message = 'Error interno del servidor';
  let errors: unknown[] | undefined;

  // Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Error de validación';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }
  // Custom app errors
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // Sequelize unique constraint
  else if (err instanceof UniqueConstraintError) {
    const conflictErr = new ConflictError('El registro ya existe con esos datos únicos');
    statusCode = conflictErr.statusCode;
    message = conflictErr.message;
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }
  // Sequelize validation error
  else if (err instanceof SequelizeValidationError) {
    const valErr = new ValidationError('Error de validación en los datos');
    statusCode = valErr.statusCode;
    message = valErr.message;
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }

  const response: ErrorResponse = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.isDevelopment && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

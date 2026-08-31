import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedApiResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Operación realizada correctamente',
  statusCode = 200,
): void => {
  const response: ApiResponse<T> = { success: true, message, data };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Recurso creado correctamente',
): void => {
  sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
): void => {
  const response: PaginatedApiResponse<T> = { success: true, data, pagination };
  res.status(200).json(response);
};

export const buildPagination = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

export const parsePaginationQuery = (
  query: Record<string, unknown>,
): { page: number; limit: number; offset: number } => {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '20'), 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

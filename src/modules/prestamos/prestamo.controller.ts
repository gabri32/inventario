import { Request, Response, NextFunction } from 'express';
import { PrestamoService } from './prestamo.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { AuthenticationError } from '../../utils/errors';

export const PrestamoController = {
  // ── Prestatarios ──────────────────────────────────────────────────────────
  async listarPrestatarios(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prestatarios, pagination } = await PrestamoService.listarPrestatarios(req.query as Record<string, unknown>);
      sendPaginated(res, prestatarios, pagination);
    } catch (e) { next(e); }
  },

  async crearPrestatario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendCreated(res, await PrestamoService.crearPrestatario(req.body, req.user.sub), 'Prestatario creado correctamente');
    } catch (e) { next(e); }
  },

  // ── Préstamos ─────────────────────────────────────────────────────────────
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prestamos, pagination } = await PrestamoService.listar(req.query as Record<string, unknown>);
      sendPaginated(res, prestamos, pagination);
    } catch (e) { next(e); }
  },

  async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await PrestamoService.obtenerPorId(req.params.id)); }
    catch (e) { next(e); }
  },

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendCreated(res, await PrestamoService.crear(req.body, req.user.sub), 'Préstamo registrado correctamente');
    } catch (e) { next(e); }
  },

  async devolver(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendSuccess(res, await PrestamoService.devolver(req.params.id, req.body, req.user.sub), 'Devolución registrada correctamente');
    } catch (e) { next(e); }
  },
};

import { Request, Response, NextFunction } from 'express';
import { CompraService } from './compra.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { AuthenticationError } from '../../utils/errors';

export const CompraController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { compras, pagination } = await CompraService.listar(req.query as Record<string, unknown>);
      sendPaginated(res, compras, pagination);
    } catch (e) { next(e); }
  },

  async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await CompraService.obtenerPorId(req.params.id)); }
    catch (e) { next(e); }
  },

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendCreated(res, await CompraService.crear(req.body, req.user.sub), 'Compra creada correctamente');
    } catch (e) { next(e); }
  },

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendSuccess(res, await CompraService.actualizar(req.params.id, req.body, req.user.sub), 'Compra actualizada');
    } catch (e) { next(e); }
  },

  async confirmar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendSuccess(res, await CompraService.confirmar(req.params.id, req.user.sub), 'Compra confirmada correctamente');
    } catch (e) { next(e); }
  },

  async anular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendSuccess(res, await CompraService.anular(req.params.id, req.user.sub), 'Compra anulada correctamente');
    } catch (e) { next(e); }
  },
};

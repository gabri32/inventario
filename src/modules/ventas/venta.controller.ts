import { Request, Response, NextFunction } from 'express';
import { VentaService } from './venta.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { AuthenticationError } from '../../utils/errors';

export const VentaController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ventas, pagination } = await VentaService.listar(req.query as Record<string, unknown>);
      sendPaginated(res, ventas, pagination);
    } catch (e) { next(e); }
  },
  async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try { sendSuccess(res, await VentaService.obtenerPorId(req.params.id)); } catch (e) { next(e); }
  },
  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendCreated(res, await VentaService.crear(req.body, req.user.sub), 'Venta creada correctamente');
    } catch (e) { next(e); }
  },
  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendSuccess(res, await VentaService.actualizar(req.params.id, req.body, req.user.sub), 'Venta actualizada');
    } catch (e) { next(e); }
  },
  async confirmar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendSuccess(res, await VentaService.confirmar(req.params.id, req.user.sub), 'Venta confirmada correctamente');
    } catch (e) { next(e); }
  },
  async anular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendSuccess(res, await VentaService.anular(req.params.id, req.user.sub), 'Venta anulada correctamente');
    } catch (e) { next(e); }
  },
};

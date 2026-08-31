import { Request, Response, NextFunction } from 'express';
import { ProductoService } from './producto.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { AuthenticationError } from '../../utils/errors';

export const ProductoController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productos, pagination } = await ProductoService.listar(req.query as Record<string, unknown>);
      sendPaginated(res, productos, pagination);
    } catch (e) { next(e); }
  },

  async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ProductoService.obtenerPorId(req.params.id);
      sendSuccess(res, data);
    } catch (e) { next(e); }
  },

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      const data = await ProductoService.crear(req.body, req.user.sub);
      sendCreated(res, data, 'Producto creado correctamente');
    } catch (e) { next(e); }
  },

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      const data = await ProductoService.actualizar(req.params.id, req.body, req.user.sub);
      sendSuccess(res, data, 'Producto actualizado correctamente');
    } catch (e) { next(e); }
  },

  async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ProductoService.cambiarEstado(req.params.id, Boolean(req.body.activo));
      sendSuccess(res, data, data?.activo ? 'Producto activado' : 'Producto desactivado');
    } catch (e) { next(e); }
  },
};

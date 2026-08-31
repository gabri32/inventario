import { Request, Response, NextFunction } from 'express';
import { ProveedorService } from './proveedor.service';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/response';
import { AuthenticationError } from '../../utils/errors';

export const ProveedorController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { proveedores, pagination } = await ProveedorService.listar(req.query as Record<string, unknown>);
      sendPaginated(res, proveedores, pagination);
    } catch (e) { next(e); }
  },

  async obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, await ProveedorService.obtenerPorId(req.params.id));
    } catch (e) { next(e); }
  },

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendCreated(res, await ProveedorService.crear(req.body, req.user.sub), 'Proveedor creado correctamente');
    } catch (e) { next(e); }
  },

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) return next(new AuthenticationError());
      sendSuccess(res, await ProveedorService.actualizar(req.params.id, req.body, req.user.sub), 'Proveedor actualizado correctamente');
    } catch (e) { next(e); }
  },

  async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ProveedorService.cambiarEstado(req.params.id, Boolean(req.body.activo));
      sendSuccess(res, data, data?.activo ? 'Proveedor activado' : 'Proveedor desactivado');
    } catch (e) { next(e); }
  },
};
